import { NextApiResponse } from "next";
import {
  Connection,
  Transaction,
  VersionedTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SendTransactionError,
} from "@solana/web3.js";
import { supabase } from "@/lib/supabaseClient";
import { mintNFTWithBubbleGumTree } from "../../collection.helper";
import { NextResponse } from "next/server";

function verifyTransactionAmount(
  transaction: Transaction | VersionedTransaction,
  expectedAmount: number,
  tolerance: number = 0.01
): boolean {
  let foundTransfer = false;
  let transferAmount = 0;

  if (transaction instanceof VersionedTransaction) {
    const message = transaction.message;
    const accountKeys = message.staticAccountKeys;

    for (const instruction of message.compiledInstructions) {
      if (
        accountKeys[instruction.programIdIndex].equals(SystemProgram.programId)
      ) {
        const data = Buffer.from(instruction.data);
        // The first 4 bytes are the instruction discriminator for 'transfer'
        if (data.readUInt32LE(0) === 2) {
          transferAmount = Number(data.readBigUInt64LE(4)) / LAMPORTS_PER_SOL;
          foundTransfer = true;
          break;
        }
      }
    }
  } else {
    for (const instruction of transaction.instructions) {
      if (instruction.programId.equals(SystemProgram.programId)) {
        const data = instruction.data;
        // The first 4 bytes are the instruction discriminator for 'transfer'
        if (data.readUInt32LE(0) === 2) {
          transferAmount = Number(data.readBigUInt64LE(4)) / LAMPORTS_PER_SOL;
          foundTransfer = true;
          break;
        }
      }
    }
  }

  if (!foundTransfer) {
    console.log("No transfer instruction found in transaction");
    return false;
  }

  console.log(`Transaction amount: ${transferAmount} SOL`);
  console.log(`Expected amount: ${expectedAmount} SOL`);

  // Check if the amount is within the tolerance range
  const lowerBound = expectedAmount * (1 - tolerance);
  const upperBound = expectedAmount * (1 + tolerance);

  return transferAmount >= lowerBound && transferAmount <= upperBound;
}

const waitForTransactionConfirmation = async (
  signature: string,
  maxAttempts = 30
) => {
  for (let i = 0; i < maxAttempts; i++) {
    const confirmation = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    console.log(confirmation);

    if (
      confirmation &&
      confirmation.value &&
      confirmation.value.confirmationStatus === "confirmed"
    ) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before next check
  }
  throw new Error("Transaction confirmation timed out");
};

const connection = new Connection(process.env.RPC_URL!);

export async function POST(req: Request, res: NextApiResponse) {
  const { orderId, signedTransaction, priceInSol } = await req.json();

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Transaction not found" },
      { status: 400 }
    );
  }

  try {
    // Fetch order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select(
        "*, collectibles(name, metadata_uri, collections(merkle_tree_public_key, collection_mint_public_key))"
      )
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Invalid Tansaction" },
        { status: 400 }
      );
    }

    if (order.status == "completed") {
      throw new Error("No transaction found");
    }

    let txSignature = null;

    // For paid mints, verify and send transaction
    if (order.price_usd && order.price_usd > 0) {
      if (!signedTransaction) {
        return NextResponse.json(
          { success: false, error: "Missed transaction signature" },
          { status: 400 }
        );
      }
      let transaction;

      transaction = VersionedTransaction.deserialize(
        Buffer.from(signedTransaction, "base64")
      );

      // Verify transaction amount
      const isAmountCorrect = verifyTransactionAmount(transaction, priceInSol);
      if (!isAmountCorrect) {
        throw new Error("Transaction amount does not match the NFT price");
      }

      let txSignature;
      try {
        txSignature = await connection.sendRawTransaction(
          transaction.serialize(),
          {
            skipPreflight: true,
            maxRetries: 3,
          }
        );
        await waitForTransactionConfirmation(txSignature);
        console.log("Transaction confirmed");
      } catch (error) {
        if (error instanceof SendTransactionError) {
          // Check if the error is due to an expired blockhash
          if (error.message.includes("Blockhash not found")) {
            // Get a new blockhash
            const { blockhash, lastValidBlockHeight } =
              await connection.getLatestBlockhash();

            // Update the transaction with the new blockhash
            transaction.message.recentBlockhash = blockhash;

            // Retry sending the transaction
            txSignature = await connection.sendRawTransaction(
              transaction.serialize(),
              {
                skipPreflight: true,
                maxRetries: 3,
              }
            );
            console.log("Transaction sent. Signature:", txSignature);

            await waitForTransactionConfirmation(txSignature);
          } else {
            throw error; // Re-throw if it's not a blockhash issue
          }
        } else {
          throw error; // Re-throw if it's not a SendTransactionError
        }
      }
    }

    if (
      !order.collectibles ||
      !order.collectibles.collections ||
      !order.collectibles.collections.merkle_tree_public_key ||
      !order.collectibles.collections.collection_mint_public_key ||
      !order.collectibles.metadata_uri
    ) {
      return NextResponse.json(
        { success: false, error: "Something went wrong" },
        { status: 400 }
      );
    }

    // Mint NFT
    const mintResult = await mintNFTWithBubbleGumTree(
      order.collectibles.collections.merkle_tree_public_key,
      order.collectibles.collections.collection_mint_public_key,
      5, // sellerFeePercentage, adjust as needed
      order.wallet_address,
      order.collectibles.name,
      order.collectibles.metadata_uri
    );

    if (!mintResult.signature) {
      console.log("Failed to mint NFT");
      throw new Error("Failed to mint NFT");
    }
    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        transaction_signature: txSignature,
        mint_signature: mintResult.signature,
      })
      .eq("id", orderId);

    if (updateError) {
      throw new Error("Failed to update order");
    }

    return NextResponse.json(
      {
        success: true,
        txSignature,
        mintSignature: mintResult.signature,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing minting:", error);
    // Update order status to failed
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

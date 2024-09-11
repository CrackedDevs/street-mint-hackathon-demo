"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import ShimmerButton from "./magicui/shimmer-button";
import {
  checkMintEligibility,
  Collectible,
  Collection,
  createOrder,
  getExistingOrder,
} from "@/lib/supabaseClient";
import { generateDeviceId } from "@/lib/fingerPrint";

export default function MintButton({
  collectible,
  collection,
}: {
  collectible: Collectible;
  collection: Collection;
}) {
  const { connected, connect, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isMinting, setIsMinting] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [deviceId, setDeviceId] = useState("");
  const [existingOrder, setExistingOrder] = useState<any | null>(null);

  useEffect(() => {
    async function fetchDeviceId() {
      const id = await generateDeviceId();
      setDeviceId(id);
    }
    fetchDeviceId();
  }, []);

  useEffect(() => {
    async function checkEligibilityAndExistingOrder() {
      if (connected && publicKey && deviceId) {
        try {
          const { eligible, reason } = await checkMintEligibility(
            publicKey.toString(),
            collectible.id,
            deviceId
          );
          setIsEligible(eligible);
          if (!eligible) {
            setError(reason || "You are not eligible to mint this NFT.");
          } else {
            setError(null);
          }

          // Check for existing order
          const order = await getExistingOrder(
            publicKey.toString(),
            collectible.id
          );
          setExistingOrder(order);
          if (order) {
            setTransactionSignature(order.transaction_signature);
          }
        } catch (error) {
          console.error("Error checking eligibility or existing order:", error);
          setError("Failed to check minting eligibility.");
          setIsEligible(false);
        }
      } else {
        setIsEligible(false);
        setExistingOrder(null);
      }
    }

    checkEligibilityAndExistingOrder();
  }, [connected, publicKey, deviceId, collectible.id]);

  const handlePaymentAndMint = async () => {
    if (!publicKey || !isEligible) {
      return;
    }
    setIsMinting(true);
    setError(null);

    try {
      let signature = "";

      if (collectible.price_usd > 0) {
        // Calculate the price in SOL and create a transaction only if the NFT is not free
        const solPrice = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const solPriceData = await solPrice.json();
        const solPriceUSD = solPriceData.solana.usd;
        const priceInSol = collectible.price_usd / solPriceUSD;
        const lamports = Math.round(priceInSol * LAMPORTS_PER_SOL);

        // Create a payment transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET!),
            lamports,
          })
        );

        // Send the payment transaction to the user's wallet for approval
        signature = await sendTransaction(transaction, connection);

        // Wait for transaction confirmation
        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error("Transaction failed");
        }
      }

      // Proceed with minting the NFT
      const mintRequestBody = {
        collectionMintPublicKey: collection.collection_mint_public_key,
        merkleTreePublicKey: collection.merkle_tree_public_key,
        sellerFeePercentage: 5,
        minterAddress: publicKey.toString(),
        name: collectible.name,
        metadata_uri: collectible.metadata_uri || "",
      };

      const response = await fetch("/api/collection/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mintRequestBody),
      });

      const data = await response.json();

      if (data.success) {
        console.log("NFT minted successfully:", data.result);

        // Create order after successful mint
        const order = await createOrder(
          publicKey.toString(),
          collectible.id,
          deviceId,
          data.result.signature || signature
        );

        toast({
          title: "NFT Minted Successfully",
          description: `Transaction: ${data.result.signature || "Free NFT"}`,
        });
        setTransactionSignature(data.result.signature || signature);
        setExistingOrder(order);
        setIsEligible(false);
      } else {
        throw new Error(data.error || "Failed to mint NFT");
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      toast({
        title: "Minting Failed",
        description:
          error.message ||
          "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setError("An unexpected error occurred");
    } finally {
      setIsMinting(false);
    }
  };

  const handleMintClick = async () => {
    if (!connected) {
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        return;
      }
    }

    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    if (!deviceId) {
      toast({
        title: "Error",
        description: "Unable to get device ID",
        variant: "destructive",
      });
      return;
    }

    if (!isEligible) {
      toast({
        title: "Error",
        description: "You are not eligible to mint this NFT",
        variant: "destructive",
      });
      return;
    }

    await handlePaymentAndMint();
  };

  const getButtonText = () => {
    if (isMinting) return "PROCESSING...";
    if (existingOrder) return "ALREADY MINTED";
    if (isEligible) return `MINT NOW ($${collectible.price_usd})`;
    return "NOT ELIGIBLE";
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {connected ? (
        <ShimmerButton
          borderRadius="6px"
          className="w-full mb-4 bg-black text-white hover:bg-gray-800 h-[40px] rounded font-bold"
          onClick={handleMintClick}
          disabled={isMinting || !isEligible || existingOrder}
        >
          {getButtonText()}
        </ShimmerButton>
      ) : (
        <WalletMultiButton
          style={{
            backgroundColor: "black",
            width: "100%",
            marginBottom: "20px",
            borderRadius: "6px",
          }}
        />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {transactionSignature && (
        <a
          href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 mt-2 hover:underline"
        >
          View Transaction
        </a>
      )}
    </div>
  );
}

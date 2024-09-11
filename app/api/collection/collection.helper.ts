import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  Umi,
  PublicKey,
  generateSigner,
  TransactionBuilderSendAndConfirmOptions,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
  percentAmount,
} from "@metaplex-foundation/umi";

import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { decode, encode } from "bs58";
import {
  createTree,
  mplBubblegum,
  mintV1 as mintV1BubbleGum,
  mintToCollectionV1,
} from "@metaplex-foundation/mpl-bubblegum";
import { Collection } from "@/lib/supabaseClient";

// Common Umi initialization function
function initializeUmi(endpoint: string, privateKey: string): Umi {
  const umi = createUmi(endpoint).use(mplTokenMetadata()).use(mplBubblegum());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    privateKeyToUint8Array(privateKey)
  );
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));
  return umi;
}

function privateKeyToUint8Array(privateKeyString: string): Uint8Array {
  return new Uint8Array(decode(privateKeyString));
}

export async function createBubbleGumTree(collectionData: Collection) {
  const umi = initializeUmi(process.env.RPC_URL!, process.env.PRIVATE_KEY!);
  const collectionMint = generateSigner(umi);
  const merkleTree = generateSigner(umi);

  try {
    if (!collectionData) {
      throw new Error("No collection data found");
    }

    const collectionTx = await createNft(umi, {
      mint: collectionMint,
      name: collectionData.name,
      uri: collectionData.metadata_uri || "",
      sellerFeeBasisPoints: percentAmount(5), // 5.5%
      isCollection: true,
    }).sendAndConfirm(umi);

    console.log(
      `✅ Created collection: ${collectionMint.publicKey.toString()}`
    );
    // console.log(`Collection transaction: ${collectionTx.signature.toString()}`);

    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: 14,
      maxBufferSize: 64,
    });
    const tx = await builder.sendAndConfirm(umi);

    console.log(
      `✅ Created Bubble Gum Tree: ${merkleTree.publicKey.toString()}`
    );
    // console.log(`Tree transaction: ${tx.signature.toString()}`);

    return {
      merkleTreePublicKey: merkleTree.publicKey.toString(),
      collectionMintPublicKey: collectionMint.publicKey.toString(),
    };
  } catch (error) {
    console.error("Error in createBubbleGumTree:", error);
    throw error;
  }
}

export async function mintNFTWithBubbleGumTree(
  merkleTreePublicKey: string,
  collectionMintPublicKey: string,
  sellerFeePercentage: number,
  minterAddress: string,
  name: string,
  metadata_uri: string
) {
  const umi = initializeUmi(process.env.RPC_URL!, process.env.PRIVATE_KEY!);
  try {
    console.log(merkleTreePublicKey, collectionMintPublicKey, minterAddress);
    const merkleTree = publicKey(merkleTreePublicKey);
    const leafOwner = publicKey(minterAddress);
    const collectionMintPubkey = publicKey(collectionMintPublicKey);
    const collectionAsset = await fetchDigitalAsset(umi, collectionMintPubkey);

    console.log(
      "Collection mint fetched:",
      collectionAsset.publicKey.toString()
    );

    // Convert percentage to basis points (1% = 100 basis points)
    const sellerFeeBasisPoints = Math.round(sellerFeePercentage * 100);

    const tx = await mintToCollectionV1(umi, {
      leafOwner: leafOwner,
      merkleTree,
      collectionMint: collectionMintPubkey,
      metadata: {
        name: name,
        uri: metadata_uri,
        sellerFeeBasisPoints: sellerFeeBasisPoints,
        collection: { key: collectionMintPubkey, verified: true },
        creators: [
          { address: umi.identity.publicKey, verified: true, share: 100 },
        ],
      },
    }).sendAndConfirm(umi);
    console.log("Minting transaction completed:", tx.signature.toString());

    const txSignature = encode(tx.signature);
    const solscanLink = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
    return { signature: txSignature, solscanLink: solscanLink };
  } catch (error) {
    console.error("Error minting NFT with BubbleGum Tree:", error);
    throw error;
  }
}

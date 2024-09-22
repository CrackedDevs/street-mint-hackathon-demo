import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  Umi,
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";

import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import {
  mplBubblegum,
  mintToCollectionV1,
  findLeafAssetIdPda,
  LeafSchema,
  parseLeafFromMintToCollectionV1Transaction,
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
  return new Uint8Array(bs58.decode(privateKeyString));
}

export async function createBubbleGumTree(collectionData: Collection) {
  const umi = initializeUmi(process.env.RPC_URL!, process.env.PRIVATE_KEY!);
  const collectionMint = generateSigner(umi);
  const merkleTree = generateSigner(umi);

  try {
    if (!collectionData) {
      throw new Error("No collection data found");
    }

    console.log(
      `✅ Created collection: ${collectionMint.publicKey.toString()}`
    );

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

    const leaf: LeafSchema = await parseLeafFromMintToCollectionV1Transaction(umi, tx.signature);
    const assetId = findLeafAssetIdPda(umi, { merkleTree, leafIndex: leaf.nonce });

    const tokenAddress = assetId.toString().split(",")[0];

    const txSignature = bs58.encode(tx.signature);
    const solscanLink =
      process.env.NODE_ENV === "development"
        ? `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
        : `https://explorer.solana.com/tx/${txSignature}`;

    return { signature: txSignature, solscanLink: solscanLink, tokenAddress };
  } catch (error) {
    console.error("Error minting NFT with BubbleGum Tree:", error);
    throw error;
  }
}

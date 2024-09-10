import { NextResponse } from "next/server";
import { mintNFTWithBubbleGumTree } from "../collection.helper";

type MintRequestBody = {
  collectionMintPublicKey: string;
  merkleTreePublicKey: string;
  sellerFeePercentage: number;
  minterAddress: string;
  name: string;
  metadata_uri: string;
};

export async function POST(request: Request) {
  try {
    const {
      collectionMintPublicKey,
      merkleTreePublicKey,
      sellerFeePercentage,
      minterAddress,
      name,
      metadata_uri,
    }: MintRequestBody = await request.json();

    if (
      !collectionMintPublicKey ||
      !merkleTreePublicKey ||
      !sellerFeePercentage ||
      !minterAddress
    ) {
      throw new Error("Missing required fields");
    }

    const result = await mintNFTWithBubbleGumTree(
      merkleTreePublicKey,
      collectionMintPublicKey,
      sellerFeePercentage,
      minterAddress,
      name,
      metadata_uri
    );

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("Error minting NFT:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mint NFT" },
      { status: 500 }
    );
  }
}

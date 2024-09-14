import { NextResponse } from "next/server";
import { mintNFTWithBubbleGumTree } from "../collection.helper";
import { checkMintEligibility } from "@/lib/supabaseClient";

type MintRequestBody = {
  collectionMintPublicKey: string;
  merkleTreePublicKey: string;
  sellerFeePercentage: number;
  minterAddress: string;
  name: string;
  metadata_uri: string;
  collectibleId: number;
  deviceId: string;
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
      collectibleId,
      deviceId,
    }: MintRequestBody = await request.json();

    if (
      !collectionMintPublicKey ||
      !merkleTreePublicKey ||
      !sellerFeePercentage ||
      !minterAddress ||
      !collectibleId ||
      !deviceId
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check eligibility
    const { eligible, reason } = await checkMintEligibility(
      minterAddress,
      collectibleId,
      deviceId
    );

    if (!eligible) {
      return NextResponse.json(
        { success: false, error: reason || "Not eligible to mint" },
        { status: 403 }
      );
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

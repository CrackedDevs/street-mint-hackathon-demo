import { NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { checkMintEligibility, supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: NextApiResponse) {
  const { collectibleId, walletAddress, deviceId, collectionId } =
    await req.json();

  if (!collectibleId || !walletAddress) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Fetch collectible details
    const { data: collectible, error: collectibleError } = await supabase
      .from("collectibles")
      .select("*, collections(id)")
      .eq("id", collectibleId)
      .single();

    if (collectibleError || !collectible) {
      throw new Error("Failed to fetch collectible");
    }

    // Check eligibility
    const { eligible, reason } = await checkMintEligibility(
      walletAddress,
      collectibleId,
      deviceId
    );

    if (!eligible) {
      return NextResponse.json(
        {
          success: false,
          error: "Already minted or minting in progress for this NFT",
        },
        { status: 400 }
      );
    }

    // Create order in database
    const { data: order, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        id: uuidv4(),
        wallet_address: walletAddress,
        collectible_id: collectibleId,
        collection_id: collectionId,
        status: "pending",
        price_usd: collectible.price_usd,
        nft_type: collectible.quantity_type,
        max_supply: collectible.quantity || null, // Use null for unlimited supply
        device_id: deviceId,
      })
      .select()
      .single();

    if (insertError || !order) {
      throw new Error("Failed to create order");
    }

    return NextResponse.json(
      { success: true, orderId: order.id, isFree: order.price_usd === 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error initiating minting:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

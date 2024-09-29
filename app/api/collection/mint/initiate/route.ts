import { NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { checkMintEligibility, supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdminClient";

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

    console.log("Eligible:", eligible);
    console.log("Reason:", reason);

    if (!eligible) {
      return NextResponse.json(
        {
          success: false,
          error: "Already minted or minting in progress for this NFT" + reason,
        },
        { status: 400 }
      );
    }

    // Create order in database
    const supabaseAdmin = await getSupabaseAdmin();
    let order;
    try {
      const { data, error: insertError } = await supabaseAdmin
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

      if (insertError) throw insertError;
      order = data;
    } catch (insertError) {
      console.error("Error creating order:", insertError);
      // If there's an error, update the order status to 'failed'
      if (order && order.id) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "failed" })
          .eq("id", order.id);
      }
      throw new Error("Failed to create order");
    }

    if (!order) {
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

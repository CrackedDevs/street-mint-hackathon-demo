import { getSupabaseAdmin } from "@/lib/supabaseAdminClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collectibleId, nfcPublicKey, artistPassword } = body;

    if (!collectibleId || !nfcPublicKey || !artistPassword) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Collectible ID, NFC public key, and artist password are required",
        },
        { status: 400 }
      );
    }

    const supabaseClient = await getSupabaseAdmin();
    const { data: collectible } = await supabaseClient
      .from("collectibles")
      .select("collection_id")
      .eq("id", collectibleId)
      .single();

    if (!collectible) {
      return NextResponse.json(
        { success: false, error: "Collectible not found" },
        { status: 404 }
      );
    }

    const { data: artist } = await supabaseClient
      .from("collections")
      .select("artists(app_password)")
      .eq("id", collectible.collection_id)
      .single();

    if (!artist) {
      return NextResponse.json(
        { success: false, error: "Artist not found" },
        { status: 404 }
      );
    }

    if (!artistPassword) {
      return NextResponse.json(
        { success: false, error: "Artist password not found" },
        { status: 404 }
      );
    }

    if (
      artistPassword !== artist.artists?.app_password &&
      artistPassword !== process.env.APP_ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, error: "Artist password is incorrect" },
        { status: 401 }
      );
    }

    const { data: oldCollectible } = await supabaseClient
      .from("collectibles")
      .select("nfc_public_key, id")
      .eq("nfc_public_key", nfcPublicKey);

    await supabaseClient
      .from("collectibles")
      .update({ nfc_public_key: nfcPublicKey })
      .eq("id", collectibleId);

    if (oldCollectible && oldCollectible.length > 0) {
      oldCollectible.forEach(async (collectible) => {
        await supabaseClient
          .from("collectibles")
          .update({ nfc_public_key: null })
          .eq("id", collectible.id);
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating NFC public key:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update NFC public key" },
      { status: 500 }
    );
  }
}

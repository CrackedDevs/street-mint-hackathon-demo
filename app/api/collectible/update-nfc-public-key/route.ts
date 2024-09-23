import { getSupabaseAdmin } from "@/lib/supabaseAdminClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log(authHeader);
    if (authHeader !== `Bearer ${process.env.API_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
    const body = await request.json();
    const { collectibleId, nfcPublicKey } = body;

    if (!collectibleId || !nfcPublicKey) {
        return NextResponse.json({success: false, error: "Collectible ID or NFC public key is required"}, { status: 400 });
    }
    const supabaseClient = await getSupabaseAdmin();
    const { data: oldCollectible } = await supabaseClient.from('collectibles').select('nfc_public_key, id').eq('nfc_public_key', nfcPublicKey);

    await supabaseClient.from('collectibles').update({ nfc_public_key: nfcPublicKey }).eq('id', collectibleId);

    if (oldCollectible && oldCollectible.length > 0) {
        oldCollectible.forEach(async (collectible) => {
            await supabaseClient.from('collectibles').update({ nfc_public_key: null }).eq('id', collectible.id);
        });
    }


    return NextResponse.json({success: true}, { status: 200 });
  } catch (error) {
    console.error('Error updating NFC public key:', error);
    return NextResponse.json(
      { success: false, error: "Failed to update NFC public key" },
      { status: 500 }
    );
  }
}
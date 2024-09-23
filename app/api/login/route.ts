import * as nacl from "tweetnacl";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { NumericUUID } from "@/lib/utils";

const getOrCreateArtist = async (walletAddress: string) => {
  try {
    let { data: user, error } = await supabase
      .from("artists")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (!user) {
      const { data, error } = await supabaseAdmin
        .from("artists")
        .insert({
          id: NumericUUID(),
          wallet_address: walletAddress,
          avatar_url: "",
          bio: "",
          email: "",
          username: walletAddress.slice(0, 8),
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting new artist:", error);
        throw new Error("Failed to create new artist");
      }

      user = data;
    }

    return user;
  } catch (error) {
    console.error("Error in getOrCreateArtist:", error);
    throw new Error("Failed to get or create artist");
  }
};

export async function POST(req: any, res: NextApiResponse) {
  const body = await req.json();
  const { publicKey, signature, walletAddress } = body;
  // Convert publicKey and signature from base64 or hex to Uint8Array
  const decodedPublicKey = Uint8Array.from(Buffer.from(publicKey, "base64")); // Assuming base64 encoded
  const decodedSignature = Uint8Array.from(Buffer.from(signature, "base64")); // Assuming base64 encoded
  // Encode the message as Uint8Array
  const message = new TextEncoder().encode(
    "Please sign this message to authenticate"
  );
  // Verify the signature
  const isValidSignature = nacl.sign.detached.verify(
    message,
    decodedSignature,
    decodedPublicKey
  );

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" });
  }
  let user;
  try {
    user = await getOrCreateArtist(walletAddress);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message });
  }
  const email = `${walletAddress}@example.com`;
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password: walletAddress, // Not recommended, but for simplicity use wallet address as password
    });
  if (
    signInError &&
    signInError.message.includes("Invalid login credentials")
  ) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password: walletAddress,
        options: {
          data: {
            wallet_address: walletAddress,
            artist_id: user.id,
          },
        },
      }
    );
    if (signUpError) {
      console.error("Error signing up:", signUpError);
      return NextResponse.json({ error: "Failed to sign up" });
    }
    return NextResponse.json({ token: signUpData.session?.access_token });
  }
  if (signInError) {
    console.error("Error signing in:", signInError);
    return NextResponse.json({ error: "Failed to sign in" });
  }
  if (!signInData.session) {
    return res.status(401).json({ error: "Authentication failed" });
  }
  const token = signInData.session.access_token;
  return NextResponse.json({ token });
}

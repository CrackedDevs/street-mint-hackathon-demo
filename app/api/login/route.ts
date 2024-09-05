import * as nacl from "tweetnacl";
import { createClient } from "@supabase/supabase-js";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  let { data: user, error } = await supabase
    .from("artists")
    .select("*")
    .eq("wallet_address", publicKey)
    .single();
  if (!user) {
    const { data, error } = await supabase
      .from("artists")
      .insert([{ wallet_address: publicKey }])
      .single();
    user = data;
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

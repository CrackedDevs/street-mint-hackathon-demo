import { TipLink } from "@tiplink/api";

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection(process.env.RPC_URL!);
const feePayerPrivateKey = process.env.PRIVATE_KEY!;
const FUND_AMOUNT = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL

export async function createTipLink(): Promise<{
  publicKey: string;
  url: string;
} | null> {
  try {
    const tiplink = await TipLink.create();

    return {
      publicKey: tiplink.keypair.publicKey.toBase58(),
      url: tiplink.url.toString(),
    };
  } catch (error: any) {
    console.error("Error creating TipLink:", error);
    return null;
  }
}

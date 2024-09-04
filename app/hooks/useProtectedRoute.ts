import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

export function useProtectedRoute() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connected) {
      router.push("/"); // Redirect to home page if not connected
    }
  }, [connected, router]);

  return connected;
}

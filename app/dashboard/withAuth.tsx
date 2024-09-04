"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const WithAuth = (props: any) => {
    const { connected, connecting, publicKey } = useWallet();
    const router = useRouter();
    const [isWalletLoaded, setIsWalletLoaded] = useState(false);

    useEffect(() => {
      setIsWalletLoaded(true);
    }, []);

    useEffect(() => {
      if (isWalletLoaded && !publicKey && !connected && !connecting) {
        router.push("/dashboard");
      }
    }, [publicKey, isWalletLoaded, router]);

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
  return WithAuth;
};

// Helper function to get the display name of a component
function getDisplayName(WrappedComponent: React.ComponentType<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withAuth;

"use client";

import { Collectible, Collection } from "@/lib/supabaseClient";
import ShimmerButton from "./magicui/shimmer-button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type MintRequestBody = {
  collectionMintPublicKey: string;
  merkleTreePublicKey: string;
  sellerFeePercentage: number;
  minterAddress: string;
  name: string;
  metadata_uri: string;
};

export default function MintButton({ collectible, collection }: { collectible: Collectible; collection: Collection }) {
  const { connected, connect } = useWallet();
  const { publicKey } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<any | null>(null);


  const MintFunction = () => {
    const handleMint = async () => {
      if (!publicKey) {
        setError("Please connect your wallet first.");
        return;
      }
      setIsMinting(true);
      setError(null);
      setMintResult(null);

      try {
        if (!collection.collection_mint_public_key || !collection.merkle_tree_public_key) {
          setError("Collection mint public key or merkle tree public key is not set.");
          return;
        }
        const mintRequestBody: MintRequestBody = {
          collectionMintPublicKey: collection.collection_mint_public_key,
          merkleTreePublicKey: collection.merkle_tree_public_key,
          sellerFeePercentage: 5, // Assuming seller_fee_basis_points is in basis points
          minterAddress: publicKey.toString(),
          name: collectible.name,
          metadata_uri: collectible.metadata_uri || "",
        };

        const response = await fetch("/api/collection/mint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mintRequestBody),
        });
        const data = await response.json();

        if (data.success) {
          console.log("NFT minted successfully:", data.result);
          setMintResult(data.result);
          toast({
            title: "NFT Minted Successfully",
            description: `Transaction: ${data.result}`,
          });
        } else {
          setError(data.error || "Failed to mint NFT");
        }
      } catch (error) {
        console.error("Error minting NFT:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsMinting(false);
      }
    };

    return { handleMint, isMinting, error };
  };

  const { handleMint } = MintFunction();

  const handleMintClick = async () => {
    if (!connected) {
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      await handleMint();
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {connected ? (
        <ShimmerButton
          borderRadius="6px"
          className="w-full mb-4 bg-black text-white hover:bg-gray-800 h-[40px] rounded font-bold"
          onClick={handleMintClick}
          disabled={isMinting}
        >
          {isMinting ? "MINTING..." : "MINT NOW"}
        </ShimmerButton>
      ) : (
        <WalletMultiButton
          style={{ backgroundColor: "black", width: "100%", marginBottom: "20px", borderRadius: "6px" }}
        />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

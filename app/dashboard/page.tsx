"use client";
import { useState, useEffect } from "react";
import RetroGrid from "@/components/magicui/retro-grid";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/providers/UserProfileProvider";
import Page from "@/app/dashboard/profile/page";
import { useCandyMachine } from "../providers/candyMachineProvider";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const { connected, connecting, wallet } = useWallet();
  const { isLoading } = useUserProfile();
  const { umi, setupCandyMachineAndCreateCollection } = useCandyMachine();
  const router = useRouter();
  const { userProfile } = useUserProfile();

  const [profileNotComplete, setProfileNotComplete] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileNotComplete(connected && !isLoading && userProfile && !userProfile.email);
    }
  }, [userProfile]);

  const handleConnect = () => {
    const button = document.querySelector(".wallet-adapter-button") as HTMLElement;
    if (button) {
      button.click();
    }
  };

  const [collectionData, setCollectionData] = useState<{
    candyMachinePublicKey?: string;
    collectionMintPublicKey: string;
    treasuryPublicKey?: string;
    merkleTreePublicKey: string;
  } | null>(null);

  // const [merkleTreePublicKey, setMerkleTreePublicKey] = useState<string | null>(null);

  const handleCreateCandyMachine = async () => {
    try {
      const response = await fetch("/api/collection/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data.result);

      if (data.success) {
        setCollectionData({
          collectionMintPublicKey: data.result.collectionMintPublicKey,
          merkleTreePublicKey: data.result.merkleTreePublicKey,
        });
      } else {
        console.error("Failed to create candy machine:", data.error);
      }
    } catch (error) {
      console.error("Error creating candy machine:", error);
    }
  };

  const handleMintNFT = async () => {
    // if (!collectionData) {
    //   console.error("Collection data is not available. Please create a candy machine first.");
    //   return;
    // }

    try {
      const response = await fetch("/api/collection/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // candyMachinePublicKey: collectionData.candyMachinePublicKey,
          // collectionMintPublicKey: collectionData.collectionMintPublicKey,
          merkleTreePublicKey: collectionData?.merkleTreePublicKey,
          collectionMintPublicKey: collectionData?.collectionMintPublicKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("NFT minted successfully:", data.result);
        // You can add further actions here, such as updating the UI or showing a success message
      } else {
        console.error("Failed to mint NFT:", data.error);
        // Handle the error, maybe show an error message to the user
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      // Handle any network or unexpected errors
    }
  };

  const handleGoToCollection = () => {
    router.push("/dashboard/collection");
  };

  return (
    <>
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 relative overflow-hidden sm:mx-0 mx-2">
        <RetroGrid />

        <div className="w-full flex flex-col items-center justify-center">
          {profileNotComplete ? (
            <Page />
          ) : (
            <div className="text-center relative z-10 px-4 flex flex-col items-center justify-center mb-6">
              <h2 className="pointer-events-none z-10 whitespace-pre-wrap text-black text-center text-7xl font-bold leading-none mb-4">
                Start Creating Collectibles
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-raleway">
                Start selling your digital collectibles in minutes.
              </p>
              {isLoading ? (
                <ShimmerButton className="shadow-2xl">
                  <div className="flex items-center w-16 h-6 justify-center">
                    <div className="animate-spin text-white rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  </div>
                </ShimmerButton>
              ) : connected ? (
                <ShimmerButton className="shadow-2xl" onClick={handleGoToCollection}>
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Create Collection!
                  </span>
                </ShimmerButton>
              ) : (
                <ShimmerButton className="shadow-2xl" onClick={handleConnect}>
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Connect Wallet
                  </span>
                </ShimmerButton>
              )}
              <div className="hidden">
                <WalletMultiButton />
              </div>
            </div>
          )}
          <Button onClick={handleCreateCandyMachine}>Create Candy Machine</Button>
          <Button className="mt-2" onClick={handleMintNFT}>
            Mint NFT
          </Button>
          {collectionData && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Collection Data</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Candy Machine Public Key:</p>
                  <p className="text-sm break-all">{collectionData.candyMachinePublicKey}</p>
                </div>
                <div>
                  <p className="font-semibold">Collection Mint Public Key:</p>
                  <p className="text-sm break-all">{collectionData.collectionMintPublicKey}</p>
                </div>
                <div>
                  <p className="font-semibold">Treasury Public Key:</p>
                  <p className="text-sm break-all">{collectionData.treasuryPublicKey}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

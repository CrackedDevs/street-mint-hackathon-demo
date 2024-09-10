"use client";
import { useState, useEffect } from "react";
import RetroGrid from "@/components/magicui/retro-grid";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/providers/UserProfileProvider";
import Page from "@/app/dashboard/profile/page";

const DashboardPage = () => {
  const { connected, connecting } = useWallet();
  const { isLoading } = useUserProfile();
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
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

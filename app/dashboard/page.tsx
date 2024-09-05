"use client";
import { useState, useEffect } from "react";
import RetroGrid from "@/components/magicui/retro-grid";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { fetchProfileData } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  const handleConnect = () => {
    const button = document.querySelector(
      ".wallet-adapter-button"
    ) as HTMLElement;
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
        <div className="text-center relative z-10 px-4 flex flex-col items-center justify-center mb-6">
          <h2 className="pointer-events-none z-10 whitespace-pre-wrap text-black text-center text-7xl font-bold leading-none mb-4">
            Start Selling NFT&apos;s
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-raleway">
            Start selling your digital collectibles in minutes.
          </p>
          {connected ? (
            <ShimmerButton
              className="shadow-2xl"
              onClick={handleGoToCollection}
            >
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
      </div>
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .font-playfair {
          font-family: "Playfair Display", serif;
        }
        .font-raleway {
          font-family: "Raleway", sans-serif;
        }
      `}</style>
    </>
  );
};

export default DashboardPage;

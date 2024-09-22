"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ShimmerButton from "@/components/magicui/shimmer-button";
import RetroGrid from "@/components/magicui/retro-grid";
import { GalleryHeader } from "./galleryHeader";
import { GalleryGrid, View } from "./galleryGrid";
import DotPattern from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

export default function MyGallery() {
  const { connected, connecting } = useWallet();

  const handleConnect = () => {
    const button = document.querySelector(".wallet-adapter-button") as HTMLElement;
    if (button) button.click();
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <GalleryHeader />
      <div>
        {
          !connected ? (
            <RetroGrid />
          ) : (
            <DotPattern
        className={cn(
          "absolute inset-0 w-full h-full z-0",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        )}
      />
          )
        }
          {!connected ? (
              <div className="z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center px-4 max-w-2xl">
                <h2 className="text-7xl font-bold text-black mb-4">
                  Collectibles Gallery
                </h2>
                <p className="text-xl text-gray-600 mb-8 font-raleway">
                  Connect your wallet to view your digital collectibles.
                </p>
                <ShimmerButton
                  className="shadow-2xl"
                  onClick={() => handleConnect()}
                  disabled={connecting}
                >
                  {connecting ? (
                    <div className="flex items-center w-16 h-6 justify-center">
                      <div className="animate-spin text-white rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                      Connect Wallet
                    </span>
                  )}
                </ShimmerButton>
            </div>
          ) : (
            <GalleryGrid />
            )
        }
        <div className="hidden">
                <WalletMultiButton />
              </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { PaletteIcon, UserIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import ConnectedWalletWidget from "@/components/connectedWalletWidget";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserProfile } from "@/app/providers/UserProfileProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const { userProfile, isLoading } = useUserProfile();

  const showNavbarItems = userProfile && !isLoading && userProfile.email;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navbar */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-200 bg-white z-50">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Image src="/logo.svg" alt="Street mint logo" width={250} height={100} className="h-10 w-auto" />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {publicKey && showNavbarItems && (
            <>
              <Link href="/dashboard/collection">
                <Button variant="ghost">
                  <PaletteIcon className="h-5 w-5 mr-2" />
                  Collections
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="ghost">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Profile
                </Button>
              </Link>
            </>
          )}
          <ConnectedWalletWidget />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

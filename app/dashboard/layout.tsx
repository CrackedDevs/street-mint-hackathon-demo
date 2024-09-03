"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PaletteIcon, UserIcon, MenuIcon } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navbar */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center">
          <Button variant="ghost" onClick={toggleSidebar} className="mr-2 md:hidden block">
            <MenuIcon className="h-6 w-6" />
          </Button>

          <Link href="/dashboard">
            <Image src="/logo.svg" alt="Street mint logo" width={250} height={100} className="h-10 w-auto" />
          </Link>
        </div>
        <WalletMultiButton
          style={{
            background: "linear-gradient(to right, #ffffff, #f0f0f0)",
            color: "black",
            border: "2px solid gray",
            borderRadius: "20px",
          }}
        />
      </header>

      <div className="flex flex-1">
        <aside
          className={`bg-black border-r border-gray-800 w-64 p-4 transition-all duration-300
            ${isSidebarOpen ? "block" : "hidden"}
            md:block
            md:static
            absolute z-10 h-full md:h-auto
          `}
        >
          <nav>
            <Link href="/dashboard/collection">
              <Button
                variant="ghost"
                onClick={toggleSidebar}
                className="w-full justify-start mb-2 hover:text-black text-white hover:bg-white"
              >
                <PaletteIcon className="mr-2 h-4 w-4" />
                Create Art
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button
                variant="ghost"
                onClick={toggleSidebar}
                className="w-full justify-start hover:text-black text-white hover:bg-white"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaletteIcon, UserIcon } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navbar */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center">
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
          className={`bg-inherit border-r border-gray-200 w-64 p-4 ${
            isSidebarOpen ? "" : "hidden"
          } transition-all duration-300`}
        >
          <nav>
            <Link href="/dashboard/collection">
              <Button variant="ghost" className="w-full justify-start mb-2 ">
                <PaletteIcon className="mr-2 h-4 w-4" />
                Create Art
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full justify-start ">
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}

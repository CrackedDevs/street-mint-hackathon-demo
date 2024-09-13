"use client";

import { Button } from "@/components/ui/button";
import { PaletteIcon, UserIcon, MenuIcon, Bolt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

import { UserProfileProvider } from "@/app/providers/UserProfileProvider";
import DashboardHeader from "@/components/DashboardHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Navbar */}
        <DashboardHeader />
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 w-full">{children}</main>
        </div>
        <Toaster />
      </div>
    </UserProfileProvider>
  );
}

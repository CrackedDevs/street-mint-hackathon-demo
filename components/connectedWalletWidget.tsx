import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Plug, User } from "lucide-react";
import { shortenAddress } from "@/lib/shortenAddress";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/providers/UserProfileProvider";

const ConnectedWalletWidget = () => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const { userProfile, isLoading, handleDisconnect } = useUserProfile();

  if (!connected || isLoading) {
    return <></>;
  }

  return (
    <>
      <div className="sm:hidden">
        {/* Visible only on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Connected wallet: ${publicKey}`}
            >
              <Wallet className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            {userProfile ? (
              <>
                <DropdownMenuItem className="flex  items-center">
                  <Avatar className="w-10 h-10 mr-2">
                    <AvatarImage
                      src={userProfile.avatar_url}
                      alt={userProfile.username}
                    />
                    <AvatarFallback className="text-lg">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {userProfile.username}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="flex justify-between items-center">
                <span className="font-medium">Connected</span>
                <span className="text-sm text-muted-foreground">
                  {shortenAddress(publicKey?.toString() || "")}
                </span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDisconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="hidden sm:block">
        {/* Visible on screens sm and larger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="text-sm font-medium h-fit py-2 px-6"
              aria-label={`Connected wallet: ${publicKey}`}
            >
              {userProfile ? (
                <>
                  <Avatar className="w-10 h-10 mr-2">
                    <AvatarImage
                      src={userProfile.avatar_url}
                      alt={userProfile.username}
                    />
                    <AvatarFallback className="text-lg">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {userProfile.username}
                </>
              ) : (
                <>
                  <span
                    className="w-2 h-2 bg-green-500 rounded-full mr-2"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Connected:</span>
                  {shortenAddress(publicKey?.toString() || "")}
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default ConnectedWalletWidget;

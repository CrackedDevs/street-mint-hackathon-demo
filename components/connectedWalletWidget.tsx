import { useState, useEffect } from "react";
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
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConnectedWalletWidgetProps {
  connected: boolean;
  walletAddress: string | null;
  onDisconnect: () => void;
}

const ConnectedWalletWidget: React.FC<ConnectedWalletWidgetProps> = ({ connected, walletAddress, onDisconnect }) => {
  const { select } = useWallet();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (connected && walletAddress) {
        const { data, error } = await supabase.from("artists").select("*").eq("wallet_address", walletAddress).single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setUserData(data);
        }
      }
    };

    fetchUserData();
  }, [connected, walletAddress]);

  if (!connected || !walletAddress) {
    return (
      <WalletMultiButton
        style={{
          backgroundColor: "white",
          color: "black",
          border: "1px solid black",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <Plug className="mr-2 h-4 w-4" />
        Connect Wallet
      </WalletMultiButton>
    );
  }

  return (
    <>
      <div className="sm:hidden">
        {" "}
        {/* Visible only on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Connected wallet: ${walletAddress}`}>
              <Wallet className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            {userData ? (
              <>
                <DropdownMenuItem className="flex  items-center">
                  <Avatar className="w-10 h-10 mr-2">
                    <AvatarImage src={userData.avatar_url} alt={userData.username} />
                    <AvatarFallback className="text-lg">{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {userData.username}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="flex justify-between items-center">
                <span className="font-medium">Connected</span>
                <span className="text-sm text-muted-foreground">{shortenAddress(walletAddress)}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDisconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="hidden sm:block">
        {" "}
        {/* Visible on screens sm and larger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="text-sm font-medium h-fit py-2 px-6"
              aria-label={`Connected wallet: ${walletAddress}`}
            >
              {userData ? (
                <>
                  <Avatar className="w-10 h-10 mr-2">
                    <AvatarImage src={userData.avatar_url} alt={userData.username} />
                    <AvatarFallback className="text-lg">{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {userData.username}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true" />
                  <span className="sr-only">Connected:</span>
                  {shortenAddress(walletAddress)}
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {userData && (
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDisconnect} className="cursor-pointer">
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

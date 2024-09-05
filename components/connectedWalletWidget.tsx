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
import { fetchProfileData, supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface ConnectedWalletWidgetProps {
  connected: boolean;
  walletAddress: string | null;
  onDisconnect: () => void;
}

const ConnectedWalletWidget: React.FC<ConnectedWalletWidgetProps> = ({
  connected,
  walletAddress,
  onDisconnect,
}) => {
  const { publicKey, signMessage } = useWallet();
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  const signAndSendMessage = async () => {
    const message = new TextEncoder().encode(
      "Please sign this message to authenticate"
    );
    const signature = await signMessage?.(message);
    const encodedSignature = signature
      ? Buffer.from(signature).toString("base64")
      : undefined;
    const encodedPublicKey = publicKey
      ? Buffer.from(publicKey.toBytes()).toString("base64")
      : undefined;

    return { publicKey: encodedPublicKey, signature: encodedSignature };
  };

  const loginUser = async () => {
    try {
      const { publicKey, signature } = await signAndSendMessage();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey?.toString(),
          signature: signature,
          walletAddress: walletAddress,
        }),
      });

      const data = await response.json();

      if (data.token) {
        // Store the token in localStorage
        localStorage.setItem("supabase_token", data.token);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      onDisconnect();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (connected && walletAddress && publicKey) {
        let token = localStorage.getItem("supabase_token");
        let {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (
          !token ||
          !session ||
          (session?.expires_at && session.expires_at * 1000 < Date.now())
        ) {
          await loginUser();
        }

        token = localStorage.getItem("supabase_token");

        if (token) {
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: token,
          });
          if (error) {
            console.error("Error setting Supabase session:", error);
            onDisconnect();
            return;
          }
          const {
            exists,
            data: profileData,
            error: profileError,
          } = await fetchProfileData();
          if (profileError) {
            console.error("Error fetching user data:", profileError);
            router.push("/dashboard/profile");
          } else if (exists && profileData) {
            setUserData(profileData);
          } else {
            router.push("/dashboard/profile");
          }
        } else {
          console.error("No token found after login attempt");
          onDisconnect();
        }
      }
    };

    fetchUserData();
  }, [connected, walletAddress, publicKey, router]);

  if (!connected || !walletAddress) {
    return <></>;
  }

  const handleDisconnect = () => {
    localStorage.removeItem("supabase_token");
    onDisconnect();
    router.push("/dashboard");
  };

  return (
    <>
      <div className="sm:hidden">
        {" "}
        {/* Visible only on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Connected wallet: ${walletAddress}`}
            >
              <Wallet className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            {userData ? (
              <>
                <DropdownMenuItem className="flex  items-center">
                  <Avatar className="w-10 h-10 mr-2">
                    <AvatarImage
                      src={userData.avatar_url}
                      alt={userData.username}
                    />
                    <AvatarFallback className="text-lg">
                      {userData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {userData.username}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="flex justify-between items-center">
                <span className="font-medium">Connected</span>
                <span className="text-sm text-muted-foreground">
                  {shortenAddress(walletAddress)}
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
                    <AvatarImage
                      src={userData.avatar_url}
                      alt={userData.username}
                    />
                    <AvatarFallback className="text-lg">
                      {userData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {userData.username}
                </>
              ) : (
                <>
                  <span
                    className="w-2 h-2 bg-green-500 rounded-full mr-2"
                    aria-hidden="true"
                  />
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

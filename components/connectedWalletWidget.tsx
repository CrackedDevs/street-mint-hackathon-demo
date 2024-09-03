import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/shortenAddress";

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
  if (!connected || !walletAddress) return null;

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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex justify-between items-center">
              <span className="font-medium">Connected</span>
              <span className="text-sm text-muted-foreground">
                {shortenAddress(walletAddress)}
              </span>
            </DropdownMenuItem>
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
              className="text-sm font-medium"
              aria-label={`Connected wallet: ${walletAddress}`}
            >
              <span
                className="w-2 h-2 bg-green-500 rounded-full mr-2"
                aria-hidden="true"
              />
              <span className="sr-only">Connected:</span>
              {shortenAddress(walletAddress)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

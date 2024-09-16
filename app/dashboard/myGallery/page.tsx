"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

import { useWallet } from "@solana/wallet-adapter-react";

export default function MyGallery() {
  const { connected, publicKey, wallet } = useWallet();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [nfts, setNfts] = useState<any[]>([]);

  async function fetchNFTs() {
    const walletAddress = publicKey?.toBase58();

    const response = await fetch(
     process.env.NEXT_PUBLIC_RPC_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "text",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: walletAddress,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.result) {
      const onlyNFTs = data.result.items.filter((item: any) =>
        item.interface.includes("NFT")
      );
      setNfts(onlyNFTs);
    }
  }
  useEffect(() => {
    if (connected) {
      fetchNFTs();
    }
  }, [wallet, publicKey]);

  return (
    <div className="bg-pink w-full h-full">
      {nfts.length > 0 ? (
        <div className="container mx-auto p-4 text-black">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Select defaultValue="recent">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="low-to-high">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low-to-high">Low to high</SelectItem>
                  <SelectItem value="high-to-low">High to low</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="auction">Auction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            className={`grid gap-6 ${
              view === "grid" ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {nfts.map((nft) => (
              <Card key={nft.id} className="">
                <CardHeader className="p-0">
                  <img
                    src={nft.content.links.image}
                    alt={nft.content.metadata.name}
                    className="w-full h-48 object-cover"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-bold">
                    {nft.content.metadata.name}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    {nft.creators[0].address.slice(0, 4) +
                      "......" +
                      nft.creators[0].address.slice(-5)}
                  </p>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                  <span className={`text-sm font-bold text-blue-400`}>
                    {nft.content.metadata.symbol}
                  </span>
                  <span className="text-sm text-green-500 font-bold">
                    Royalty {nft.royalty.percent * 100}%
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center align-items items-center text-3xl font-bold">
          You do not own any collectibles.
        </div>
      )}
    </div>
  );
}

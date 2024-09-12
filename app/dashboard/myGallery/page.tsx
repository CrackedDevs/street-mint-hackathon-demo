"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

const nfts = [
  { id: 1, title: "The Holy Grail", creator: "Pixart Motion", price: "0.001", type: "Fixed price", image: "/placeholder.svg?height=400&width=400" },
  { id: 2, title: "Mirror Glass Effect", creator: "Pixart Motion", price: "0.005", type: "Open bidding", image: "/placeholder.svg?height=400&width=400" },
  { id: 3, title: "Neon in Life", creator: "Pixart Motion", price: "0.002", type: "Fixed price", image: "/placeholder.svg?height=400&width=400" },
  { id: 4, title: "Oil Source", creator: "Pixart Motion", price: "0.001", type: "Fixed price", image: "/placeholder.svg?height=400&width=400" },
  { id: 5, title: "World Surface", creator: "Pixart Motion", price: "0.004", type: "Open bidding", image: "/placeholder.svg?height=400&width=400" },
  { id: 6, title: "Infinity Door", creator: "Pixart Motion", price: "0.005", type: "Fixed price", image: "/placeholder.svg?height=400&width=400" },
  { id: 7, title: "Bi-conditional Effect", creator: "Pixart Motion", price: "0.002", type: "Fixed price", image: "/placeholder.svg?height=400&width=400" },
  { id: 8, title: "Motion view", creator: "Pixart Motion", price: "0.009", type: "Open bidding", image: "/placeholder.svg?height=400&width=400" },
]

export default function MyGallery() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div className="container mx-auto p-4 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Select defaultValue="recent">
            <SelectTrigger className="w-[120px] bg-gray-800 text-gray-100">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="low-to-high">
            <SelectTrigger className="w-[150px] bg-gray-800 text-gray-100">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low-to-high">Low to high</SelectItem>
              <SelectItem value="high-to-low">High to low</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[100px] bg-gray-800 text-gray-100">
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
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className={`grid gap-6 ${view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
        {nfts.map((nft) => (
          <Card key={nft.id} className="bg-gray-800 text-gray-100">
            <CardHeader className="p-0">
              <img src={nft.image} alt={nft.title} className="w-full h-48 object-cover" />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-bold">{nft.title}</CardTitle>
              <p className="text-sm text-gray-400">{nft.creator}</p>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
              <span className={`text-sm ${nft.type === 'Fixed price' ? 'text-green-400' : 'text-blue-400'}`}>
                {nft.type}
              </span>
              <span className="text-sm font-bold">{nft.price} ETH</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
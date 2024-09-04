"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Linkedin,
  Instagram,
  ChevronLeft,
  ChevronRight,
  XIcon,
} from "lucide-react";
import MintButton from "@/components/mintButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import {
  fetchNFTById,
  getCollectionById,
  getArtistById,
} from "@/lib/supabaseClient";

const NFTPage = () => {
  const { connected, publicKey: walletAddress, disconnect } = useWallet();
  const [currentImage, setCurrentImage] = useState(0);
  const [nftData, setNftData] = useState<any>(null);
  const [collectionData, setCollectionData] = useState<any>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const nft = await fetchNFTById(Number(id));
        if (nft) {
          setNftData(nft);
          const collection = await getCollectionById(nft.collection_id);
          if (collection) {
            setCollectionData(collection);
            const artist = await getArtistById(collection.artist);
            if (artist) {
              setArtistData(artist);
            }
          }
        }
      }
    };
    fetchData();
  }, [id]);

  const nextImage = () => {
    if (nftData && nftData.gallery_urls) {
      setCurrentImage((prev) => (prev + 1) % nftData.gallery_urls.length);
    }
  };

  const prevImage = () => {
    if (nftData && nftData.gallery_urls) {
      setCurrentImage(
        (prev) =>
          (prev - 1 + nftData.gallery_urls.length) % nftData.gallery_urls.length
      );
    }
  };

  const onDisconnect = () => {
    disconnect();
  };

  if (!nftData || !collectionData || !artistData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="py-4 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex justify-center items-center w-full">
            <Image
              src="/logo.svg"
              alt="Street mint logo"
              width={150}
              height={50}
              className="h-8 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left column - Main Image */}
          <div className="relative aspect-square">
            <Image
              src={nftData.gallery_urls[currentImage]}
              alt={`${nftData.name} - Main Image`}
              layout="fill"
              objectFit="contain"
            />
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{nftData.name}</h1>
            <p className="text-xl text-gray-600 mb-4">
              From the &quot;{collectionData.name}&quot; Collection
            </p>

            {/* Artist Information */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              <span className="font-semibold">{artistData.username}</span>
              <a href="#" className="text-gray-600 hover:text-black">
                <XIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Limited Edition Section */}
            <div className="bg-black text-white p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Limited Edition</span>
                <span className="text-3xl font-bold">43 of 43</span>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                Last chance to own this unique piece
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-lg">Mint price:</span>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2">
                  ${nftData.price_usd.toFixed(2)}
                </span>
                <span className="text-gray-500">({nftData.price_sol} SOL)</span>
              </div>
            </div>

            <MintButton />

            <p className="text-sm text-gray-600 mb-8">
              This digital collectible is configured for minting. Once minted,
              it will be added to your collection.
            </p>

            <div className="space-y-4 mt-4">
              <p className="text-lg">{nftData.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Art title</p>
                  <p>{nftData.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Artist</p>
                  <p>{artistData.username}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location minted</p>
                  <p>{nftData.location || "N/A"}</p>
                </div>
                {/* <div>
                  <p className="text-gray-600">Edition Type</p>
                  <p>{collectionData.quantity_type.charAt(0).toUpperCase() + collectionData.quantity_type.slice(1)}</p>
                </div> */}
                {/* {collectionData.quantity_type === "limited" && (
                  <div>
                    <p className="text-gray-600">Limited Edition</p>
                    <p>Run of {collectionData.total_supply} Digital Collectibles</p>
                  </div>
                )} */}
                <div>
                  <p className="text-gray-600">Price per edition</p>
                  <p>
                    ${nftData.price_usd.toFixed(2)} ({nftData.price_sol} SOL)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Blockchain</p>
                  <p>Solana</p>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Image Gallery</h3>
              <div className="relative aspect-square">
                <Image
                  src={nftData.gallery_urls[currentImage]}
                  alt={`Gallery image ${currentImage + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {nftData.gallery_urls.map((_: any, index: number) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        currentImage === index ? "bg-white" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NFTPage;

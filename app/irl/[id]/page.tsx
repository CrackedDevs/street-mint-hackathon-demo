"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getCollectionById,
  getArtistById,
  fetchCollectibleById,
  QuantityType,
  Collection,
  Collectible,
  Artist,
  verifyNfcSignature,
  getCompletedOrdersCount,
} from "@/lib/supabaseClient";
import Gallery from "@/components/gallery";
import { Toaster } from "@/components/ui/toaster";
import IrlInputButton from "@/components/IrlInputButton";
import ArtistInfoComponent from "@/components/ArtistInfoComponent";
import EditionInformation from "@/components/EditionInformation";

async function fetchNFTData(
  id: string,
  rnd: string,
  sign: string,
  setNFTData: (data: any) => void
) {
  try {
    // Fetch SOL price
    console.log("Fetching SOL price");
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const data = await response.json();
    if (!response.ok || !data || !data.solana) {
      return null;
    }
    console.log("SOL price fetched");
    const solPriceUSD = data.solana.usd;

    let isIRLtapped = false;

    const collectible = await fetchCollectibleById(Number(id));
    if (!collectible) return null;
    // if (!collectible) return null;

    if (collectible.nfc_public_key) {
      const isValid = await verifyNfcSignature(
        rnd,
        sign,
        collectible.nfc_public_key
      );
      if (!isValid) {
        console.log("Signature is not valid");
        isIRLtapped = false;
      } else {
        isIRLtapped = true;
      }
    }

    const collection = await getCollectionById(collectible.collection_id);
    console.log("Collection fetched");
    if (!collection) return;

    const artist = await getArtistById(collection.artist);
    console.log("Artist fetched");
    if (!artist) return;

    // Calculate NFT price in SOL
    const priceInSOL = collectible.price_usd / solPriceUSD;

    // Calculate remaining quantity for limited editions
    let remainingQuantity = null;
    if (collectible.quantity_type === "limited") {
      remainingQuantity = collectible.quantity;
    }

    const soldCount = await getCompletedOrdersCount(collectible.id);

    setNFTData({
      collectible,
      collection,
      artist,
      priceInSOL,
      remainingQuantity,
      soldCount,
      isIRLtapped,
    });
  } catch (error) {
    console.error("Failed to fetch NFT data", error);
  }
}

export default function NFTPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { rnd: string; sign: string };
}) {
  const [nftData, setNFTData] = useState<{
    collectible: Collectible;
    collection: Collection;
    artist: Artist;
    priceInSOL: number;
    remainingQuantity: number | null;
    soldCount: number | 0;
    isIRLtapped: false;
  }>();

  const [walletAddress, setwalletAddress] = useState("");

  useEffect(() => {
    fetchNFTData(params.id, searchParams.rnd, searchParams.sign, setNFTData);
  }, [params.id, searchParams.rnd, searchParams.sign]);

  console.log(nftData);
  if (!nftData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image
          src="/irlLogo.svg"
          alt="Street mint logo"
          width={250}
          height={100}
          className="h-20 w-auto animate-pulse"
        />
      </div>
    );
  }

  const { collectible, collection, artist, priceInSOL, remainingQuantity } =
    nftData;

  const getEditionTypeText = (type: QuantityType) => {
    switch (type) {
      case "unlimited":
        return "Open Edition";
      case "limited":
        return "Limited Edition";
      case "single":
        return "1 of 1";
      default:
        return "Unknown Edition Type";
    }
  };

  return (
    <div className="min-h-screen bg-white mb-20 text-black">
      {/* Header */}
      <header className="py-6 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex justify-center items-center w-full">
            <Image
              src="/irlLogo.svg"
              alt="Street mint logo"
              width={200}
              height={70}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </header>

      <div className="min-h-[95vh] flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-6 py-8 gap-10 bg-white shadow-lg rounded-lg">
          <div className="text-center mb-6 gap-10">
            <h2 className="text-2xl font-semibold mb-4 ">
              Welcome to {collection.name}
            </h2>
            <Image
              src={collectible.primary_image_url}
              alt="Harold CollectorX"
              width={150}
              height={150}
              className="mx-auto  h-max w-max object-contain rounded-lg"
            />
          </div>
          <p className="text-center text-lg mb-4">
            Collect <span className="font-bold">{collectible.name}</span> and
            add it to your collection
          </p>
          <IrlInputButton
            walletAddress={walletAddress}
            setwalletAddress={setwalletAddress}
          />
        </div>
      </div>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-grow flex min-h-screen justify-center align-middle flex-col px-4"
      >
        <div className="max-w-7xl mx-auto w-full  py-8 grid md:grid-cols-2 gap-8">
          {/* Left column - Main Image */}
          <div className="relative aspect-square">
            <Image
              width={500}
              height={500}
              src={collectible.primary_image_url}
              alt={`${collectible.name} - Main Image`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{collectible.name}</h1>
            <p className="text-xl text-gray-600 mb-4">
              From the &quot;{collection.name}&quot; Collection
            </p>

            {/* Artist Information */}
            <ArtistInfoComponent artist={artist} />

            {/* Edition Information Section */}
            <EditionInformation
              soldCount={nftData.soldCount}
              isIRLtapped={nftData.isIRLtapped}
              collection={{
                ...collection,
                artist: collection.artist || 0,
                collectibles: [],
                collection_mint_public_key:
                  collection.collection_mint_public_key || "",
                metadata_uri: collection.metadata_uri || "",
                merkle_tree_public_key: collection.merkle_tree_public_key || "",
              }}
              collectible={{
                ...collectible,
                quantity_type: collectible.quantity_type as QuantityType,
                location: collectible.metadata_uri || "",
                metadata_uri: collectible.metadata_uri || "",
                nfc_public_key: collectible.nfc_public_key || "",
                location_note: collectible.location_note || "",
              }}
              remainingQuantity={remainingQuantity}
              artistWalletAddress={artist.wallet_address}
            />
          </div>
        </div>

        {/* Full-width description */}
        <div className="max-w-7xl mx-auto w-full bg-black text-white rounded-lg  py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-lg mb-6">{collectible.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">Art title</p>
                <p>{collectible.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Edition Type</p>
                <p>
                  {getEditionTypeText(
                    collectible.quantity_type as QuantityType
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Price</p>
                <p>
                  {collectible.price_usd} USD / {priceInSOL.toFixed(3)} SOL
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Gallery Section */}
        {collectible.gallery_urls.length > 0 && (
          <div className="w-full bg-white py-4">
            <div className="max-w-7xl mx-auto px-4">
              {/* <h2 className="text-2xl font-bold mb-4">Gallery</h2> */}
              <Gallery images={collectible.gallery_urls} />
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

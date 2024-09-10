import Image from "next/image";
import { Linkedin, Instagram } from "lucide-react";
import MintButton from "@/components/mintButton";
import {
  getCollectionById,
  getArtistById,
  fetchCollectibleById,
  QuantityType,
} from "@/lib/supabaseClient";
import Gallery from "@/components/gallery";
import X from "@/components/x";
import { Toaster } from "@/components/ui/toaster";

async function getNFTData(id: string) {
  // Fetch SOL price
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  const data = await response.json();
  const solPriceUSD = data.solana.usd;

  const collectible = await fetchCollectibleById(Number(id));
  if (!collectible) return null;

  const collection = await getCollectionById(collectible.collection_id);
  if (!collection) return null;

  const artist = await getArtistById(collection.artist);
  if (!artist) return null;

  // Calculate NFT price in SOL
  const priceInSOL = collectible.price_usd / solPriceUSD;

  return { collectible, collection, artist, priceInSOL };
}

// Convert to an async Server Component
export default async function NFTPage({ params }: { params: { id: string } }) {
  const data = await getNFTData(params.id);

  if (!data) {
    return <div>Loading...</div>;
  }
  const { collectible, collection, artist, priceInSOL } = data;

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
              src={collectible.primary_image_url}
              alt={`${collectible.name} - Main Image`}
              layout="fill"
              objectFit="contain"
            />
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{collectible.name}</h1>
            <p className="text-xl text-gray-600 mb-4">
              From the &quot;{collection.name}&quot; Collection
            </p>

            {/* Artist Information */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              <span className="font-semibold">{artist.username}</span>
              {artist.x_username && (
                <a
                  href={`https://x.com/${artist.x_username}`}
                  className="text-gray-600 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </a>
              )}
              {artist.linkedin_username && (
                <a
                  href={`https://www.linkedin.com/in/${artist.linkedin_username}`}
                  className="text-gray-600 hover:text-black"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {artist.instagram_username && (
                <a
                  href={`https://www.instagram.com/${artist.instagram_username}`}
                  className="text-gray-600 hover:text-black"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
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
                  ${collectible.price_usd.toFixed(2)}
                </span>
                <span className="text-gray-500">
                  ({priceInSOL.toFixed(2)} SOL)
                </span>
              </div>
            </div>
            <MintButton
              collectible={{
                ...collectible,
                quantity_type: collectible.quantity_type as QuantityType,
                location: collectible.metadata_uri || "",
                metadata_uri: collectible.metadata_uri || "",
              }}
              collection={{
                ...collection,
                artist: collection.artist || 0,
                collectibles: [],
                collection_mint_public_key:
                  collection.collection_mint_public_key || "",
                metadata_uri: collection.metadata_uri || "",
                merkle_tree_public_key: collection.merkle_tree_public_key || "",
              }}
            />
            <p className="text-sm text-gray-600 mb-8">
              This digital collectible is configured for minting. Once minted,
              it will be added to your collection.
            </p>

            <div className="space-y-4 mt-4">
              <p className="text-lg">{collectible.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Art title</p>
                  <p>{collectible.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Artist</p>
                  <p>{artist.username}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location minted</p>
                  <p>{collectible.location || "N/A"}</p>
                </div>
                {/* <div>
                  <p className="text-gray-600">Edition Type</p>
                  <p>{collection.quantity_type.charAt(0).toUpperCase() + collection.quantity_type.slice(1)}</p>
                </div>
                {collection.quantity_type === "limited" && (
                  <div>
                    <p className="text-gray-600">Limited Edition</p>
                    <p>Run of {collection.total_supply} Digital Collectibles</p>
                  </div>
                )} */}
                <div>
                  <p className="text-gray-600">Price per edition</p>
                  <p>
                    ${collectible.price_usd.toFixed(2)} ({priceInSOL.toFixed(2)}{" "}
                    SOL)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Blockchain</p>
                  <p>Solana</p>
                </div>
              </div>
              <Gallery images={collectible.gallery_urls} />
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

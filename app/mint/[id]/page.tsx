import Image from "next/image";
import MintButton from "@/components/mintButton";
import {
  getCollectionById,
  getArtistById,
  fetchCollectibleById,
  QuantityType,
  verifyNfcSignature,
} from "@/lib/supabaseClient";
import Gallery from "@/components/gallery";
import { Toaster } from "@/components/ui/toaster";
import ArtistInfoComponent from "./ArtistInfoComponent";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getNFTData(id: string, rnd: string, sign: string) {
  // Fetch SOL price

  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  const data = await response.json();
  if (!response.ok || !data || !data.solana) {
    return null;
  }
  const solPriceUSD = data.solana.usd;

  const collectible = await fetchCollectibleById(Number(id));
  // if (!collectible || !collectible.nfc_public_key) return null;
  if (!collectible) return null;

  // const isValid = await verifyNfcSignature(rnd, sign, collectible.nfc_public_key);
  //TODO: UNCOMMENT THIS
  // if (!isValid) {
  //   console.log("Signature is not valid");
  //   return null;
  // }
  //TODO: UNCOMMENT THIS

  const collection = await getCollectionById(collectible.collection_id);
  if (!collection) return null;

  const artist = await getArtistById(collection.artist);
  if (!artist) return null;

  // Calculate NFT price in SOL
  const priceInSOL = collectible.price_usd / solPriceUSD;

  // Calculate remaining quantity for limited editions
  let remainingQuantity = null;
  if (collectible.quantity_type === "limited") {
    remainingQuantity = collectible.quantity;
  }

  return { collectible, collection, artist, priceInSOL, remainingQuantity };
}

// Convert to an async Server Component
export default async function NFTPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { rnd: string; sign: string };
}) {
  const data = await getNFTData(params.id, searchParams.rnd, searchParams.sign);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image
          src="/logo.svg"
          alt="Street mint logo"
          width={250}
          height={100}
          className="h-20 w-auto animate-pulse"
        />
      </div>
    );
  }
  const { collectible, collection, artist, priceInSOL, remainingQuantity } =
    data;

  const getEditionTypeText = (type: QuantityType) => {
    switch (type) {
      case "unlimited":
        return "Unlimited Edition";
      case "limited":
        return "Limited Edition";
      case "single":
        return "Single Edition";
      default:
        return "Unknown Edition Type";
    }
  };

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
            <ArtistInfoComponent artist={artist} />

            {/* Edition Information Section */}
            <Card className="bg-black mx-auto text-white my-2">
              <CardHeader className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-black">
                    {getEditionTypeText(
                      collectible.quantity_type as QuantityType
                    )}
                  </Badge>
                  <span className="text-2xl font-bold">
                    {collectible.quantity_type === QuantityType.Limited &&
                      remainingQuantity !== null && (
                        <span>
                          {remainingQuantity} of {collectible.quantity}
                        </span>
                      )}
                  </span>
                </div>
                <CardTitle className="text-3xl font-extrabold">
                  {collectible.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-3xl font-bold">
                      ${collectible.price_usd.toFixed(2)}
                    </span>
                    <span className="mx-2">or</span>
                    <span className="text-xl font-bold">
                      {priceInSOL.toFixed(2)} SOL
                    </span>
                  </div>

                  {collectible.quantity_type === "limited" && (
                    <div className="text-lg text-grey-300">
                      {remainingQuantity === 1
                        ? "Last one available!"
                        : `${remainingQuantity} editions left`}
                    </div>
                  )}
                  {collectible.quantity_type === "single" && (
                    <div className="text-lg text-grey-300">
                      Unique, one-of-a-kind piece
                    </div>
                  )}
                  {collectible.quantity_type === "unlimited" && (
                    <div className="text-lg text-grey-300">
                      Unlimited supply available
                    </div>
                  )}
                </div>
                <MintButton
                  collectible={{
                    ...collectible,
                    quantity_type: collectible.quantity_type as QuantityType,
                    location: collectible.metadata_uri || "",
                    metadata_uri: collectible.metadata_uri || "",
                    nfc_public_key: collectible.nfc_public_key || "",
                  }}
                  collection={{
                    ...collection,
                    artist: collection.artist || 0,
                    collectibles: [],
                    collection_mint_public_key:
                      collection.collection_mint_public_key || "",
                    metadata_uri: collection.metadata_uri || "",
                    merkle_tree_public_key:
                      collection.merkle_tree_public_key || "",
                  }}
                />
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-300">
                  This digital collectible is configured for minting. Once
                  minted, it will be added to your collection.
                </p>
              </CardFooter>
            </Card>

            <div className="space-y-4 mt-6">
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
              {collectible.gallery_urls.length > 0 && (
                <Gallery images={collectible.gallery_urls} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

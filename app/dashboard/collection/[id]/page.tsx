"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import SparklesText from "@/components/magicui/sparkles-text";
import Link from "next/link";
import {
  Collectible,
  fetchCollectiblesByCollectionId,
  getCollectionById,
  supabase,
} from "@/lib/supabaseClient";
import Image from "next/image";

type Collection = {
  id: number;
  name: string;
  description: string;
  artist: number;
  collectibles: number[]; // Changed from nfts
};

export default function CollectionPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]); // Changed from nfts

  useEffect(() => {
    async function fetchCollectionAndCollectibles() { // Changed from fetchCollectionAndNFTs
      // Fetch collection

      const collectionData = await getCollectionById(Number(id));
      if (!collectionData) {
        console.error("Error fetching collection: Collection not found");
      } else {
        setCollection(collectionData);
      }

      // Fetch Collectibles
      const collectiblesData = await fetchCollectiblesByCollectionId(Number(id));
      if (!collectiblesData) {
        console.error("Error fetching collectibles: No data returned"); // Changed from NFTs
        return;
      } else {
        setCollectibles(collectiblesData as Collectible[]); // Changed from setNfts
      }
    }
    fetchCollectionAndCollectibles(); // Changed from fetchCollectionAndNFTs
  }, [id]);

  if (!collection) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 w-full relative">
      <Link href="/dashboard/collection">
        <Button variant="outline" className="mb-8">
          ← Back to Collections
        </Button>
      </Link>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <SparklesText
              sparklesCount={5}
              className="text-3xl font-bold"
              text={collection.name}
            />
          </CardTitle>
          <CardDescription className="text-lg">
            {collection.description}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collectibles.map((collectible) => ( // Changed from nfts to collectibles
          <Card
            key={collectible.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="aspect-square relative mb-4">
                <Image
                  src={collectible.primary_image_url}
                  alt={collectible.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{collectible.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{collectible.description}</p>
              <div className="flex space-x-4">
                <p>
                  <strong>ID:</strong> {collectible.id} |{" "}
                  <strong>Quantity Type:</strong> {collectible.quantity_type}{" "}
                  {collectible.quantity_type === "limited" &&
                    `| Quantity: ${collectible.quantity}`}{" "}
                  | <strong>Price (USD):</strong> ${collectible.price_usd}
                </p>
              </div>
              {collectible.gallery_urls && collectible.gallery_urls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Gallery</h4>
                  <div className="flex flex-wrap gap-2">
                    {collectible.gallery_urls.map((url, index) => (
                      <div key={index} className="w-16 h-16 relative">
                        <Image
                          src={url}
                          alt={`Gallery image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

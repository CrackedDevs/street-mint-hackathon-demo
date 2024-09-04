"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SparklesText from "@/components/magicui/sparkles-text";
import Link from "next/link";
import { Collection, NFT, supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function CollectionPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    async function fetchCollectionAndNFTs() {
      // Fetch collection
      const { data: collectionData, error: collectionError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (collectionError) {
        console.error("Error fetching collection:", collectionError);
      } else {
        setCollection(collectionData as any);
      }

      // Fetch NFTs
      const { data: nftsData, error: nftsError } = await supabase.from("nfts").select("*").eq("collection_id", id);

      if (nftsError) {
        console.error("Error fetching NFTs:", nftsError);
      } else {
        setNfts(nftsData as NFT[]);
      }
    }
    fetchCollectionAndNFTs();
  }, [id]);

  console.log(collection, nfts);

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
            <SparklesText sparklesCount={5} className="text-3xl font-bold" text={collection.name} />
          </CardTitle>
          <CardDescription className="text-lg">{collection.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Card key={nft.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="aspect-square relative mb-4">
                <Image
                  src={nft.primary_image_url}
                  alt={nft.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{nft.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{nft.description}</p>
              <div className="flex space-x-4">
                <p><strong>ID:</strong> {nft.id} | <strong>Quantity Type:</strong> {nft.quantity_type} {nft.quantity_type === "limited" && `| Quantity: ${nft.quantity}`} | <strong>Price (USD):</strong> ${nft.price_usd}</p>
              </div>
              {nft.gallery_urls && nft.gallery_urls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Gallery</h4>
                  <div className="flex flex-wrap gap-2">
                    {nft.gallery_urls.map((url, index) => (
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

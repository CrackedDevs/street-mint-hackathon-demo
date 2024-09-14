"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collection,
  Collectible,
  getCollectionById,
  fetchCollectiblesByCollectionId,
} from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type CollectionWithIds = Omit<Collection, "collectibles">;

export default function Component() {
  const { id } = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionWithIds | null>(null);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);

  useEffect(() => {
    async function fetchCollectionAndCollectibles() {
      const collectionData = await getCollectionById(Number(id));

      if (!collectionData) {
        console.error("Error fetching collection: Collection not found");
      } else {
        setCollection({ ...collectionData } as CollectionWithIds);
      }

      const collectiblesData = await fetchCollectiblesByCollectionId(
        Number(id)
      );

      if (!collectiblesData) {
        console.error("Error fetching collectibles: No data returned");
        return;
      } else {
        setCollectibles(collectiblesData as Collectible[]);
      }
    }
    fetchCollectionAndCollectibles();
  }, [id]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/dashboard/collection"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Collections
          </Link>
          <Button
            className="inline-flex items-center"
            onClick={() => {
              router.push(
                `/dashboard/collection/${collection.id}/new-collectible`
              );
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Collectible
          </Button>
        </div>
        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {collection.name}
            </CardTitle>
            <p className="text-lg text-gray-600">{collection.description}</p>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectibles.map((collectible) => (
            <Card
              key={collectible.id}
              className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <CardContent className="p-0 flex-grow">
                <div className="aspect-square relative">
                  <Image
                    src={collectible.primary_image_url}
                    alt={collectible.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {collectible.name} #{collectible.id}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {collectible.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      {collectible.quantity_type === "limited"
                        ? `Limited (${collectible.quantity})`
                        : "Unlimited"}
                    </Badge>
                    <span className="text-lg font-bold text-gray-900">
                      ${collectible.price_usd}
                    </span>
                  </div>
                  {collectible.gallery_urls &&
                    collectible.gallery_urls.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Gallery
                        </h4>
                        <div className="flex space-x-2">
                          {collectible.gallery_urls.map((url, index) => (
                            <div
                              key={index}
                              className="w-16 h-16 relative rounded-md overflow-hidden"
                            >
                              <Image
                                src={url}
                                alt={`Gallery image ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
                >
                  Setup Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

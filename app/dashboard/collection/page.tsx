"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { getCollectionsByArtistId } from "@/lib/supabaseClient";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { useWallet } from "@solana/wallet-adapter-react";
import withAuth from "../withAuth";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from "@/app/providers/UserProfileProvider";

type Collection = {
  id?: number;
  name: string;
  description: string;
  nfts: number[] | null;
};

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, connected } = useWallet();
  const { userProfile } = useUserProfile();

  useEffect(() => {
    async function fetchCollections() {
      if (!connected || !publicKey) {
        setError("Please connect your wallet to view collections.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        if (userProfile && publicKey) {
          const collectionsData = await getCollectionsByArtistId(userProfile.id);
          if (!collectionsData) {
            throw new Error("Failed to fetch collections data");
          }

          setCollections(collectionsData);
        }
      } catch (error) {
        console.error("Error in fetchCollections:", error);
        setError("An unexpected error occurred. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to fetch collections. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [userProfile, publicKey]);

  if (!connected) {
    return <></>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Collections</h1>
          <Link href="/dashboard/collection/create">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Create New Collection
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="w-full h-64 animate-pulse">
                <CardHeader className="h-1/2 bg-gray-200 dark:bg-gray-700" />
                <CardContent className="h-1/2 flex items-center justify-center">
                  <Loader2Icon className="h-8 w-8 animate-spin text-gray-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{error}</p>
              <Button className="w-full" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="hover:shadow-lg flex flex-col justify-between transition-all duration-200 transform hover:-translate-y-1"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">{collection.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{collection.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <Link href={`/dashboard/collection/${collection.id}`}>
                    <AnimatedSubscribeButton
                      buttonColor="bg-primary"
                      buttonTextColor="text-primary-foreground"
                      subscribeStatus={false}
                      initialText={<span className="group inline-flex items-center">View Collection</span>}
                      changeText={<span className="group inline-flex items-center">Opening...</span>}
                    />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">You haven&apos;t created any collections yet.</p>
            <Link href="/dashboard/collection/create">
              <Button size="lg">
                <PlusIcon className="mr-2 h-5 w-5" /> Create Your First Collection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CollectionsPage);

"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SparklesText from "@/components/magicui/sparkles-text";
import Link from "next/link";
import { Collection, supabase } from "@/lib/supabaseClient";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { cn } from "@/lib/utils";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    async function fetchCollections() {
      const { data, error } = await supabase.from("collections").select("*");

      if (error) {
        console.error("Error fetching collections:", error);
      } else {
        setCollections(data as any);
      }
    }
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8 w-full">
      <div className="flex justify-between flex-wrap gap-6 items-center mb-8">
        <SparklesText sparklesCount={5} className="text-3xl font-bold" text="Collections" />
        <Link href="/dashboard/collection/create">
          <Button variant="outline" className="text-sm">
            Create New Collection
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {collections.map((collection) => (
          <Card
            key={collection.id}
            className="hover:shadow-lg flex w-fit flex-col justify-between transition-shadow duration-200"
          >
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{collection.name}</CardTitle>
              <CardDescription className="text-lg">{collection.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/collection/${collection.id}`}>
                <AnimatedSubscribeButton
                  buttonColor="#000000"
                  buttonTextColor="#ffffff"
                  subscribeStatus={false}
                  initialText={<span className="group inline-flex items-center">View Collection </span>}
                  changeText={<span className="group inline-flex items-center">Opening...</span>}
                />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.1}
        duration={1}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          " h-[100%] skew-y-12  w-full "
        )}
      />
    </div>
  );
}

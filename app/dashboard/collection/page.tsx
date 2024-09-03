// app/collections/page.tsx

"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SparklesText from "@/components/magicui/sparkles-text";
import Link from "next/link";

const collections = [
  { id: 1, name: "Pokemon Cards", description: "Digital collectibles of various Pokemon." },
  { id: 2, name: "Artworks", description: "A collection of unique digital artworks." },
  // Add more collections as needed
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="flex justify-between items-center mb-8">
        <SparklesText sparklesCount={5} className="text-3xl font-bold" text="Collections" />
        <Link href="/dashboard/collection/create">
          <Button variant="outline" className="text-sm">
            Create New Collection
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{collection.name}</CardTitle>
              <CardDescription>{collection.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/collections/${collection.id}`}>
                <Button variant="link" className="text-primary">
                  View Collection
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

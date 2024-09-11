"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeftIcon } from "lucide-react"
import { Collection, createCollection } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { NumericUUID } from "@/lib/utils"
import { useUserProfile } from "@/app/providers/UserProfileProvider"

export default function CreateCollectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { publicKey } = useWallet()
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [artistId, setArtistId] = useState<number | null>(null)
  const { userProfile } = useUserProfile()

  useEffect(() => {
    if (publicKey && userProfile) {
      setArtistId(userProfile.id);
    }
  }, [publicKey, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }
    if (!artistId) {
      toast({
        title: "Error",
        description: "Artist information not found",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true)
    try {
      const newCollection: Collection | null = await createCollection({
        id: NumericUUID(),
        name: collectionName,
        description: collectionDescription,
        artist: artistId,
        collectibles: [],
      })

      if (newCollection) {
        toast({
          title: "Success",
          description: "Collection created successfully",
          variant: "default",
        });
        router.push(`/dashboard/collection`);
      } else {
        throw new Error("Failed to create collection");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/collection")}
          className="mb-6"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Collections
        </Button>
        <Card className="w-full">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-center">
              Create New Collection
            </CardTitle>
            <CardDescription className="text-center">
              Fill in the details below to create your new collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="collection-name"
                    className="text-base font-semibold"
                  >
                    Collection Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="collection-name"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="collection-description"
                    className="text-base font-semibold"
                  >
                    Collection Description{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="collection-description"
                    value={collectionDescription}
                    onChange={(e) => setCollectionDescription(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Collection...
                  </>
                ) : (
                  "Create Collection"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, TrashIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Collection, createCollection, supabase, uploadImage } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

type NFT = {
  id: number;
  name: string;
  description: string;
  primary_image_url: string | File;
  quantity_type: "unlimited" | "single" | "limited";
  quantity?: number;
  price_usd: number;
  location?: string;
};

export default function CreateCollectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [newNFT, setNewNFT] = useState<NFT>({
    id: parseInt(Date.now().toString().slice(-4)),
    name: "",
    description: "",
    primary_image_url: "",
    quantity_type: "unlimited",
    price_usd: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistId, setArtistId] = useState<number | null>(null);

  useEffect(() => {
    const fetchArtistId = async () => {
      if (publicKey) {
        const { data, error } = await supabase
          .from("artists")
          .select("id")
          .eq("wallet_address", publicKey.toString())
          .single();

        if (error) {
          console.error("Error fetching artist:", error);
          toast({
            title: "Error",
            description: "Failed to fetch artist information",
            variant: "destructive",
          });
        } else if (data) {
          setArtistId(data.id);
        }
      }
    };

    fetchArtistId();
  }, [publicKey, toast]);

  const handleNFTChange = (field: keyof NFT, value: any) => {
    setNewNFT((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      handleNFTChange("primary_image_url", e.target.files[0]);
    }
  };

  const addNFT = (e: React.FormEvent) => {
    e.preventDefault();
    if (nfts.length === 0) {
      if (newNFT.name && newNFT.description && newNFT.primary_image_url) {
        setNfts((prev) => [...prev, { ...newNFT, id: parseInt(Date.now().toString().slice(-4)) }]);
        setNewNFT({
          id: parseInt(Date.now().toString().slice(-4)),
          name: "",
          description: "",
          primary_image_url: "",
          quantity_type: "unlimited",
          price_usd: 0,
        });
        setImageFile(null);
      } else {
        toast({
          title: "Error",
          description: "Please fill all required fields for the first NFT",
          variant: "destructive",
        });
      }
    } else {
      setNfts((prev) => [...prev, { ...newNFT, id: parseInt(Date.now().toString().slice(-4)) }]);
      setNewNFT({
        id: parseInt(Date.now().toString().slice(-4)),
        name: "",
        description: "",
        primary_image_url: "",
        quantity_type: "unlimited",
        price_usd: 0,
      });
      setImageFile(null);
    }
  };

  const removeNFT = (id: number) => {
    setNfts((prev) => prev.filter((nft) => nft.id !== id));
  };

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
    if (nfts.length === 0 || !collectionName || !collectionDescription) {
      toast({
        title: "Please fill all required fields and add at least one NFT",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedNfts = await Promise.all(
        nfts.map(async (nft) => {
          if (nft.primary_image_url instanceof File) {
            const imageUrl = await uploadImage(nft.primary_image_url);
            if (imageUrl === null) {
              toast({
                title: "Failed to upload image",
                variant: "destructive",
              });
              return;
            }
            return { ...nft, primary_image_url: imageUrl || "" };
          }
          return nft;
        })
      );
      const newCollection: Collection | null = await createCollection({
        name: collectionName,
        description: collectionDescription,
        artist: artistId,
        nfts: updatedNfts.map((nft) => ({
          name: nft!.name || "",
          description: nft!.description || "",
          primary_image_url: nft!.primary_image_url as string,
          quantity_type: nft!.quantity_type || "unlimited",
          quantity: nft!.quantity,
          price_usd: nft!.price_usd || 0,
          location: nft!.location,
        })),
      });

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
      setCollectionName("");
      setCollectionDescription("");
      setNfts([]);
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
    <div className="min-h-screen bg-background text-foreground p-8">
      <Button variant="default" onClick={() => router.push("/dashboard/collection")} className="mb-4">
        ← Back to Collections
      </Button>
      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create New Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Collection Details */}
            <div className="space-y-4">
              <Label htmlFor="collection-name" className="text-lg font-semibold">
                Collection Name *
              </Label>
              <Input
                id="collection-name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter the collection name"
                required
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="collection-description" className="text-lg font-semibold">
                Collection Description *
              </Label>
              <Textarea
                id="collection-description"
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                placeholder="Enter a brief description of the collection"
                className="h-32"
                required
              />
            </div>
            {/* NFT Management */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Add NFTs</h3>
              </div>
              {nfts.length > 0 ? (
                <div className="space-y-4">
                  {nfts.map((nft) => (
                    <Card key={nft.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          {nft.primary_image_url && (
                            <div className="w-24 h-24 mr-4 relative flex-shrink-0">
                              {typeof nft.primary_image_url === "string" ? (
                                <Image
                                  width={128}
                                  height={128}
                                  src={nft.primary_image_url}
                                  alt={nft.name}
                                  className="rounded"
                                />
                              ) : (
                                <Image
                                  width={128}
                                  height={128}
                                  src={URL.createObjectURL(nft.primary_image_url)}
                                  alt={nft.name}
                                  className="rounded"
                                />
                              )}
                            </div>
                          )}
                          <div className="flex-grow">
                            <h4 className="text-xl font-semibold">{nft.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 truncate">{nft.description}</p>
                            <p className="text-sm font-medium text-primary mt-2">Price: ${nft.price_usd}</p>
                            <p className="text-sm text-gray-600">Type: {nft.quantity_type}</p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeNFT(nft.id)}
                            className="h-18 w-18 ml-2 "
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 my-4">No NFTs added yet. Add your first NFT above.</p>
              )}
              {/* New NFT Form */}
              <div className="space-y-4 p-4 border-2 flex flex-col border-gray-300 rounded-lg">
                <Label htmlFor="nft-name" className="text-lg font-semibold">
                  NFT Name *
                </Label>
                <div className="space-y-4">
                  <Input
                    id="nft-name"
                    value={newNFT.name}
                    onChange={(e) => handleNFTChange("name", e.target.value)}
                    placeholder="Enter the NFT name"
                    // required
                  />
                </div>
                <Label htmlFor="nft-description" className="text-lg font-semibold">
                  NFT Description *
                </Label>
                <Textarea
                  id="nft-description"
                  value={newNFT.description}
                  onChange={(e) => handleNFTChange("description", e.target.value)}
                  placeholder="Enter a brief description of the NFT"
                  className="h-24"
                  //   required
                />
                <Label htmlFor="nft-image" className="text-lg font-semibold">
                  NFT Image *
                </Label>
                <div className="flex items-center gap-4">
                  {newNFT.primary_image_url && (
                    <div className="w-60 h-32 border-2 justify-center align-middle items-center border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={
                          newNFT.primary_image_url instanceof File
                            ? URL.createObjectURL(newNFT.primary_image_url)
                            : newNFT.primary_image_url
                        }
                        alt={newNFT.name || "NFT preview"}
                        width={128}
                        className="items-center h-full w-full object-contain"
                        height={128}
                      />
                    </div>
                  )}
                  <Input
                    id="nft-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-fit"
                    required
                  />
                </div>
                <Label htmlFor="nft-quantity-type" className="text-lg font-semibold">
                  Quantity Type *
                </Label>
                <select
                  id="nft-quantity-type"
                  value={newNFT.quantity_type}
                  onChange={(e) => handleNFTChange("quantity_type", e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="unlimited">Unlimited</option>
                  <option value="single">Single</option>
                  <option value="limited">Limited</option>
                </select>
                {newNFT.quantity_type === "limited" && (
                  <div className="space-y-4">
                    <Label htmlFor="nft-quantity" className="text-lg font-semibold">
                      Quantity *
                    </Label>
                    <Input
                      id="nft-quantity"
                      type="number"
                      value={newNFT.quantity}
                      onChange={(e) => handleNFTChange("quantity", Number(e.target.value))}
                      placeholder="Enter the quantity"
                      required
                    />
                  </div>
                )}
                <Label htmlFor="nft-price" className="text-lg font-semibold">
                  Price (USD) *
                </Label>
                <Input
                  id="nft-price"
                  type="number"
                  value={newNFT.price_usd}
                  onChange={(e) => handleNFTChange("price_usd", Number(e.target.value))}
                  placeholder="Enter the price in USD"
                  required
                />
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={addNFT}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add NFT
              </Button>
            </div>
            <ShimmerButton type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Collection"
              )}
            </ShimmerButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

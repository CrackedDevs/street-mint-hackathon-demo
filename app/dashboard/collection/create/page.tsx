"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, TrashIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Collection,
  createCollection,
  QuantityType,
  uploadImage,
  NFT,
  fetchProfileData,
} from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { NumericUUID } from "@/lib/utils";

export default function CreateCollectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [nfts, setNfts] = useState<NFT[]>([]);

  const [primaryImageLocalFile, setPrimaryImageLocalFile] =
    useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState("Submit Collection");
  const [artistId, setArtistId] = useState<number | null>(null);

  const [newNFT, setNewNFT] = useState<NFT>({
    id: NumericUUID(),
    name: "",
    description: "",
    primary_image_url: "",
    quantity_type: QuantityType.Unlimited || "unlimited",
    price_usd: 0,
    gallery_urls: [],
  });
  const [newNFTGalleryImages, setNewNFTGalleryImages] = useState<File[]>([]);

  useEffect(() => {
    const fetchArtistId = async () => {
      if (publicKey) {
        const { exists, data, error } = await fetchProfileData();

        if (error) {
          console.error("Error fetching artist:", error);
          toast({
            title: "Error",
            description: "Failed to fetch artist information",
            variant: "destructive",
          });
        } else if (exists && data) {
          setArtistId(data.id);
        } else {
          console.error("Artist not found");
          toast({
            title: "Error",
            description: "Artist profile not found",
            variant: "destructive",
          });
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
      setPrimaryImageLocalFile(e.target.files[0]);
      handleNFTChange(
        "primary_image_url",
        URL.createObjectURL(e.target.files[0])
      );
    }
  };

  const addNFT = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNFT.name && newNFT.description && newNFT.primary_image_url) {
      setNfts((prev) => [
        ...prev,
        {
          ...newNFT,
          id: NumericUUID(),
          gallery_urls: newNFTGalleryImages.map((file) =>
            URL.createObjectURL(file)
          ),
        },
      ]);
      setNewNFT({
        id: NumericUUID(),
        name: "",
        description: "",
        primary_image_url: "",
        quantity_type: QuantityType.Unlimited,
        price_usd: 0,
        gallery_urls: [],
      });
      setPrimaryImageLocalFile(null);
      setNewNFTGalleryImages([]);
    } else {
      toast({
        title: "Error",
        description: "Please fill all required fields for the NFT",
        variant: "destructive",
      });
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
    if (nfts.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and add at least one NFT",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      setSubmitState("Uploading images...");
      const updatedNfts = await Promise.all(
        nfts.map(async (nft) => {
          const imageBlob = await fetch(nft.primary_image_url).then((r) =>
            r.blob()
          );
          const imageFile = new File([imageBlob], "image.jpg", {
            type: imageBlob.type,
          });
          const imageUrl = await uploadImage(imageFile);

          const uploadedGalleryUrls = await Promise.all(
            nft.gallery_urls.map(async (url) => {
              const galleryBlob = await fetch(url).then((r) => r.blob());
              const galleryFile = new File([galleryBlob], "gallery_image.jpg", {
                type: galleryBlob.type,
              });
              return (await uploadImage(galleryFile)) || "";
            })
          );

          return {
            ...nft,
            primary_image_url: imageUrl || "",
            gallery_urls: uploadedGalleryUrls.filter(Boolean),
          };
        })
      );

      setSubmitState("Creating collection...");
      const newCollection: Collection | null = await createCollection({
        id: NumericUUID(),
        name: collectionName,
        description: collectionDescription,
        artist: artistId,
        nfts: updatedNfts,
      });

      if (newCollection) {
        setSubmitState("Done!");
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
      setSubmitState("Submit Collection");
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && newNFTGalleryImages.length < 5) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + newNFTGalleryImages.length <= 5) {
        setNewNFTGalleryImages([...newNFTGalleryImages, ...filesArray]);
      } else {
        toast({
          title: "Error",
          description: "You can only upload a maximum of 5 images per NFT.",
          variant: "destructive",
        });
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    const updatedImages = newNFTGalleryImages.filter((_, i) => i !== index);
    setNewNFTGalleryImages(updatedImages);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Button
        variant="default"
        onClick={() => router.push("/dashboard/collection")}
        className="mb-4"
      >
        ← Back to Collections
      </Button>
      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create New Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Collection Details */}
            <div className="space-y-4">
              <Label
                htmlFor="collection-name"
                className="text-lg font-semibold"
              >
                Collection Name *
              </Label>
              <Input
                id="collection-name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter the collection name"
              />
            </div>
            <div className="space-y-4">
              <Label
                htmlFor="collection-description"
                className="text-lg font-semibold"
              >
                Collection Description *
              </Label>
              <Textarea
                id="collection-description"
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                placeholder="Enter a brief description of the collection"
                className="h-32"
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
                    <Card
                      key={nft.id}
                      className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          {nft.primary_image_url && (
                            <div className="w-24 h-24 mr-4 relative flex-shrink-0">
                              <Image
                                width={128}
                                height={128}
                                src={nft.primary_image_url}
                                alt={nft.name}
                                className="rounded"
                              />
                            </div>
                          )}
                          <div className="flex-grow">
                            <h4 className="text-xl font-semibold">
                              {nft.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {nft.description}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => removeNFT(nft.id)}
                            className="h-18 w-18 ml-2"
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 my-4">
                  No NFTs added yet. Add your first NFT above.
                </p>
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
                  />
                </div>
                <Label
                  htmlFor="nft-description"
                  className="text-lg font-semibold"
                >
                  NFT Description *
                </Label>
                <Textarea
                  id="nft-description"
                  value={newNFT.description}
                  onChange={(e) =>
                    handleNFTChange("description", e.target.value)
                  }
                  placeholder="Enter a brief description of the NFT"
                  className="h-24"
                />
                <Label htmlFor="nft-image" className="text-lg font-semibold">
                  NFT Image *
                </Label>
                <div className="flex items-center gap-4">
                  {newNFT.primary_image_url && (
                    <div className="w-60 h-32 border-2 justify-center align-middle items-center border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={newNFT.primary_image_url}
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
                  />
                </div>
                <Label
                  htmlFor="nft-quantity-type"
                  className="text-lg font-semibold"
                >
                  Quantity Type *
                </Label>
                <select
                  id="nft-quantity-type"
                  value={newNFT.quantity_type}
                  onChange={(e) =>
                    handleNFTChange(
                      "quantity_type",
                      e.target.value as QuantityType
                    )
                  }
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value={QuantityType.Unlimited}>Unlimited</option>
                  <option value={QuantityType.Single}>Single</option>
                  <option value={QuantityType.Limited}>Limited</option>
                </select>
                {newNFT.quantity_type === QuantityType.Limited && (
                  <div className="space-y-4">
                    <Label
                      htmlFor="nft-quantity"
                      className="text-lg font-semibold"
                    >
                      Quantity *
                    </Label>
                    <Input
                      id="nft-quantity"
                      type="number"
                      value={newNFT.quantity}
                      onChange={(e) =>
                        handleNFTChange("quantity", Number(e.target.value))
                      }
                      placeholder="Enter the quantity"
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
                  onChange={(e) =>
                    handleNFTChange("price_usd", Number(e.target.value))
                  }
                  placeholder="Enter the price in USD"
                />
              </div>
              <div className="space-y-4">
                <Label
                  htmlFor="gallery-images"
                  className="text-lg font-semibold"
                >
                  Upload Gallery Images (Max 5)
                </Label>
                <div className="flex flex-wrap gap-4">
                  {newNFTGalleryImages.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="Gallery Image Preview"
                        width={100}
                        height={100}
                        className="rounded"
                      />
                      <button
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  id="gallery-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImageChange}
                  disabled={newNFTGalleryImages.length >= 5}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addNFT}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add NFT
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ShimmerButton
        onClick={handleSubmit}
        type="submit"
        className="w-full mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {submitState}
          </>
        ) : (
          submitState
        )}
      </ShimmerButton>
    </div>
  );
}

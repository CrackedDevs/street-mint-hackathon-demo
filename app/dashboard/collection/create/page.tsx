// components/CreateCollection.tsx

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadIcon, XIcon, ArrowLeftIcon } from "lucide-react";
import SparklesText from "@/components/magicui/sparkles-text";
import ShimmerButton from "@/components/magicui/shimmer-button";
import Link from "next/link";

export default function CreateCollection() {
  const [collectionData, setCollectionData] = useState({
    collectionName: "",
    collectionDescription: "",
    nfts: [
      {
        nftName: "",
        nftQuantity: "",
        splitWallets: "",
        location: "",
        imageArt: "",
        imageWall: "",
      },
    ],
  });

  const handleCollectionInputChange = (e: any) => {
    const { name, value } = e.target;
    setCollectionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNftInputChange = (index: any, e: any) => {
    const { name, value } = e.target;
    const updatedNfts = [...collectionData.nfts];
    updatedNfts[index] = { ...updatedNfts[index], [name]: value };
    setCollectionData((prev) => ({ ...prev, nfts: updatedNfts }));
  };

  const handleFileChange = (index: any, fieldName: any, e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedNfts = [...collectionData.nfts];
        updatedNfts[index] = { ...updatedNfts[index], [fieldName]: event?.target?.result };
        setCollectionData((prev) => ({ ...prev, nfts: updatedNfts }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addNft = () => {
    setCollectionData((prev) => ({
      ...prev,
      nfts: [
        ...prev.nfts,
        {
          nftName: "",
          nftQuantity: "",
          splitWallets: "",
          location: "",
          imageArt: "",
          imageWall: "",
        },
      ],
    }));
  };

  const removeNft = (index: any) => {
    const updatedNfts = collectionData.nfts.filter((_, i) => i !== index);
    setCollectionData((prev) => ({ ...prev, nfts: updatedNfts }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Collection created:", collectionData);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Link href="/dashboard/collection" className="inline-flex items-center mb-4 text-primary hover:underline">
        <Button>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Collections
        </Button>
      </Link>
      <Card className="max-w-4xl mx-auto flex flex-col w-full h-full gap-4">
        <SparklesText sparklesCount={5} className="w-full items-center text-center m-6" text="Create Collection" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="collectionName" className="text-lg font-semibold">
                Collection Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="collectionName"
                name="collectionName"
                value={collectionData.collectionName}
                onChange={handleCollectionInputChange}
                className="bg-background"
                placeholder="Enter the collection name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionDescription" className="text-lg font-semibold">
                Collection Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="collectionDescription"
                name="collectionDescription"
                value={collectionData.collectionDescription}
                onChange={handleCollectionInputChange}
                className="bg-background h-32"
                placeholder="Describe your collection"
              />
            </div>
            {collectionData.nfts.map((nft, index) => (
              <div key={index} className="space-y-6 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-primary">NFT #{index + 1}</h3>
                  {collectionData.nfts.length > 1 && (
                    <Button variant="ghost" onClick={() => removeNft(index)}>
                      <XIcon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`nftName-${index}`} className="text-lg font-semibold">
                    NFT Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`nftName-${index}`}
                    name="nftName"
                    value={nft.nftName}
                    onChange={(e) => handleNftInputChange(index, e)}
                    className="bg-background"
                    placeholder="Enter the NFT name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`nftQuantity-${index}`} className="text-lg font-semibold">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`nftQuantity-${index}`}
                    name="nftQuantity"
                    type="number"
                    value={nft.nftQuantity}
                    onChange={(e) => handleNftInputChange(index, e)}
                    className="bg-background"
                    placeholder="Enter the quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`splitWallets-${index}`} className="text-lg font-semibold">
                    Split Wallets <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`splitWallets-${index}`}
                    name="splitWallets"
                    value={nft.splitWallets}
                    onChange={(e) => handleNftInputChange(index, e)}
                    className="bg-background"
                    placeholder="Enter potential wallets"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-${index}`} className="text-lg font-semibold">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`location-${index}`}
                    name="location"
                    value={nft.location}
                    onChange={(e) => handleNftInputChange(index, e)}
                    className="bg-background"
                    placeholder="Enter the location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`imageArt-${index}`} className="text-lg font-semibold">
                    Upload Image of the Art <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      id={`imageArt-upload-${index}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(index, "imageArt", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`imageArt-upload-${index}`)?.click()}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`imageWall-${index}`} className="text-lg font-semibold">
                    Upload Image of the Wall <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      id={`imageWall-upload-${index}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(index, "imageWall", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`imageWall-upload-${index}`)?.click()}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addNft} className="w-full">
              + Add Another NFT
            </Button>
            <ShimmerButton borderRadius="6px" className="rounded w-full mt-4">
              Create Collection
            </ShimmerButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

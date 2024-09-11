"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusIcon, TrashIcon, Loader2, ArrowLeftIcon } from "lucide-react";
import {
  Collectible,
  createCollectible,
  QuantityType,
  uploadImage,
} from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { NumericUUID } from "@/lib/utils";
import { useUserProfile } from "@/app/providers/UserProfileProvider";

export default function CreateCollectiblePage() {
  const router = useRouter();
  const { id: collectionId } = useParams();
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile } = useUserProfile();

  const [collectible, setCollectible] = useState<Collectible>({
    id: NumericUUID(),
    name: "",
    description: "",
    primary_image_url: "",
    quantity_type: QuantityType.Unlimited,
    price_usd: 0,
    gallery_urls: [],
  });
  const [primaryImageLocalFile, setPrimaryImageLocalFile] =
    useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const handleCollectibleChange = (field: keyof Collectible, value: any) => {
    setCollectible((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrimaryImageLocalFile(e.target.files[0]);
      handleCollectibleChange(
        "primary_image_url",
        URL.createObjectURL(e.target.files[0])
      );
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && galleryImages.length < 5) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + galleryImages.length <= 5) {
        setGalleryImages([...galleryImages, ...filesArray]);
      } else {
        toast({
          title: "Error",
          description:
            "You can only upload a maximum of 5 images per collectible.",
          variant: "destructive",
        });
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
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
    if (!userProfile) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let primaryImageUrl = "";
      if (primaryImageLocalFile) {
        primaryImageUrl = (await uploadImage(primaryImageLocalFile)) || "";
      }

      const uploadedGalleryUrls = await Promise.all(
        galleryImages.map(async (file) => {
          return (await uploadImage(file)) || "";
        })
      );

      const newCollectible: Collectible = {
        ...collectible,
        primary_image_url: primaryImageUrl,
        gallery_urls: uploadedGalleryUrls.filter(Boolean),
        id: NumericUUID(),
      };

      const createdCollectible = await createCollectible(
        newCollectible,
        Number(collectionId)
      );

      if (createdCollectible) {
        toast({
          title: "Success",
          description: "Collectible created successfully",
          variant: "default",
        });
        router.push(`/dashboard/collection/${collectionId}`);
      } else {
        throw new Error("Failed to create collectible");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collectible",
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
          onClick={() => router.push(`/dashboard/collection/${collectionId}`)}
          className="mb-6"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Collection
        </Button>
        <Card className="w-full">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-center">
              Create New Collectible
            </CardTitle>
            <CardDescription className="text-center">
              Fill in the details below to create your new collectible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="collectible-name"
                    className="text-base font-semibold"
                  >
                    Collectible Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="collectible-name"
                    value={collectible.name}
                    onChange={(e) =>
                      handleCollectibleChange("name", e.target.value)
                    }
                    className="text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="collectible-description"
                    className="text-base font-semibold"
                  >
                    Collectible Description{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="collectible-description"
                    value={collectible.description}
                    onChange={(e) =>
                      handleCollectibleChange("description", e.target.value)
                    }
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="collectible-image"
                    className="text-base font-semibold"
                  >
                    Collectible Image{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="collectible-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="collectible-quantity-type"
                    className="text-base font-semibold"
                  >
                    Quantity Type <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="collectible-quantity-type"
                    value={collectible.quantity_type}
                    onChange={(e) =>
                      handleCollectibleChange(
                        "quantity_type",
                        e.target.value as QuantityType
                      )
                    }
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value={QuantityType.Unlimited}>Unlimited</option>
                    <option value={QuantityType.Single}>Single</option>
                    <option value={QuantityType.Limited}>Limited</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="collectible-price"
                    className="text-base font-semibold"
                  >
                    Price (USD) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="collectible-price"
                    type="number"
                    value={collectible.price_usd}
                    onChange={(e) =>
                      handleCollectibleChange(
                        "price_usd",
                        parseFloat(e.target.value)
                      )
                    }
                    placeholder="Enter price in USD"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gallery-images"
                    className="text-base font-semibold"
                  >
                    Gallery Images (Max 5)
                  </Label>
                  <Input
                    id="gallery-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageChange}
                    disabled={galleryImages.length >= 5}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {galleryImages.map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Gallery image ${index + 1}`}
                          width={50}
                          height={50}
                          className="rounded-md object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-lg h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Collectible...
                  </>
                ) : (
                  "Create Collectible"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import {
  Collectible,
  Collection,
  createCollection,
  QuantityType,
  uploadImage,
} from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { NumericUUID } from "@/lib/utils";
import { useUserProfile } from "@/app/providers/UserProfileProvider";

export default function CreateCollectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [primaryImageLocalFile, setPrimaryImageLocalFile] =
    useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistId, setArtistId] = useState<number | null>(null);
  const { userProfile } = useUserProfile();

  const [newCollectible, setNewCollectible] = useState<Collectible>({
    id: NumericUUID(),
    name: "",
    description: "",
    primary_image_url: "",
    quantity_type: QuantityType.Unlimited,
    quantity: null,
    price_usd: 0,
    gallery_urls: [],
  });
  const [newCollectibleGalleryImages, setNewCollectibleGalleryImages] =
    useState<File[]>([]);

  useEffect(() => {
    if (publicKey && userProfile) {
      setArtistId(userProfile.id);
    }
  }, [publicKey, userProfile]);

  const handleCollectibleChange = (field: keyof Collectible, value: any) => {
    setNewCollectible((prev) => ({ ...prev, [field]: value }));
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

  const addCollectible = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newCollectible.name &&
      newCollectible.description &&
      newCollectible.primary_image_url &&
      newCollectibleGalleryImages.length > 0 &&
      (newCollectible.quantity_type !== QuantityType.Limited || newCollectible.quantity !== null)
    ) {
      setCollectibles((prev) => [
        ...prev,
        {
          ...newCollectible,
          id: NumericUUID(),
          gallery_urls: newCollectibleGalleryImages.map((file) =>
            URL.createObjectURL(file)
          ),
        },
      ]);
      setNewCollectible({
        id: NumericUUID(),
        name: "",
        description: "",
        primary_image_url: "",
        quantity_type: QuantityType.Unlimited,
        quantity: null,
        price_usd: 0,
        gallery_urls: [],
      });
      setPrimaryImageLocalFile(null);
      setNewCollectibleGalleryImages([]);
    } else {
      toast({
        title: "Error",
        description:
          "Please fill all required fields for the collectible, including at least one gallery image and quantity limit if applicable",
        variant: "destructive",
      });
    }
  };

  const removeCollectible = (id: number) => {
    setCollectibles((prev) =>
      prev.filter((collectible) => collectible.id !== id)
    );
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
    if (collectibles.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one collectible to the collection",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedCollectibles = await Promise.all(
        collectibles.map(async (collectible) => {
          const imageBlob = await fetch(collectible.primary_image_url).then(
            (r) => r.blob()
          );
          const imageFile = new File([imageBlob], "image.jpg", {
            type: imageBlob.type,
          });
          const imageUrl = await uploadImage(imageFile);

          const uploadedGalleryUrls = await Promise.all(
            collectible.gallery_urls.map(async (url) => {
              const galleryBlob = await fetch(url).then((r) => r.blob());
              const galleryFile = new File([galleryBlob], "gallery_image.jpg", {
                type: galleryBlob.type,
              });
              return (await uploadImage(galleryFile)) || "";
            })
          );

          return {
            ...collectible,
            primary_image_url: imageUrl || "",
            gallery_urls: uploadedGalleryUrls.filter(Boolean),
            price_usd: collectible.price_usd || 0,
          };
        })
      );

      const newCollection: Collection | null = await createCollection({
        id: NumericUUID(),
        name: collectionName,
        description: collectionDescription,
        artist: artistId,
        collectibles: updatedCollectibles,
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

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && newCollectibleGalleryImages.length < 5) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + newCollectibleGalleryImages.length <= 5) {
        setNewCollectibleGalleryImages([
          ...newCollectibleGalleryImages,
          ...filesArray,
        ]);
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
    setNewCollectibleGalleryImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
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

              <Card>
                <CardHeader>
                  <CardTitle>Collectibles in Collection</CardTitle>
                  <CardDescription>
                    Add collectibles to your collection below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {collectibles.map((collectible, index) => (
                    <div
                      key={collectible.id}
                      className="flex items-center space-x-4 p-4 bg-secondary rounded-lg"
                    >
                      <Image
                        src={collectible.primary_image_url}
                        alt={collectible.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold">{collectible.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {collectible.description.substring(0, 50)}...
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeCollectible(collectible.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">
                      Add New Collectible
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="collectible-name"
                          className="text-base font-semibold"
                        >
                          Collectible Name{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="collectible-name"
                          value={newCollectible.name}
                          onChange={(e) =>
                            handleCollectibleChange("name", e.target.value)
                          }
                          placeholder="Enter collectible name"
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
                          value={newCollectible.description}
                          onChange={(e) =>
                            handleCollectibleChange(
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Enter collectible description"
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="collectible-quantity-type"
                          className="text-base font-semibold"
                        >
                          Quantity Type{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <select
                          id="collectible-quantity-type"
                          value={newCollectible.quantity_type}
                          onChange={(e) =>
                            handleCollectibleChange(
                              "quantity_type",
                              e.target.value as QuantityType
                            )
                          }
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          <option value={QuantityType.Unlimited}>
                            Unlimited
                          </option>
                          <option value={QuantityType.Single}>Single</option>
                          <option value={QuantityType.Limited}>Limited</option>
                        </select>
                      </div>

                      {newCollectible.quantity_type === QuantityType.Limited && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="collectible-quantity-limit"
                            className="text-base font-semibold"
                          >
                            Quantity Limit{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="collectible-quantity-limit"
                            type="number"
                            value={newCollectible.quantity || ""}
                            onChange={(e) =>
                              handleCollectibleChange(
                                "quantity",
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="Enter quantity limit"
                            min="1"
                            required={newCollectible.quantity_type === QuantityType.Limited}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="collectible-price"
                          className="text-base font-semibold"
                        >
                          Price (USD){" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="collectible-price"
                          type="number"
                          value={newCollectible.price_usd}
                          onChange={(e) =>
                            handleCollectibleChange(
                              "price_usd",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="Enter price in USD"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="gallery-images"
                          className="text-base font-semibold"
                        >
                          Gallery Images (Max 5){" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="gallery-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImageChange}
                          disabled={newCollectibleGalleryImages.length >= 5}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newCollectibleGalleryImages.map((file, index) => (
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

                      <Button
                        type="button"
                        onClick={addCollectible}
                        className="w-full"
                      >
                        <PlusIcon className="mr-2 h-4 w-4" /> Add Collectible to
                        Collection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full text-lg h-12"
                disabled={isSubmitting}
              >
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

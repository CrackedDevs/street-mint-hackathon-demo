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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  XIcon,
  UserCircle2Icon,
  UploadIcon,
  TwitterIcon,
  InstagramIcon,
} from "lucide-react";
import SparklesText from "@/components/magicui/sparkles-text";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Component() {
  const { connected } = useWallet();
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    email: "",
    avatar: "",
    twitter: "",
    instagram: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to access the profile creation page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletMultiButton
              style={{
                background: "linear-gradient(to right, #ffffff, #f0f0f0)",
                color: "black",
                border: "2px solid gray",
                borderRadius: "20px",
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Card className="max-w-4xl mx-auto flex flex-col  w-full h-full gap-4">
        <SparklesText
          sparklesCount={5}
          className="items-center text-center m-6"
          text="Create Profile"
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">
                  Connect your socials
                </CardTitle>
                <CardDescription>
                  Boost your credibility by connecting one or more socials, this
                  helps us verify that you are the creator of the work
                  you&apos;re submitting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <TwitterIcon className="h-5 w-5 text-blue-400" />
                  <Input
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    className="bg-background"
                    placeholder="Twitter username"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <InstagramIcon className="h-5 w-5 text-pink-500" />
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="bg-background"
                    placeholder="Instagram username"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2 flex w-full gap-10 h-full">
              <div className="flex flex-col h-full justify-center items-center align-middle">
                <Avatar className="h-28 w-28">
                  <AvatarImage
                    src={formData.avatar || "/placeholder.svg"}
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    <UserCircle2Icon className="h-28 w-28" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <Label htmlFor="avatar" className="text-lg font-semibold">
                  Avatar <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recommended 500x500, 2.5mb max size
                </p>
                <div className="flex items-center ">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData((prev) => ({
                            ...prev,
                            avatar: event.target?.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-lg font-semibold">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-background"
                placeholder="exchange.art/"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-lg font-semibold">
                Bio <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="bg-background h-32"
              />
              <p className="text-sm text-muted-foreground">
                {1500 - formData.bio.length} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-background"
              />
              <p className="text-sm text-muted-foreground">
                This will not be shown on your profile. We will only provide you
                important notifications via email.
              </p>
            </div>
            <ShimmerButton borderRadius="6px" className="rounded w-full">
              Submit
            </ShimmerButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

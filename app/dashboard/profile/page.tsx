"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XIcon, UserCircle2Icon, UploadIcon } from "lucide-react";
import ShinyButton from "@/components/magicui/shiny-button";
import ShimmerButton from "@/components/magicui/shimmer-button";

export default function Component() {
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    email: "",
    heardFrom: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Card className="max-w-4xl mx-auto flex flex-col  w-full h-full gap-4">
        <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 m-4">
          Create Profile
        </span>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">Connect at least one social</CardTitle>
                <CardDescription>
                  Boost your credibility by connecting one or more socials, this helps us verify that you are the
                  creator of the work you&apos;re submitting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShimmerButton className=" text-white">
                  <XIcon className="mr-2 h-4 w-4" />
                  Connect Twitter
                </ShimmerButton>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-lg font-semibold">
                Avatar <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">Recommended 500x500, 2.5mb max size</p>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback>
                    <UserCircle2Icon className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
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
              <p className="text-sm text-muted-foreground">{1500 - formData.bio.length} characters remaining</p>
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
                This will not be shown on your profile. We will only provide you important notifications via email.
              </p>
            </div>
            <ShimmerButton className="shadow-2xl w-full">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Submit
              </span>
            </ShimmerButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

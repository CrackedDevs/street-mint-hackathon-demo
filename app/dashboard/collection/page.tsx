"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateArt() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create Art</h1>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="art-title">Art Title</Label>
          <Input id="art-title" placeholder="Enter the title of your artwork" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="art-description">Description</Label>
          <Input id="art-description" placeholder="Describe your artwork" />
        </div>
        <Button>Submit Artwork</Button>
      </div>
    </div>
  );
}

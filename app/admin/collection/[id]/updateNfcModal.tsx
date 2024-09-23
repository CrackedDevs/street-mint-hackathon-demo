"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateNfcPublicKey } from "./updateNfcPublicKey";

interface UpdateNfcFormProps {
  collectibleId: string;
  oldNFCPublicKey: string;
}

export default function UpdateNfcForm({ collectibleId, oldNFCPublicKey }: UpdateNfcFormProps) {
  const [newNFCPublicKey, setNewNFCPublicKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        await updateNfcPublicKey(collectibleId, newNFCPublicKey);
        toast({
          title: "Success",
          description: "NFC public key updated successfully",
        });
        window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update NFC public key",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
        <p className="font-bold">Warning</p>
        <p>Only update the NFC public key after you have first updated the collectible ID to the specific NFC chip by using the app.</p>
      </div>
      <div>
        <label htmlFor="oldNFCPublicKey" className="block text-sm font-medium text-gray-700">
          Old NFC Public Key
        </label>
        <Input
          id="oldNFCPublicKey"
          value={oldNFCPublicKey}
          readOnly
          className="mt-1 bg-gray-100"
        />
      </div>
      <div>
        <label htmlFor="newNFCPublicKey" className="block text-sm font-medium text-gray-700">
          New NFC Public Key
        </label>
        <Input
          id="newNFCPublicKey"
          placeholder="Enter new NFC public key"
          value={newNFCPublicKey}
          onChange={(e) => setNewNFCPublicKey(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update NFC Public Key"}
      </Button>
    </form>
  );
}
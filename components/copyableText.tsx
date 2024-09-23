"use client";

import { toast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { Copy } from "lucide-react"; // Import the Lucide copy icon

interface CopyableTextProps {
  displayText: string;
  copyText: string;
}

const CopyableText: React.FC<CopyableTextProps> = ({ displayText, copyText }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(copyText ?? "");
    toast({
      title: "✅ Copied to clipboard",
    });
  };

  return (
    <div className="flex items-center">
      <span
        className="truncate cursor-pointer underline"
        title={displayText ?? "None"}
        onClick={handleCopy}
      >
        {displayText}
      </span>
      <Copy className="ml-2 h-4 w-4 cursor-pointer" onClick={handleCopy} />
    </div>
  );
};

export default CopyableText;
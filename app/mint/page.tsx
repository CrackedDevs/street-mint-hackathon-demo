"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Linkedin, Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import ShimmerButton from "@/components/magicui/shimmer-button";
import ShinyButton from "@/components/magicui/shiny-button";
import MintButton from "@/components/mintButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
  </svg>
);

export default function NFTPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1200px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    "https://static01.nyt.com/images/2021/01/22/world/00louvre-dispatch7-promo/00louvre-dispatch7-mediumSquareAt3X.jpg",
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="py-4 px-6 flex  border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nIxtrb0NbLiNLLzUX3AqSmyvRlzynZ.png"
            alt="Street mint logo"
            width={150}
            height={50}
            className="h-8 w-auto"
          />
        </div>
        <WalletMultiButton
          style={{ backgroundColor: "white", color: "black", border: "2px solid gray", borderRadius: "20px" }}
        />
      </header>

      {/* Main content */}
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left column - Image Carousel */}
          <div className="relative aspect-square">
            <Image
              src={images[currentImage]}
              alt={`We'll dream of a longer summer - Image ${currentImage + 1}`}
              layout="fill"
              objectFit="contain"
              className="rounded-lg border-2 border-gray-300"
            />
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
              onClick={prevImage}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
              onClick={nextImage}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${currentImage === index ? "bg-black" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">We&apos;ll dream of a longer summer,</h1>
            <p className="text-xl text-gray-600 mb-4">From the &quot;Urban Dreamscapes&quot; Collection</p>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              <span>nearbound</span>
              <a href="#" className="text-gray-600 hover:text-black">
                <XIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <div className="mb-4">
              <span className="text-gray-600">Mint price:</span>
              <span className="text-2xl font-bold ml-2">$533.70</span>
            </div>

            <MintButton />

            <p className="text-sm text-gray-600 mb-8">
              This artwork is configured for minting. Once minted, it will be added to your collection.
            </p>

            <div className="space-y-4 mt-4">
              <p className="text-lg">
                &ldquo;We&apos;ll dream of a longer summer&rdquo; is a captivating digital artwork that blends
                surrealism with urban landscapes. The piece features a nighttime city scene with vibrant, dreamlike
                elements. In the foreground, stylized figures in colorful dresses stand out against the dark background.
                The sky is adorned with an enigmatic floating object, possibly a UFO, adding an element of mystery.
                Warm, glowing windows in the buildings create a sense of life and energy within the quiet night. The
                artwork beautifully captures the essence of summer nights in the city, blending reality with
                imagination.
              </p>
              <div className="bg-gray-100 p-2 rounded-md flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-500 rounded-md"></div>
                <div>
                  <span className="text-sm text-gray-600">#43 of 43 • Digital Collectibles</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Medium</p>
                  <p>Image (PNG)</p>
                </div>
                <div>
                  <p className="text-gray-600">File Size</p>
                  <p>146.8 MB</p>
                </div>
                <div>
                  <p className="text-gray-600">Dimensions</p>
                  <p>6749×10121</p>
                </div>
                <div>
                  <p className="text-gray-600">Contract Address</p>
                  <p className="truncate">CQtTxnRfFYYQm7fvVb91Y8MYHu6P8UhWvxo7KeXe2NP2</p>
                </div>
                <div>
                  <p className="text-gray-600">Token Standard</p>
                  <p>Metaplex</p>
                </div>
                <div>
                  <p className="text-gray-600">Blockchain</p>
                  <p>Solana</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">METADATA</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Solscan
                </Button>
                <Button variant="outline" size="sm">
                  Arweave
                </Button>
                <Button variant="outline" size="sm">
                  Metadata
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

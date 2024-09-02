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
  const mainImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1200px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";
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
          <Image src="/logo.svg" alt="Street mint logo" width={150} height={50} className="h-8 w-auto" />
        </div>
        <WalletMultiButton
          style={{ backgroundColor: "white", color: "black", border: "2px solid gray", borderRadius: "20px" }}
        />
      </header>

      {/* Main content */}
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left column - Main Image */}
          <div className="relative aspect-square">
            <Image
              src={mainImage}
              alt="We'll dream of a longer summer - Main Image"
              layout="fill"
              objectFit="contain"
            />
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">We&apos;ll dream of a longer summer,</h1>
            <p className="text-xl text-gray-600 mb-4">From the &quot;Urban Dreamscapes&quot; Collection</p>

            {/* Artist Information */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              <span className="font-semibold">nearbound</span>
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

            {/* Redesigned Limited Edition Section (Black and White) */}
            <div className="bg-black text-white p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Limited Edition</span>
                <span className="text-3xl font-bold">43 of 43</span>
              </div>
              <div className="mt-2 text-sm text-gray-300">Last chance to own this unique piece</div>
            </div>

            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-lg">Mint price:</span>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2">$533.70</span>
                <span className="text-gray-500">(4.2 SOL)</span>
              </div>
            </div>

            <MintButton />

            <p className="text-sm text-gray-600 mb-8">
              This digital collectible is configured for minting. Once minted, it will be added to your collection.
            </p>

            <div className="space-y-4 mt-4">
              <p className="text-lg">
                &quot;We&apos;ll dream of a longer summer&quot; is a captivating digital artwork that blends surrealism
                with urban landscapes. The piece features a nighttime city scene with vibrant, dreamlike elements. In
                the foreground, stylized figures in colorful dresses stand out against the dark background. The sky is
                adorned with an enigmatic floating object, possibly a UFO, adding an element of mystery. Warm, glowing
                windows in the buildings create a sense of life and energy within the quiet night. The artwork
                beautifully captures the essence of summer nights in the city, blending reality with imagination.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Art title</p>
                  <p>We&apos;ll dream of a longer summer</p>
                </div>
                <div>
                  <p className="text-gray-600">Artist</p>
                  <p>nearbound</p>
                </div>
                <div>
                  <p className="text-gray-600">Location minted</p>
                  <p>NFT.NYC 2023</p>
                </div>
                <div>
                  <p className="text-gray-600">Limited Edition</p>
                  <p>Run of 43 Digital Collectibles</p>
                </div>
                <div>
                  <p className="text-gray-600">Price per edition</p>
                  <p>$533.70 (4.2 SOL)</p>
                </div>
                <div>
                  <p className="text-gray-600">Blockchain</p>
                  <p>Solana</p>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Image Gallery</h3>
              <div className="relative aspect-square">
                <Image
                  src={images[currentImage]}
                  alt={`Gallery image ${currentImage + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
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
                      className={`h-2 w-2 rounded-full ${currentImage === index ? "bg-white" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

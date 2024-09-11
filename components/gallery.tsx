"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Image Gallery</h3>
      <div className="relative aspect-square">
        <Image
          src={images[currentImage]}
          alt={`Gallery image ${0 + 1}`}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
          onClick={() => {
            prevImage();
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
          onClick={() => {
            nextImage();
          }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {images.map((_: any, index: number) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                0 === index ? "bg-white" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const IrlInputButton = ({
  walletAddress,
  setwalletAddress,
}: {
  walletAddress: string;
  setwalletAddress: (address: string) => void;
}) => {
  const handleCollect = () => {
    if (walletAddress.length > 0) {
      window.scrollTo({
        top: document.getElementById("main-content")?.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.input
        type="text"
        placeholder="Enter your .SOL or wallet address"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        value={walletAddress}
        onChange={(e) => setwalletAddress(e.target.value)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.button
        onClick={handleCollect}
        className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        COLLECT
      </motion.button>
    </div>
  );
};

export default IrlInputButton;

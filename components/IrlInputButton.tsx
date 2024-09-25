"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const IrlInputButton = () => {
  const handleCollect = () => {
      window.scrollTo({
      top: document.getElementById("main-content")?.offsetTop,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
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

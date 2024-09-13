"use client";

import { motion } from "framer-motion";

interface PriceComponentProps {
  priceUSD: number;
  priceSOL: number;
}

export default function PriceComponent({
  priceUSD,
  priceSOL,
}: PriceComponentProps) {
  return (
    <motion.div
      className="bg-gradient-to-r from-gray-900 via-gray-700 to-black text-white p-6 rounded-lg mb-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Price</span>
        <motion.div
          className="text-3xl font-bold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          ${priceUSD.toFixed(2)}
        </motion.div>
      </div>
      <div className="mt-2 text-sm text-gray-200">
        ({priceSOL.toFixed(2)} SOL)
      </div>
    </motion.div>
  );
}

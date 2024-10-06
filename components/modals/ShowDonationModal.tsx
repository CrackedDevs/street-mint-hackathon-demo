"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { HeartIcon, CheckIcon, CopyIcon } from "lucide-react";
import Artist from "@/app/assets/artist.png";
import { useState } from "react";

interface ShowDonationModalProps {
  showDonationModal: boolean;
  setShowDonationModal: (show: boolean) => void;
  artistWalletAddress: string;
}

const ShowDonationModal: React.FC<ShowDonationModalProps> = ({
  showDonationModal,
  setShowDonationModal,
  artistWalletAddress,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(artistWalletAddress).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      {showDonationModal && (
        <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
          <DialogContent className="">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${Artist.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.1,
              }}
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
                className="mb-6"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                  <HeartIcon className="w-24 h-24 text-red-500 relative z-10" />
                </div>
              </motion.div>

              <DialogTitle className="text-3xl font-bold mb-4 text-primary">Support the Creator</DialogTitle>

              <p className="text-lg mb-6">Dig this artwork? Give the artist some love and donate a little SOL</p>

              <div className="bg-black text-white p-4 rounded-lg shadow-lg mb-6">
                <h3 className="font-semibold mb-2">Creators Wallet Address</h3>
                <div className="flex items-center justify-between bg-white text-black p-2 rounded">
                  <code className="text-sm">{artistWalletAddress}</code>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="ml-2">
                    {isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ShowDonationModal;

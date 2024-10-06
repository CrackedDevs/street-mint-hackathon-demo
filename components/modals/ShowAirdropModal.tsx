import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

const ShowAirdropModal = ({
  showAirdropModal,
  setShowAirdropModal,
}: {
  showAirdropModal: boolean;
  setShowAirdropModal: (show: boolean) => void;
}) => {
  if (!showAirdropModal) return null;
  return (
    <Dialog open={showAirdropModal} onOpenChange={setShowAirdropModal}>
      <DialogContent>
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
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl"></div>
              <Image
                height={100}
                width={100}
                src="https://bonkcoin.com/static/media/bonkog_800.18d79e1cea6b283f2ee7.png"
                alt="Bonk"
                className="w-24 h-24 text-yellow-500 relative z-10"
              />
            </div>
          </motion.div>

          <DialogTitle className="text-3xl font-bold mb-4 text-primary">Congratulations!</DialogTitle>

          <p className="text-lg mb-6">You&apos;ve won a $BONK airdrop worth $10! 🎉</p>
          <p className="text-md mb-6">
            We have recorded your wallet address and will airdrop the $BONK tokens at the end of the day.
          </p>

          <Button
            onClick={() => setShowAirdropModal(false)}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors duration-200"
          >
            Close
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowAirdropModal;

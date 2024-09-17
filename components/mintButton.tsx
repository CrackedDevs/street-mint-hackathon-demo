"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import WhiteBgShimmerButton from "./magicui/whiteBg-shimmer-button";
import {
  checkMintEligibility,
  Collectible,
  Collection,
  getExistingOrder,
} from "@/lib/supabaseClient";
import { generateDeviceId } from "@/lib/fingerPrint";
import { Input } from "./ui/input";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, CopyIcon, HeartIcon } from "lucide-react";
import { Button } from "./ui/button";
import Artist from "@/app/assets/artist.png";
import LocationButton from "./LocationButton";
interface MintButtonProps {
  collectible: Collectible;
  collection: Collection;
  artistWalletAddress: string;
  isIRLtapped: boolean;
  inputWalletAddress?: string;
  mintStatus: string;
}

export default function MintButton({
  collectible,
  collection,
  artistWalletAddress,
  inputWalletAddress: initialWalletAddress,
  isIRLtapped,
  mintStatus,
}: MintButtonProps) {
  const { connected, connect, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isMinting, setIsMinting] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [deviceId, setDeviceId] = useState("");
  const [existingOrder, setExistingOrder] = useState<any | null>(null);
  const isFreeMint = collectible.price_usd === 0;
  const [walletAddress, setWalletAddress] = useState(
    initialWalletAddress || ""
  );
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isIrlMint = !!initialWalletAddress;

  const TriggerConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  useEffect(() => {
    async function fetchDeviceId() {
      const id = await generateDeviceId();
      setDeviceId(id);
    }
    fetchDeviceId();
  }, []);

  useEffect(() => {
    if (isIrlMint && !initialWalletAddress) {
      window.scrollTo(0, 0);
    }
  }, [isIrlMint, initialWalletAddress]);

  async function checkEligibilityAndExistingOrder() {
    const addressToCheck = isFreeMint ? walletAddress : publicKey?.toString();
    if (addressToCheck && deviceId) {
      try {
        const { eligible, reason } = await checkMintEligibility(
          addressToCheck,
          collectible.id,
          deviceId
        );
        setIsEligible(eligible);
        if (!eligible) {
          setError(reason || "You are not eligible to mint this NFT.");
        } else {
          setError(null);
        }

        const order = await getExistingOrder(addressToCheck, collectible.id);
        setExistingOrder(order);
        if (order) {
          setTransactionSignature(order.mint_signature);
        }
      } catch (error) {
        console.error("Error checking eligibility or existing order:", error);
        setError("Failed to check minting eligibility.");
        setIsEligible(false);
      }
    } else {
      setIsEligible(false);
      setExistingOrder(null);
    }
  }

  useEffect(() => {
    checkEligibilityAndExistingOrder();
  }, [
    connected,
    publicKey,
    walletAddress,
    deviceId,
    collectible.id,
    isFreeMint,
  ]);

  const handlePaymentAndMint = async () => {
    const addressToUse = isFreeMint ? walletAddress : publicKey?.toString();
    if (!addressToUse || !isEligible) {
      return;
    }
    setIsMinting(true);
    setError(null);

    try {
      let signedTransaction = null;

      const initResponse = await fetch("/api/collection/mint/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectibleId: collectible.id,
          walletAddress: addressToUse,
          deviceId: deviceId,
          collectionId: collection.id,
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || "Failed to initiate minting");
      }
      let priceInSol = 0;
      const { orderId, isFree } = await initResponse.json();

      if (!isFree && publicKey) {
        // Step 2: Create payment transaction (only for paid mints)
        const solPrice = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const solPriceData = await solPrice.json();

        if (solPriceData && !solPriceData.solana) {
          return;
        }
        const solPriceUSD = solPriceData.solana.usd;
        priceInSol = collectible.price_usd / solPriceUSD;
        const lamports = Math.round(priceInSol * LAMPORTS_PER_SOL);
        const instructions = [
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(artistWalletAddress),
            lamports: lamports,
          }),
        ];

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        // Sign the transaction
        if (!signTransaction) {
          toast({
            title: "Error",
            description: "Failed to sign transaction",
            variant: "destructive",
          });
          return;
        }
        let signedTx;
        // Serialize the signed transaction
        signedTx = await signTransaction(transaction);
        signedTransaction = Buffer.from(signedTx.serialize()).toString(
          "base64"
        );
      }

      const processResponse = await fetch("/api/collection/mint/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          signedTransaction,
          priceInSol,
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || "Failed to process minting");
      }

      const { success, txSignature, mintSignature } =
        await processResponse.json();
      if (success) {
        setTransactionSignature(mintSignature);
        TriggerConfetti();
        setExistingOrder({ id: orderId, status: "completed" });
        toast({
          title: "NFT Minted Successfully",
          description: `Mint signature: ${mintSignature}`,
        });
        setIsEligible(false);
        //TODO: UNCOMMENT THIS AFTER 20 SEPTEMBER 2024
        //setShowDonationModal(true);
        //TODO: UNCOMMENT THIS AFTER 20 SEPTEMBER 2024
      } else {
        throw new Error("Minting process failed");
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      toast({
        title: "Something went wrong while minting your collectible",
        description:
          error.message ||
          "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setError("An unexpected error occurred");
    } finally {
      setIsMinting(false);
    }
  };

  const handleMintClick = async () => {
    await checkEligibilityAndExistingOrder();
    if (isFreeMint) {
      if (!walletAddress) {
        toast({
          title: "Error",
          description: "Please enter a valid wallet address",
          variant: "destructive",
        });
        return;
      }
    } else if (!connected) {
      try {
        await connect();
        return;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        return;
      }
    }

    if (!deviceId) {
      toast({
        title: "Error",
        description: "Unable to get device ID",
        variant: "destructive",
      });
      return;
    }

    if (!isEligible) {
      toast({
        title: "Error",
        description: "You are not eligible to mint this NFT",
        variant: "destructive",
      });
      return;
    }

    await handlePaymentAndMint();
  };

  const getButtonText = () => {
    if (isFreeMint && !walletAddress) return "COLLECT NOW";
    if (isMinting) return "PROCESSING...";
    if (existingOrder && existingOrder.status == "completed") return "MINTED!";
    if (isEligible) return "MINT NOW";
    if (!isEligible) return "NOT ELIGIBLE";
    return "NOT STARTED";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(artistWalletAddress).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!isIRLtapped) {
    if (collectible.location)
      return (
        <div className="flex flex-col gap-4 w-full justify-center items-center">
          <span className="text-sm text-gray-400 mb-2">
            {collectible.location_note}
          </span>
          <LocationButton location={collectible.location} />
        </div>
      );
    else {
      return <div></div>;
    }
  }

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {showDonationModal && (
        <div>
          <AnimatePresence>
            <Dialog
              open={showDonationModal}
              onOpenChange={setShowDonationModal}
            >
              <DialogContent className=" ">
                <div
                  className="absolute  inset-0 z-0"
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

                  <DialogTitle className="text-3xl font-bold mb-4 text-primary">
                    Support the Creator
                  </DialogTitle>

                  <p className="text-lg mb-6">
                    Dig this artwork? Give the artist some love and donate a
                    little SOL
                  </p>

                  <div className="bg-black text-white p-4 rounded-lg shadow-lg mb-6">
                    <h3 className="font-semibold mb-2">
                      Creators Wallet Address
                    </h3>
                    <div className="flex items-center justify-between bg-white text-black p-2 rounded">
                      <code className="text-sm">{artistWalletAddress}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="ml-2"
                      >
                        {isCopied ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          </AnimatePresence>
        </div>
      )}
      {mintStatus === "ongoing" && (
        <>
          {isFreeMint ? (
            <div className="w-full flex flex-col items-center justify-center">
              <Input
                type="text"
                placeholder="Enter wallet address"
                value={initialWalletAddress || walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full h-12 mb-4 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
              />
              <WhiteBgShimmerButton
                borderRadius="6px"
                className="w-full mb-4 hover:bg-gray-800 h-[45px] text-black rounded font-bold"
                onClick={handleMintClick}
                disabled={
                  isMinting || !isEligible || existingOrder || !walletAddress
                }
              >
                {getButtonText()}
              </WhiteBgShimmerButton>
            </div>
          ) : !connected ? (
            <WalletMultiButton
              style={{
                backgroundColor: "white",
                color: "black",
                width: "100%",
                marginBottom: "20px",
                borderRadius: "6px",
              }}
            />
          ) : (
            isEligible && (
              <WhiteBgShimmerButton
                borderRadius="6px"
                className="w-full mb-4  text-black hover:bg-gray-800 h-[40px] rounded font-bold"
                onClick={handleMintClick}
                disabled={
                  isMinting ||
                  !isEligible ||
                  existingOrder?.status == "completed"
                }
              >
                {getButtonText()}
              </WhiteBgShimmerButton>
            )
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {transactionSignature && (
            <a
              href={
                process.env.NODE_ENV === "development"
                  ? `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
                  : `https://explorer.solana.com/tx/${transactionSignature}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 mt-2 hover:underline"
            >
              View Transaction
            </a>
          )}
        </>
      )}
    </div>
  );
}

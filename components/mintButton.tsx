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
  updateOrderAirdropStatus,
} from "@/lib/supabaseClient";
import { Input } from "./ui/input";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  Coins,
  CopyIcon,
  ExternalLink,
  HeartIcon,
  Unplug,
  Wallet,
} from "lucide-react";
import { Button } from "./ui/button";
import Artist from "@/app/assets/artist.png";
import LocationButton from "./LocationButton";
import { SolanaFMService } from "@/lib/services/solanaExplorerService";
import Link from "next/link";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { v4 as uuidv4 } from "uuid";
import { shortenAddress } from "@/lib/shortenAddress";
import Image from "next/image";

interface MintButtonProps {
  collectible: Collectible;
  collection: Collection;
  artistWalletAddress: string;
  isIRLtapped: boolean;
  mintStatus: string;
}

export default function MintButton({
  collectible,
  collection,
  artistWalletAddress,
  isIRLtapped,
  mintStatus,
}: MintButtonProps) {
  const {
    connected,
    connect,
    publicKey,
    signTransaction,
    select,
    connecting,
    disconnect,
  } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const { connection } = useConnection();
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [existingOrder, setExistingOrder] = useState<any | null>(null);
  const isFreeMint = collectible.price_usd === 0;
  const [walletAddress, setWalletAddress] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [isAirdropEligible, setIsAirdropEligible] = useState(false);

  const {
    isLoading: isFingerPrintLoading,
    error: FingerPrintError,
    data: fingerPrintData,
    getData,
  } = useVisitorData({ extendedResult: true }, { immediate: true });

  const TriggerConfetti = (): void => {
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

  async function fetchDeviceId() {
    let deviceId = localStorage.getItem("DeviceId");
    console.log("Device ID in mintButton.tsx:", deviceId);
    try {
      if (!deviceId) {
        const id = await getData({ ignoreCache: true });
        setDeviceId(id.visitorId);
        // Store the new device ID
        localStorage.setItem("DeviceId", id.visitorId);
      }
      setDeviceId(deviceId!);
      return deviceId;
    } catch (error) {
      console.error("Error fetching or setting device ID:", error);
      const newDeviceID = uuidv4();
      localStorage.setItem("DeviceId", newDeviceID);
      setDeviceId(newDeviceID);
      return newDeviceID;
    }
  }
  useEffect(() => {
    fetchDeviceId();
  }, []);

  async function checkEligibilityAndExistingOrder() {
    if (connected) {
      setWalletAddress(publicKey?.toString() || "");
    }
    const addressToCheck = isFreeMint ? walletAddress : publicKey?.toString();
    if (!deviceId) {
      const device = await fetchDeviceId();
    }
    if (addressToCheck && deviceId) {
      setIsLoading(true);
      try {
        const {
          eligible,
          reason,
          isAirdropEligible: airdropEligible,
        } = await checkMintEligibility(
          addressToCheck,
          collectible.id,
          deviceId
        );
        setIsEligible(eligible);
        setIsAirdropEligible(airdropEligible || false);
        setIsLoading(false);
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
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
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

      const { success, tokenAddress, mintSignature } =
        await processResponse.json();
      if (success) {
        setTransactionSignature(mintSignature);
        setTokenAddress(tokenAddress);
        TriggerConfetti();
        setExistingOrder({ id: orderId, status: "completed" });
        toast({
          title: "✅ NFT Minted Successfully",
        });
        setIsEligible(false);
        if (isAirdropEligible) {
          setShowAirdropModal(true);
          updateOrderAirdropStatus(orderId, true);
          console.log(
            "Order airdrop status updated to true won by user ",
            walletAddress,
            " for order id ",
            orderId
          );
        }
        //TODO: UNCOMMENT THIS AFTER 20 SEPTEMBER 2024
        //setShowDonationModal(true);
        //TODO: UNCOMMENT THIS AFTER 20 SEPTEMBER 2024
      } else {
        throw new Error("Minting process failed");
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      toast({
        title: "Something went wrong while minting your collectible ",
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
    setIsMinting(true);
    await checkEligibilityAndExistingOrder();
    if (isFreeMint) {
      if (!walletAddress) {
        toast({
          title: "Error",
          description: "Please enter a valid wallet address",
          variant: "destructive",
        });
        setIsMinting(false);
        return;
      }
    } else if (!connected) {
      try {
        await connect();
        setIsMinting(false);
        return;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setIsMinting(false);
        return;
      }
    }

    if (!deviceId) {
      toast({
        title: "Error",
        description: "Unable to get device ID",
        variant: "destructive",
      });
      setIsMinting(false);
      return;
    }

    if (!isEligible) {
      toast({
        title: "Error",
        description: "You are not eligible to mint this NFT",
        variant: "destructive",
      });
      setIsMinting(false);
      return;
    }
    await handlePaymentAndMint();
    setIsMinting(false);
  };

  const getButtonText = () => {
    if (isFreeMint && !walletAddress) return "COLLECT NOW";
    if (connecting) return "CONNECTING...";
    if (isMinting) return "PROCESSING...";
    if (isLoading) return "Checking Eligibility...";
    if (!isEligible) return "NOT ELIGIBLE";
    if (isEligible) return "MINT NOW";
    return "LOADING...";
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

  const handleConnect = () => {
    const button = document.querySelector(
      ".wallet-adapter-button"
    ) as HTMLElement;
    if (button) {
      button.click();
    }
  };

  const renderWalletButton = () => (
    <button
      onClick={connected ? disconnect : () => handleConnect()}
      className={`w-full h-10 ${
        connected
          ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
          : "bg-white text-black"
      } font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center`}
    >
      {connected ? (
        <>
          <Unplug className="mr-2 h-5 w-5" />
          Disconnect {publicKey && shortenAddress(publicKey.toString())}
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-5 w-5" />
          Connect wallet
        </>
      )}
    </button>
  );

  const renderMintButton = () => (
    <WhiteBgShimmerButton
      borderRadius="6px"
      className="w-full my-4 text-black hover:bg-gray-800 h-[40px] rounded font-bold"
      onClick={handleMintClick}
      disabled={
        isMinting ||
        !isEligible ||
        existingOrder?.status === "completed" ||
        isLoading
      }
    >
      {getButtonText()}
    </WhiteBgShimmerButton>
  );

  const renderCompletedMint = () => (
    <div className="flex flex-col items-center space-y-2 mt-4 w-full">
      <Link
        href={SolanaFMService.getAddress(
          tokenAddress || existingOrder.mint_address
        )}
        target="_blank"
        className="w-full"
      >
        <WhiteBgShimmerButton
          borderRadius="6px"
          className="w-full mb-4 hover:bg-gray-800 h-[45px] text-black rounded font-bold"
        >
          VIEW COLLECTIBLE
        </WhiteBgShimmerButton>
      </Link>
      <Link
        href={SolanaFMService.getTransaction(
          transactionSignature || existingOrder.mint_signature
        )}
        target="_blank"
      >
        <button className="text-sm text-white transition-colors flex items-center">
          <ExternalLink className="w-4 h-4 mr-1" />
          View Transaction
        </button>
      </Link>
    </div>
  );

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
      {showAirdropModal && (
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

              <DialogTitle className="text-3xl font-bold mb-4 text-primary">
                Congratulations!
              </DialogTitle>

              <p className="text-lg mb-6">
                You&apos;ve won a $BONK airdrop worth $10! 🎉
              </p>
              <p className="text-md mb-6">
                We have recorded your wallet address and will airdrop the $BONK
                tokens at the end of the day.
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
      )}
      {((transactionSignature && tokenAddress) ||
        existingOrder?.status === "completed") &&
        renderCompletedMint()}
      {mintStatus === "ongoing" && (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full">
            {isFreeMint ? (
              <div className="w-full flex mt-2 flex-col items-center justify-center">
                <Input
                  type="text"
                  placeholder="Enter your Solana address or .SOL"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full h-12 mb-4 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
                />
                {existingOrder?.status !== "completed" &&
                  walletAddress &&
                  renderMintButton()}
              </div>
            ) : (
              <div className="w-full mt-4 flex flex-col items-center justify-center">
                {renderWalletButton()}
                <div className="hidden">
                  <WalletMultiButton />
                </div>

                {existingOrder?.status !== "completed" &&
                  walletAddress &&
                  renderMintButton()}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

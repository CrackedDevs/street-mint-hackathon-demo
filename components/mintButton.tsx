"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import ShimmerButton from "./magicui/shimmer-button";
import WhiteBgShimmerButton from "./magicui/whiteBg-shimmer-button"
import {
  checkMintEligibility,
  Collectible,
  Collection,
  createOrder,
  getExistingOrder,
} from "@/lib/supabaseClient";
import { generateDeviceId } from "@/lib/fingerPrint";
import { Input } from "./ui/input";
import confetti from "canvas-confetti";

interface MintButtonProps {
  collectible: Collectible;
  collection: Collection;
  walletAddress?: string;
}

export default function MintButton({
  collectible,
  collection,
  walletAddress: initialWalletAddress,
}: MintButtonProps) {
  const {
    connected,
    connect,
    publicKey,
    signTransaction,
  } = useWallet();
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
        const treasuryWallet = new PublicKey(
          process.env.NEXT_PUBLIC_TREASURY_WALLET!
        );
        const solPrice = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const solPriceData = await solPrice.json();
        const solPriceUSD = solPriceData.solana.usd;
        priceInSol = collectible.price_usd / solPriceUSD;
        const lamports = Math.round(priceInSol * LAMPORTS_PER_SOL);

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: treasuryWallet,
            lamports,
          })
        );

        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

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
        signedTransaction = signedTx.serialize().toString("base64");
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
      } else {
        throw new Error("Minting process failed");
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      toast({
        title: "Minting Failed",
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
    if (isFreeMint && !walletAddress) return "Enter wallet address";
    if (isMinting) return "PROCESSING...";
    if (existingOrder && existingOrder.status == "completed") return "MINTED!";
    if (isEligible) return "MINT NOW";
    if (!isEligible) return "NOT ELIGIBLE";
    return "NOT";
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {isFreeMint && !isIrlMint ? (
        <div className="w-full flex flex-col items-center justify-center">
          <Input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full h-12 mb-4 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
          />
          <WhiteBgShimmerButton
            borderRadius="6px"
            className="w-full mb-4 hover:bg-gray-800 h-[45px] text-black rounded font-bold"
            onClick={handleMintClick}
            disabled={isMinting || !isEligible || existingOrder}
          >
            {getButtonText()}
          </WhiteBgShimmerButton>
        </div>
      ) : !connected && !isIrlMint ? (
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
            className="w-full mb-4 bg-black text-white hover:bg-gray-800 h-[40px] rounded font-bold"
            onClick={handleMintClick}
            disabled={
              isMinting || !isEligible || existingOrder?.status == "completed"
            }
          >
            {getButtonText()}
          </WhiteBgShimmerButton>
        )
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {transactionSignature && (
        <a
          href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 mt-2 hover:underline"
        >
          View Transaction
        </a>
      )}
    </div>
  );
}

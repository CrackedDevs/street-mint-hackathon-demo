"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
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
import LocationButton from "./LocationButton";
import { SolanaFMService } from "@/lib/services/solanaExplorerService";
import Link from "next/link";
import { GoogleViaTipLinkWalletName } from "@tiplink/wallet-adapter";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { v4 as uuidv4 } from "uuid";
import { shortenAddress } from "@/lib/shortenAddress";
import ShowAirdropModal from "./modals/ShowAirdropModal";
import ShowDonationModal from "./modals/ShowDonationModal";
import { ExternalLink, Unplug } from "lucide-react";
import { Wallet } from "lucide-react";

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
  const { connected, connect, publicKey, signTransaction, select, connecting, disconnect } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const { connection } = useConnection();
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [existingOrder, setExistingOrder] = useState<any | null>(null);
  const isFreeMint = collectible.price_usd === 0;
  const [walletAddress, setWalletAddress] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [isAirdropEligible, setIsAirdropEligible] = useState(false);
  const [tipLinkUrl, setTipLinkUrl] = useState<string | null>(null);

  const { getData } = useVisitorData({ extendedResult: true }, { immediate: true });

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
        } = await checkMintEligibility(addressToCheck, collectible.id, deviceId);
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
  }, [connected, publicKey, walletAddress, deviceId, collectible.id, isFreeMint]);

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
    }
  }, [connected]);

  const handlePaymentAndMint = async () => {
    const addressToUse = isFreeMint ? walletAddress : publicKey?.toString();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressToUse || "");
    console.log("isEmail", isEmail);
    console.log("addressToUse", addressToUse);

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
      const { orderId, isFree, tipLinkWalletAddress, tipLinkUrl } = await initResponse.json();
      setTipLinkUrl(tipLinkUrl);
      if (!isFree && publicKey) {
        // Step 2: Create payment transaction (only for paid mints)
        const solPrice = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
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

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
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
        signedTransaction = Buffer.from(signedTx.serialize()).toString("base64");
      }

      const processResponse = await fetch("/api/collection/mint/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          tipLinkWalletAddress,
          signedTransaction,
          priceInSol,
          isEmail,
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || "Failed to process minting");
      }

      const { success, tokenAddress, mintSignature } = await processResponse.json();
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
        description: error.message || "An unexpected error occurred. Please try again later.",
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

  const sendTipLinkUrl = async () => {
    const response = await fetch("/api/mailer/sendTiplinkUrl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "lovlyraghav1@gmail.com", tiplinkUrl: "linkkkk" }),
    });
  };

  if (!isIRLtapped) {
    if (collectible.location)
      return (
        <div className="flex flex-col gap-4 w-full justify-center items-center">
          <span className="text-sm text-gray-400 mb-2">{collectible.location_note}</span>
          <LocationButton location={collectible.location} />
        </div>
      );
    else {
      return <div></div>;
    }
  }
  const handleConnect = () => {
    const button = document.querySelector(".wallet-adapter-button") as HTMLElement;
    if (button) {
      button.click();
    }
  };

  const renderWalletButton = () => (
    <button
      onClick={connected ? disconnect : () => handleConnect()}
      className={`w-full h-10 ${
        connected ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-white text-black"
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
      disabled={isMinting || !isEligible || existingOrder?.status === "completed" || isLoading}
    >
      {getButtonText()}
    </WhiteBgShimmerButton>
  );

  const renderCompletedMint = () => (
    <div className="flex flex-col items-center space-y-2 mt-4 w-full">
      <Link
        href={SolanaFMService.getAddress(tokenAddress || existingOrder.mint_address)}
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
      <Link href={SolanaFMService.getTransaction(transactionSignature || existingOrder.mint_signature)} target="_blank">
        <button className="text-sm text-white transition-colors flex items-center">
          <ExternalLink className="w-4 h-4 mr-1" />
          View Transaction
        </button>
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <button onClick={sendTipLinkUrl}>Send Tip Link Url</button>
      <ShowDonationModal
        showDonationModal={showDonationModal}
        setShowDonationModal={setShowDonationModal}
        artistWalletAddress={artistWalletAddress}
      />
      <ShowAirdropModal showAirdropModal={showAirdropModal} setShowAirdropModal={setShowAirdropModal} />

      {((transactionSignature && tokenAddress) || existingOrder?.status === "completed") && renderCompletedMint()}
      {mintStatus === "ongoing" && (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full">
            {isFreeMint ? (
              <div className="w-full flex mt-2 gap-4 flex-col items-center justify-center">
                <Input
                  type="text"
                  placeholder="Enter your Solana address or .SOL"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
                />
                <span>OR</span>
                <div className="w-full">
                  {!connected ? (
                    <button
                      onClick={() => {
                        select(GoogleViaTipLinkWalletName);
                      }}
                      className="w-full h-10 bg-white  text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center"
                    >
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect with Google
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await disconnect();
                        setWalletAddress("");
                        setError(null);
                        console.log("Change wallet clicked");
                      }}
                      className="w-full h-10 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center"
                    >
                      <Unplug className="mr-2 h-5 w-5" />
                      Change Wallet
                    </button>
                  )}
                </div>
                {existingOrder?.status !== "completed" && walletAddress && renderMintButton()}
              </div>
            ) : (
              <div className="w-full mt-4 flex flex-col items-center justify-center">
                {renderWalletButton()}
                <div className="hidden">
                  <WalletMultiButton />
                </div>

                {existingOrder?.status !== "completed" && walletAddress && renderMintButton()}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

"use client";

import ShimmerButton from "./magicui/shimmer-button";
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";

export default function MintButton() {
  const handleWalletPayment = async () => {
      const crossmintButton = document.querySelector('.crossmintButton-0-2-1') as HTMLButtonElement;
      if (crossmintButton) {
        crossmintButton.click();
      }
    };

  return (
    <>
        <ShimmerButton
          borderRadius="6px"
          className="w-full mb-4 bg-black text-white hover:bg-gray-800 h-[40px] rounded font-bold"
          onClick={handleWalletPayment}
        >
          MINT NOW
        </ShimmerButton>
        <div className="hidden">
        <CrossmintPayButton 
            projectId={process.env.NEXT_PUBLIC_CROSSMINT_PROJECT_ID!}
            collectionId={process.env.NEXT_PUBLIC_CROSSMINT_COLLECTION_ID!}
            environment={process.env.NEXT_PUBLIC_CROSSMINT_ENVIRONMENT!}
            showOverlay
          />
          </div>
        </>
  );
}

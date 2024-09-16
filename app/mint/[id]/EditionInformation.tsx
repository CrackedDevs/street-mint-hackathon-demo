"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collectible, Collection, QuantityType } from "@/lib/supabaseClient";
import MintButton from "@/components/mintButton";
import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";
import SparklesText from "@/components/magicui/sparkles-text";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { cn } from "@/lib/utils";

const EditionInformation = ({
  collection,
  collectible,
  remainingQuantity,
  artistWalletAddress,
}: {
  collection: Collection;
  collectible: Collectible;
  remainingQuantity: number | null;
  artistWalletAddress: string;
}) => {
  const getEditionTypeText = (type: QuantityType) => {
    switch (type) {
      case "unlimited":
        return "Open Edition";
      case "limited":
        return "Limited Edition";
      case "single":
        return "1 0f 1";
      default:
        return "Unknown Edition Type";
    }
  };

  return (
    <div>
      {" "}
      <Card className="bg-black mx-auto text-white my-2">
        <CardHeader className="space-y-3 flex  justify-between ">
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-black text-md md:text-lg">
                {getEditionTypeText(collectible.quantity_type as QuantityType)}
              </Badge>
              <span className="md:text-2xl text-md ml-2 font-bold">
                {collectible.quantity_type === QuantityType.Limited && remainingQuantity !== null && (
                  <span>
                    {remainingQuantity} of {collectible.quantity}
                  </span>
                )}
              </span>
            </div>
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800 w-fit"
              )}
            >
              <AnimatedShinyText className="inline-flex w-fit items-center justify-center px-2 md:px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span>✨ Gasless Mint</span>
              </AnimatedShinyText>
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold">{collectible.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between flex-col items-baseline">
            <div className="flex w-full  justify-center items-center">
              <SparklesText
                className="text-5xl font-bold"
                sparklesCount={5}
                text={`${collectible.price_usd === 0 ? "Free Mint" : `$${collectible.price_usd.toFixed(2)}`}`}
              />
            </div>

            {collectible.quantity_type === "limited" && (
              <div className="text-lg mt-4 text-grey-300">
                {remainingQuantity === 1 ? "Last one available!" : `${remainingQuantity} editions left`}
              </div>
            )}
            {collectible.quantity_type === "single" && <div className="text-lg text-grey-300">1 of 1</div>}
            {collectible.quantity_type === "unlimited" && <div className="text-lg text-grey-300">Open Edition</div>}
          </div>
          <MintButton
            artistWalletAddress={artistWalletAddress}
            collectible={{
              ...collectible,
              quantity_type: collectible.quantity_type as QuantityType,
              location: collectible.metadata_uri || "",
              metadata_uri: collectible.metadata_uri || "",
              nfc_public_key: collectible.nfc_public_key || "",
            }}
            collection={{
              ...collection,
              artist: collection.artist || 0,
              collectibles: [],
              collection_mint_public_key: collection.collection_mint_public_key || "",
              metadata_uri: collection.metadata_uri || "",
              merkle_tree_public_key: collection.merkle_tree_public_key || "",
            }}
          />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-300">
            This digital collectible is configured for minting. Once minted, it will be added to your collection.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditionInformation;

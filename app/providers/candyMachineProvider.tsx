"use client";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine as mplCoreCandyMachine,
  create,
  addConfigLines,
  fetchCandyMachine,
  deleteCandyMachine,
  mintV1,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
  Umi,
  PublicKey,
  generateSigner,
  transactionBuilder,
  keypairIdentity,
  some,
  sol,
  dateTime,
  TransactionBuilderSendAndConfirmOptions,
  KeypairSigner,
} from "@metaplex-foundation/umi";
import { createCollectionV1 } from "@metaplex-foundation/mpl-core";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface ExpectedCandyMachineState {
  itemsLoaded: number;
  itemsRedeemed: number;
  authority: PublicKey;
  collection: PublicKey;
}

const options: TransactionBuilderSendAndConfirmOptions = {
  send: { skipPreflight: true },
  confirm: { commitment: "processed" },
};

interface CandyMachineContextType {
  umi: Umi | null;
  setupCandyMachineAndCreateCollection: () => Promise<void>;
}

const CandyMachineContext = createContext<CandyMachineContextType | undefined>(
  undefined
);

export const useCandyMachine = () => {
  const context = useContext(CandyMachineContext);
  if (!context) {
    throw new Error(
      "useCandyMachine must be used within a CandyMachineProvider"
    );
  }
  return context;
};

interface CandyMachineProviderProps {
  children: ReactNode;
}

export const CandyMachineProvider: React.FC<CandyMachineProviderProps> = ({
  children,
}) => {
  const { wallet } = useWallet();
  const [umi, setUmi] = useState<Umi | null>(null);

  const [keypair, setKeypair] = useState<KeypairSigner | null>(null);
  const [collectionMint, setCollectionMint] = useState<KeypairSigner | null>(
    null
  );
  const [treasury, setTreasury] = useState<KeypairSigner | null>(null);
  const [candyMachine, setCandyMachine] = useState<KeypairSigner | null>(null);

  useEffect(() => {
    if (umi) {
      setKeypair(generateSigner(umi));
      setCollectionMint(generateSigner(umi));
      setTreasury(generateSigner(umi));
      setCandyMachine(generateSigner(umi));
    }
  }, [umi]);

  useEffect(() => {
    if (wallet) {
      const initUmi = createUmi(process.env.NEXT_PUBLIC_RPC_URL!)
        .use(mplTokenMetadata())
        .use(mplCandyMachine())
        .use(walletAdapterIdentity(wallet.adapter));
      setUmi(initUmi);
    }
  }, [wallet]);

  const setupCandyMachineAndCreateCollection = async () => {
    if (!umi || !collectionMint || !candyMachine || !treasury) {
      console.log("UMI or required components not initialized");
      return;
    }

    // Check Candy Machine
    const checkCandyMachine = async (
      candyMachine: PublicKey,
      expectedCandyMachineState: ExpectedCandyMachineState,
      step?: number
    ) => {
      try {
        const loadedCandyMachine = await fetchCandyMachine(
          umi,
          candyMachine,
          options.confirm
        );
        const { itemsLoaded, itemsRedeemed, authority, collection } =
          expectedCandyMachineState;
        if (Number(loadedCandyMachine.itemsRedeemed) !== itemsRedeemed) {
          throw new Error(
            "Incorrect number of items available in the Candy Machine."
          );
        }
        if (loadedCandyMachine.itemsLoaded !== itemsLoaded) {
          throw new Error(
            "Incorrect number of items loaded in the Candy Machine."
          );
        }
        if (loadedCandyMachine.authority.toString() !== authority.toString()) {
          throw new Error("Incorrect authority in the Candy Machine.");
        }
        if (
          loadedCandyMachine.collectionMint.toString() !== collection.toString()
        ) {
          throw new Error("Incorrect collection in the Candy Machine.");
        }
        step &&
          console.log(
            `${step}. ✅ - Candy Machine has the correct configuration.`
          );
      } catch (error) {
        if (error instanceof Error) {
          step &&
            console.log(
              `${step}. ❌ - Candy Machine incorrect configuration: ${error.message}`
            );
        } else {
          step &&
            console.log(`${step}. ❌ - Error fetching the Candy Machine.`);
        }
        return;
      }
    };

    // Create Collection
    console.log("Creating collection");
    try {
      const result = await createCollectionV1(umi, {
        collection: collectionMint,
        name: "My Collection",
        uri: "https://example.com/my-collection.json",
      }).sendAndConfirm(umi, options);
      console.log(result);
      console.log(
        `2. ✅ - Created collection: ${collectionMint.publicKey.toString()}`
      );
    } catch (error) {
      console.log("2. ❌ - Error creating collection.", error);
      return;
    }

    // Create Candy Machine
    console.log("Creating Candy Machine");
    try {
      const createIx = await create(umi, {
        candyMachine,
        collection: collectionMint.publicKey,
        collectionUpdateAuthority: umi.identity,
        itemsAvailable: 3,
        authority: umi.identity.publicKey,
        isMutable: false,
        configLineSettings: some({
          prefixName: "Quick NFT #",
          nameLength: 11,
          prefixUri: "https://example.com/metadata/",
          uriLength: 29,
          isSequential: false,
        }),
        guards: {
          botTax: some({ lamports: sol(0.0001), lastInstruction: true }),
          solPayment: some({
            lamports: sol(0.001),
            destination: treasury.publicKey,
          }),
          startDate: some({ date: dateTime("2023-04-04T16:00:00Z") }),
          // All other guards are disabled...
        },
      });
      await createIx.sendAndConfirm(umi, options);
      console.log(
        `3. ✅ - Created Candy Machine: ${candyMachine.publicKey.toString()}`
      );
    } catch (error) {
      console.log("3. ❌ - Error creating Candy Machine.", error);
      return;
    }

    // 4. Add items to the Candy Machine
    try {
      await addConfigLines(umi, {
        candyMachine: candyMachine.publicKey,
        index: 0,
        configLines: [
          { name: "1", uri: "1.json" },
          { name: "2", uri: "2.json" },
          { name: "3", uri: "3.json" },
        ],
      }).sendAndConfirm(umi, options);
      console.log(
        `4. ✅ - Added items to the Candy Machine: ${candyMachine.publicKey.toString()}`
      );
    } catch (error) {
      console.log("4. ❌ - Error adding items to the Candy Machine.");
      return;
    }

    const loaded1CandyMachine = await fetchCandyMachine(
      umi,
      candyMachine.publicKey,
      options.confirm
    );
    console.log("Loaded Candy Machine:", loaded1CandyMachine);

    // 5. Verify the Candy Machine configuration
    await checkCandyMachine(
      candyMachine.publicKey,
      {
        itemsLoaded: 3,
        authority: umi.identity.publicKey,
        collection: collectionMint.publicKey,
        itemsRedeemed: 0,
      },
      5
    );

    // 6. Mint NFTs
    try {
      const numMints = 3;
      let minted = 0;
      for (let i = 0; i < numMints; i++) {
        await transactionBuilder()
          .add(setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            mintV1(umi, {
              candyMachine: candyMachine.publicKey,
              asset: generateSigner(umi),
              collection: collectionMint.publicKey,
              mintArgs: {
                solPayment: some({ destination: treasury.publicKey }),
              },
            })
          )
          .sendAndConfirm(umi, options);
        minted++;
      }
      console.log(`6. ✅ - Minted ${minted} NFTs.`);
    } catch (error) {
      console.log("6. ❌ - Error minting NFTs.");
      return;
    }

    // 7. Verify the Candy Machine configuration
    await checkCandyMachine(
      candyMachine.publicKey,
      {
        itemsLoaded: 3,
        authority: umi.identity.publicKey,
        collection: collectionMint.publicKey,
        itemsRedeemed: 3,
      },
      7
    );

    const loadedCandyMachine = await fetchCandyMachine(
      umi,
      candyMachine.publicKey,
      options.confirm
    );
    console.log("Loaded Candy Machine:", loadedCandyMachine);

    // 8. Delete the Candy Machine
    try {
      await deleteCandyMachine(umi, {
        candyMachine: candyMachine.publicKey,
      }).sendAndConfirm(umi, options);
      console.log(
        `8. ✅ - Deleted the Candy Machine: ${candyMachine.publicKey.toString()}`
      );
    } catch (error) {
      console.log("8. ❌ - Error deleting the Candy Machine.");
    }

    // Check the created Candy Machine
    await checkCandyMachine(
      candyMachine.publicKey,
      {
        itemsLoaded: 1,
        itemsRedeemed: 0,
        authority: umi.identity.publicKey,
        collection: collectionMint.publicKey,
      },
      4
    );
  };

  return (
    <CandyMachineContext.Provider
      value={{ umi, setupCandyMachineAndCreateCollection }}
    >
      {children}
    </CandyMachineContext.Provider>
  );
};

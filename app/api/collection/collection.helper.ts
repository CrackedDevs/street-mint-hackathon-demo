import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    mplCandyMachine,
    create,
    addConfigLines,
    fetchCandyMachine,
    mintV1,
    fetchCandyGuard,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
    Umi,
    PublicKey,
    generateSigner,
    transactionBuilder,
    some,
    sol,
    dateTime,
    TransactionBuilderSendAndConfirmOptions,
    createSignerFromKeypair,
    signerIdentity,
    publicKey,
} from "@metaplex-foundation/umi";
import { createCollectionV1 } from "@metaplex-foundation/mpl-core";
import { createMintWithAssociatedToken, setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { decode } from 'bs58';

// Common Umi initialization function
function initializeUmi(endpoint: string, privateKey: string): Umi {
    const umi = createUmi(endpoint)
        .use(mplTokenMetadata())
        .use(mplCandyMachine());

    const keypair = umi.eddsa.createKeypairFromSecretKey(privateKeyToUint8Array(privateKey));
    const signer = createSignerFromKeypair(umi, keypair);
    umi.use(signerIdentity(signer));
    return umi;
}

function privateKeyToUint8Array(privateKeyString: string): Uint8Array {
    return new Uint8Array(decode(privateKeyString));
}

const options: TransactionBuilderSendAndConfirmOptions = {
    send: { skipPreflight: true },
    confirm: { commitment: "processed" },
};

interface ExpectedCandyMachineState {
    itemsLoaded: number;
    itemsRedeemed: number;
    authority: PublicKey;
    collection: PublicKey;
}

async function checkCandyMachine(
    umi: Umi,
    candyMachine: PublicKey,
    expectedCandyMachineState: ExpectedCandyMachineState
): Promise<boolean> {
    try {
        const loadedCandyMachine = await fetchCandyMachine(umi, candyMachine, options.confirm);
        const { itemsLoaded, itemsRedeemed, authority, collection } = expectedCandyMachineState;

        if (Number(loadedCandyMachine.itemsRedeemed) !== itemsRedeemed ||
            loadedCandyMachine.itemsLoaded !== itemsLoaded ||
            loadedCandyMachine.authority.toString() !== authority.toString() ||
            loadedCandyMachine.collectionMint.toString() !== collection.toString()) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error checking Candy Machine:", error);
        return false;
    }
}

// API 1: Setup Candy Machine and Create Collection
export async function setupCandyMachineAndCreateCollection() {
    const umi = initializeUmi(process.env.RPC_URL!, process.env.PRIVATE_KEY!);
    const collectionMint = generateSigner(umi);
    const treasury = generateSigner(umi);
    const candyMachine = generateSigner(umi);
    const candyGuard = generateSigner(umi);

    try {
        // Create Collection
        try {
            await createCollectionV1(umi, {
                collection: collectionMint,
                name: "RJ Collection",
                uri: "https://example.com/my-collection.json",
            }).sendAndConfirm(umi, options);
            console.log(`1. ✅ - Created collection: ${collectionMint.publicKey.toString()}`)
        } catch (error) {
            console.error("Error creating collection:", error);
            throw error; // Re-throw the error to be caught by the outer try-catch
        }

        // Create Candy Machine
        const createIx = await create(umi, {
            candyMachine,
            collection: collectionMint.publicKey,
            collectionUpdateAuthority: umi.identity,
            itemsAvailable: 3,
            authority: umi.identity.publicKey,
            isMutable: false,
            configLineSettings: some({
                prefixName: "new Raghav nft #",
                nameLength: 11,
                prefixUri: "https://example.com/metadata/",
                uriLength: 29,
                isSequential: false,
            }),
            guards: {
                botTax: some({ lamports: sol(0.0001), lastInstruction: true }),
                solPayment: some({ lamports: sol(0.001), destination: treasury.publicKey }),
                startDate: some({ date: dateTime("2023-04-04T16:00:00Z") }),
            },
        })
        await createIx.sendAndConfirm(umi, options);

        // Add items to the Candy Machine
        await addConfigLines(umi, {
            candyMachine: candyMachine.publicKey,
            index: 0,
            configLines: [
                { name: "rj1", uri: "1.json" },
                { name: "rj2", uri: "2.json" },
                { name: "rj3", uri: "3.json" },
            ],
        }).sendAndConfirm(umi, options);

        const isValid = await checkCandyMachine(umi, candyMachine.publicKey, {
            itemsLoaded: 3,
            itemsRedeemed: 0,
            authority: umi.identity.publicKey,
            collection: collectionMint.publicKey,
        });

        if (!isValid) {
            throw new Error("Candy Machine validation failed");
        }

        return {
            candyMachinePublicKey: candyMachine.publicKey.toString(),
            collectionMintPublicKey: collectionMint.publicKey.toString(),
            treasuryPublicKey: treasury.publicKey.toString(),
        };
    } catch (error) {
        console.error("Error in setupCandyMachineAndCreateCollection:", error);
        throw error;
    }
}

// API 2: Mint NFTs
export async function mintNFTs(candyMachinePublicKey: string, collectionMintPublicKey: string) {
    console.log(candyMachinePublicKey, collectionMintPublicKey);

    try {
        const umi = initializeUmi(process.env.RPC_URL!, process.env.PRIVATE_KEY!);
        const candyMachine = await fetchCandyMachine(umi, publicKey(candyMachinePublicKey), options.confirm)
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority)
        const asset = generateSigner(umi);
        const nftOwner = publicKey("59W3uJ5bDsDrUEinDF9aWNX3roEnYEX7yj34sweD7XDM")
        const tx = await transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(createMintWithAssociatedToken(umi, { owner: nftOwner, mint: asset }))
            .add(
                mintV1(umi, {
                    candyMachine: candyMachine.publicKey,
                    asset: asset,
                    collection: candyMachine.collectionMint,
                    owner: nftOwner,
                    candyGuard: candyGuard.publicKey,
                })
            )
            .sendAndConfirm(umi)
        console.log(`✅ - Minted NFTs.`, tx);
        return tx;
    } catch (error) {
        console.error("Error minting NFTs:", error);
        throw error;
    }
}
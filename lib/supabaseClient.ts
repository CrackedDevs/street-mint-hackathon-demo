import { AuthError, createClient, User } from '@supabase/supabase-js';
import { Database } from './types/database.types';
import { isSignatureValid } from './nfcVerificationHellper';
import { GalleryItem } from '@/app/gallery/galleryGrid';
export const dynamic = 'force-dynamic';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type Collection = {
    id: number;
    name: string;
    description: string;
    artist: number;
    collectibles: Collectible[];
    metadata_uri?: string;
    collection_mint_public_key?: string;
    merkle_tree_public_key?: string;
};

export enum QuantityType {
    Unlimited = "unlimited",
    Single = "single",
    Limited = "limited",
}


export type Collectible = {
    id: number;
    name: string;
    description: string;
    primary_image_url: string;
    quantity_type: QuantityType;
    quantity: number | null;
    price_usd: number;
    location: string | null;
    location_note: string | null;
    gallery_urls: string[];
    metadata_uri: string | null;
    nfc_public_key: string | null;
    mint_start_date: string | null;
    mint_end_date: string | null;
};

interface Order {
    id: string;
    wallet_address: string;
    collectible_id: number;
    collection_id: number;
    status: string;
    price_usd: number;
    nft_type: string;
    max_supply: number;
    mint_signature: string;
    transaction_signature: string;
    device_id: string;
    // Add other fields as necessary
}


export type PopulatedCollection = {
    id: number;
    name: string;
    description: string;
    collectible_image_urls: string[];
}

export type Artist = {
    id: number;
    username: string;
    bio: string;
    email: string;
    avatar_url: string;
    x_username?: string | null;
    instagram_username?: string | null;
    linkedin_username?: string | null;
    farcaster_username?: string | null;
    wallet_address: string;
};

type CreateCollectionMintResponse = {
    success: boolean;
    result: {
        merkleTreePublicKey: string;
        collectionMintPublicKey: string;
    };
};

export type ArtistWithoutWallet = Omit<Artist, 'wallet_address'>;

export const createFetch =
    (options: Pick<RequestInit, "next" | "cache">) =>
        (url: RequestInfo | URL, init?: RequestInit) => {
            return fetch(url, {
                ...init,
                ...options,
            });
        };

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
        fetch: createFetch({
            cache: 'no-store',
        }),
    },
},);

const getAuthenticatedUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError);
        return { user: null, error: userError };
    }

    if (!user || !user.user_metadata) {
        return { user: null, error: null };
    }

    return { user, error: null };
};

export const createCollection = async (collection: Omit<Collection, 'collectibles'>): Promise<Collection | null> => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return null;
    }

    // Create metadata for the collection
    const collectionMetadata = {
        name: collection.name,
        description: collection.description,
        external_url: process.env.NEXT_PUBLIC_SITE_URL || "https://street-mint-client.vercel.app/",
        properties: {
            category: "image"
        }
    };

    // Upload collection metadata to Supabase storage
    const collectionMetadataFileName = `${Date.now()}-collection-metadata.json`;
    const { error: metadataUploadError } = await supabase.storage
        .from("nft-images")
        .upload(collectionMetadataFileName, JSON.stringify(collectionMetadata));

    if (metadataUploadError) {
        console.error('Error uploading collection metadata:', metadataUploadError);
        return null;
    }

    // Get the public URL for the uploaded metadata
    const { data: metadataUrlData } = supabase.storage
        .from("nft-images")
        .getPublicUrl(collectionMetadataFileName);

    const collectionMetadataUri = metadataUrlData.publicUrl;

    // Call the createBubbleGumTree API to create the collection on-chain
    const response = await fetch('/api/collection/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            collectionData: {
                ...collection,
                metadata_uri: collectionMetadataUri
            }
        }),
    });

    if (!response.ok) {
        console.error('Error creating on-chain collection');
        return null;
    }

    const onChainCollectionData: CreateCollectionMintResponse = await response.json();

    if (!onChainCollectionData.result) {
        console.error('Error creating on-chain collection: No result returned');
        return null;
    }

    // Add the on-chain data to the collection object
    const collectionToInsert = {
        ...collection,
        metadata_uri: collectionMetadataUri,
        merkle_tree_public_key: onChainCollectionData.result.merkleTreePublicKey,
        collection_mint_public_key: onChainCollectionData.result.collectionMintPublicKey
    };

    const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .insert({
            artist: collectionToInsert.artist,
            description: collectionToInsert.description,
            id: collectionToInsert.id,
            name: collectionToInsert.name,
            metadata_uri: collectionToInsert.metadata_uri,
            merkle_tree_public_key: collectionToInsert.merkle_tree_public_key,
            collection_mint_public_key: collectionToInsert.collection_mint_public_key
        })
        .select();

    if (collectionError) {
        console.error('Error creating collection:', collectionError);
        return null;
    }

    if (collectionData[0]) {
        return collectionData[0] as Collection;
    }
    return null;
};

export const createCollectible = async (collectible: Omit<Collectible, 'id'>, collectionId: number): Promise<Collectible | null> => {
    const nftMetadata = {
        name: collectible.name,
        description: collectible.description,
        image: collectible.primary_image_url,
        external_url: "https://street-mint-client.vercel.app/",
        properties: {
            files: [
                {
                    uri: collectible.primary_image_url,
                    type: "image/jpg"
                },
                ...collectible.gallery_urls.map(url => ({
                    uri: url,
                    type: "image/jpg"
                }))
            ],
            category: "image"
        }
    };

    const nftMetadataFileName = `${Date.now()}-${collectible.name}-metadata.json`;
    const { error: nftMetadataUploadError } = await supabase.storage
        .from("nft-images")
        .upload(nftMetadataFileName, JSON.stringify(nftMetadata));

    if (nftMetadataUploadError) {
        console.error('Error uploading NFT metadata:', nftMetadataUploadError);
        return null;
    }

    const { data: nftMetadataUrlData } = supabase.storage
        .from("nft-images")
        .getPublicUrl(nftMetadataFileName);

    const collectibleToInsert = {
        ...collectible,
        collection_id: collectionId,
        metadata_uri: nftMetadataUrlData.publicUrl
    };

    const { data: insertedCollectible, error: nftError } = await supabase
        .from('collectibles')
        .insert(collectibleToInsert)
        .select();

    if (nftError) {
        console.error('Error creating collectible:', nftError);
        return null;
    }

    if (insertedCollectible && insertedCollectible[0]) {
        return insertedCollectible[0] as Collectible;
    }
    return null;
};


export async function deleteCollectionAndNFTs(collectionId: number): Promise<{ success: boolean; error: string | null }> {
    try {
        // 1. Fetch the collection to get metadata_uri
        const { data: collection, error: collectionError } = await supabase
            .from('collections')
            .select('metadata_uri, merkle_tree_public_key, collection_mint_public_key')
            .eq('id', collectionId)
            .single();

        if (collectionError) throw collectionError;

        // 2. Fetch all collectibles associated with the collection
        const { data: collectibles, error: collectiblesError } = await supabase
            .from('collectibles')
            .select('id, metadata_uri, primary_image_url, gallery_urls')
            .eq('collection_id', collectionId);

        if (collectiblesError) throw collectiblesError;

        // 3. Delete all collectibles
        const { error: deleteCollectiblesError } = await supabase
            .from('collectibles')
            .delete()
            .eq('collection_id', collectionId);

        if (deleteCollectiblesError) throw deleteCollectiblesError;

        // 4. Delete the collection
        const { error: deleteCollectionError } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId);

        if (deleteCollectionError) throw deleteCollectionError;

        // 5. Delete metadata and image files from storage
        const filesToDelete = [
            collection.metadata_uri,
            ...collectibles.flatMap(c => [c.metadata_uri, c.primary_image_url, ...(c.gallery_urls || [])])
        ].filter((url): url is string => Boolean(url)).map(url => url.split('/').pop());

        if (filesToDelete.length > 0) {

            const { error: storageError } = await supabase
                .storage
                .from('nft-images')
                .remove(filesToDelete.filter((file): file is string => file !== undefined));
            if (storageError) {
                console.warn('Error deleting some files from storage:', storageError);
                // We'll log the error but not throw it to allow the process to continue
            }
        }

        console.log('Collection and NFTs deleted successfully');
        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting collection and NFTs:', error);
        return { success: false, error: (error as Error).message };
    }
}

export const uploadImage = async (file: File) => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return null;
    }
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("nft-images").upload(fileName, file);
    if (error) {
        console.error("Error uploading image:", error);
        return null;
    }
    const { data: publicUrlData } = supabase.storage.from("nft-images").getPublicUrl(fileName);
    return publicUrlData.publicUrl;
};



export const getArtistById = async (id: number): Promise<Artist | null> => {
    const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching artist:", error);
        return null;
    }

    return data;
};


export const fetchProfileData = async () => {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user || authError) {
        return { exists: false, data: null, error: authError || null };
    }

    const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("wallet_address", user.user_metadata.wallet_address)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return { exists: false, data: null, error };
    }
    return { exists: true, data: data, error: null };
};

export const checkUsernameAvailability = async (username: string) => {
    const { data, error } = await supabase
        .from("artists")
        .select("username")
        .eq("username", username)
        .single();
    if (error) {
        if (error.code === 'PGRST116') {
            // PGRST116 means no rows returned, which means the username is available
            return { available: true, error: null };
        }
        console.error("Error checking username:", error);
        return { available: false, error };
    }

    // If data is not null, it means the username already exists
    return { available: !data, error: null };
};

export const fetchCollectibleById = async (id: number) => {
    const { data, error } = await supabase
        .from("collectibles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching collectible:", error);
        return null;
    }

    return data;
};

export const updateCollectible = async (collectible: Collectible): Promise<boolean> => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return false;
    }
    const { error } = await supabase
        .from('collectibles')
        .update(collectible)
        .eq('id', collectible.id);

    if (error) {
        console.error("Error updating collectible:", error);
        return false;
    }

    return true;
};

export const updateProfile = async (profileData: Artist) => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return { exists: false, data: null, error: authError || null };
    }
    const { data, error, } = await supabase
        .from("artists")
        .update(profileData)
        .eq("wallet_address", user.user_metadata.wallet_address);

    return { data, error };
};

export const createProfile = async (profileData: Artist) => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return { exists: false, data: null, error: authError || null };
    }
    const { data, error } = await supabase.from("artists").insert({ ...profileData, collections: [] });
    return { data, error };
};

export const getCollectionsByArtistId = async (artistId: number): Promise<PopulatedCollection[]> => {
    let query = supabase.from("collections").select("*");

    if (artistId) {
        query = query.eq("artist", artistId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const transformedData = await Promise.all(data.map(async (collection) => {
        const collectibles = await fetchCollectiblesByCollectionId(collection.id);
        return {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            collectible_image_urls: collectibles?.map(collectible => collectible.primary_image_url) || []
        };
    }));

    return transformedData;
};


export const getAllCollections = async (): Promise<PopulatedCollection[]> => {
    const { data, error } = await supabase.from("collections").select("*");

    if (error) throw error;

    const transformedData = await Promise.all(data.map(async (collection) => {
        const collectibles = await fetchCollectiblesByCollectionId(collection.id);
        return {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            collectible_image_urls: collectibles?.map(collectible => collectible.primary_image_url) || []
        };
    }));

    return transformedData;
};

export const getCollectionById = async (id: number) => {
    const { data, error } = await supabase.from("collections").select("*").eq("id", id).single();

    if (error) {
        console.error("Error fetching collection:", error);
        return null;
    }
    return data;
};

export const fetchCollectiblesByCollectionId = async (collectionId: number) => {
    const { data, error } = await supabase.from("collectibles").select("*").eq("collection_id", collectionId);
    if (error) {
        console.error("Error fetching collectibles:", error);
        return null;
    }
    return data;
};

export async function checkMintEligibility(walletAddress: string, collectibleId: number, deviceId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
        // Check if the NFT is still available and get its details
        const { data: collectible, error: collectibleError } = await supabase
            .from('collectibles')
            .select('quantity, quantity_type, mint_start_date, mint_end_date')
            .eq('id', collectibleId)
            .single();

        if (collectibleError) throw collectibleError;

        // Check if the minting period has started

        // Get the count of existing orders for this collectible
        const { count, error: countError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('collectible_id', collectibleId);

        if (countError) throw countError;

        // Check availability based on NFT type
        if (collectible.quantity_type === 'single') {
            if (count && count > 0) {
                return { eligible: false, reason: 'This 1 of 1 collectible has already been minted.' };
            }
        } else if (collectible.quantity_type === 'limited') {
            if (collectible.quantity && count && count >= collectible.quantity) {
                return { eligible: false, reason: 'All editions of this limited NFT have been minted.' };
            }
        }

        // Check if the wallet has already minted this NFT
        const { data: existingOrder, error: orderError } = await supabase
            .from('orders')
            .select('id')
            .eq('wallet_address', walletAddress)
            .eq('collectible_id', collectibleId)
            .eq('status', 'completed')
            .single();

        if (orderError && orderError.code !== 'PGRST116') throw orderError; // PGRST116 means no rows returned

        if (existingOrder) {
            return { eligible: false, reason: 'You have already minted this NFT.' };
        }

        // Check if the device has been used to mint this NFT before
        const { data: existingDeviceMint, error: deviceError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('device_id', deviceId)
            .eq('collectible_id', collectibleId)
            .eq('status', 'completed')
            .single();

        if (deviceError && deviceError.code !== 'PGRST116') throw deviceError;
        if (existingDeviceMint) {
            return { eligible: false, reason: 'This device has already been used to mint this NFT.' };
        }

        //CHECK FOR MINT START AND END DATE
        const now = new Date();
        if (collectible.mint_start_date && now < new Date(collectible.mint_start_date)) {
            return { eligible: false, reason: 'Minting not started yet.' };
        }

        // Check if the minting period has ended
        if (collectible.mint_end_date && now > new Date(collectible.mint_end_date)) {
            return { eligible: false, reason: 'Minting period has ended.' };
        }

        // If all checks pass, the user is eligible to mint
        return { eligible: true };
    } catch (error) {
        console.error('Error checking mint eligibility:', error);
        throw error;
    }
}

export async function getExistingOrder(walletAddress: string, collectibleId: number) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('wallet_address', walletAddress)
            .eq('collectible_id', collectibleId)
            .eq('status', 'completed')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No order found
                return null;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error fetching existing order:", error);
        throw error;
    }
}

export async function verifyNfcSignature(rnd: string, sign: string, pubKey: string): Promise<boolean> {
    if (!rnd || !sign || !pubKey) {
        return false;
    }
    const isValid = await isSignatureValid(rnd, sign, pubKey);
    if (!isValid) {
        console.log("NFC signature is not valid");
        return false;
    }

    const { data, error } = await supabase
        .from('nfc_taps')
        .select('id')
        .eq('random_number', rnd)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error checking NFC tap:', error);
        return false
    }
    if (data) {
        console.log("NFC tap already recorded");
        return false;
    }

    const { error: insertError } = await supabase
        .from('nfc_taps')
        .insert({ random_number: rnd });

    if (insertError) {
        console.error('Error recording NFC tap:', insertError);
        return false
    }
    return true;
}

export async function getCompletedOrdersCount(collectibleId: number): Promise<number> {
    const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('collectible_id', collectibleId)
        .eq('status', 'completed');

    if (error) {
        console.error('Error fetching completed orders count:', error);
        return 0;
    }

    return count || 0;
}

export async function getGalleryInformationByTokenAddresses(tokenAddresses: string[]) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            mint_address,
            created_at,
            collectibles(name, primary_image_url, quantity_type, location),
            collections(name)
        `)
        .in('mint_address', tokenAddresses)
        .eq('status', 'completed');

    if (error) {
        console.error('Error fetching gallery information:', error);
        return [];
    }

    // Format the returned data to include only the relevant fields
    const formattedData: GalleryItem[] = data.map((order: any) => ({
        imageUrl: order.collectibles.primary_image_url,
        collectibleName: order.collectibles.name,
        collectionName: order.collections.name,
        quantityType: order.collectibles.quantity_type,
        mintAddress: order.mint_address,
        locationMinted: order.collectibles.location,
        orderDate: order.created_at
    }));

    return formattedData;
}
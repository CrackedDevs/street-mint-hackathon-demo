import { AuthError, createClient, User } from '@supabase/supabase-js';
import { Database } from './types/database.types';

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
    quantity?: number | null;
    price_usd: number;
    location?: string;
    gallery_urls: string[];
    metadata_uri?: string;
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
    // Add other fields as necessary
}

interface CreateOrderResponse {
    success: boolean;
    order: Order;
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

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);

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

export const createCollection = async (collection: Collection): Promise<Collection | null> => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return null;
    }

    // Create metadata for the collection
    const collectionMetadata = {
        name: collection.name,
        description: collection.description,
        image: collection.collectibles[0].primary_image_url, // Assuming collection has an image_url property
        external_url: process.env.NEXT_PUBLIC_SITE_URL || "https://street-mint-client.vercel.app/",
        properties: {
            files: collection.collectibles.map(collectible => ({
                uri: collectible.primary_image_url,
                type: "image/jpg" // Assuming all images are JPGs
            })),
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

    // Create and upload metadata for each NFT
    const collectiblesWithMetadata = await Promise.all(collection.collectibles.map(async (collectible) => {
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

        const nftMetadataFileName = `${Date.now()}-${collectible.id}-metadata.json`;
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

        return {
            ...collectible,
            collection_id: collectionData[0].id,
            metadata_uri: nftMetadataUrlData.publicUrl
        };
    }));

    // Filter out any null values from collectiblesWithMetadata
    const validCollectibles = collectiblesWithMetadata.filter(c => c !== null);
    console.log("validCollectibles", validCollectibles);


    const { error: nftsError } = await supabase
        .from('collectibles')
        .insert(validCollectibles);

    if (nftsError) {
        console.error('Error creating collectibles:', nftsError);
        return null;
    }

    if (collectionData[0]) {
        return {
            ...collectionData[0],
            collectibles: validCollectibles
        } as Collection;
    }
    return null;
};

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

export const createCollectible = async (collectible: Omit<Collectible, 'id'>, collection_id: number): Promise<{ data: Collectible | null; error: any }> => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return { data: null, error: authError || null };
    }

    const id = Math.floor(Math.random() * 1000000);
    const { data, error } = await supabase
        .from("collectibles")
        .insert({
            id,
            ...collectible,
            collection_id
        })
        .select()
        .single();

    console.log("data", data)

    if (error) {
        console.error("Error creating collectible:", error);
        return { data: null, error };
    }

    return { data: data as Collectible, error: null };
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


export const updateProfile = async (profileData: Artist, wallet_address: string) => {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user || authError) {
        return { exists: false, data: null, error: authError || null };
    }

    const { data, error } = await supabase
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

export type PopulatedCollection = {
    id: number;
    name: string;
    description: string;
    collectible_image_urls: string[];
}

export const getCollectionsByArtistId = async (artistId: number): Promise<PopulatedCollection[]> => {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("artist", artistId);

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

export async function createOrder(walletAddress: string, collectibleId: number, deviceId: string, signature: string): Promise<Order> {
    try {
        const { data, error } = await supabase
            .rpc('create_order_and_record_attempt', {
                p_wallet_address: walletAddress,
                p_collectible_id: collectibleId,
                p_device_id: deviceId,
                p_transaction_signature: signature
            });

        if (error) {
            throw error;
        }

        console.log(data);
        // Assert the type of data
        const response = data as any;

        if (!response.success) {
            throw new Error('Failed to create order');
        }

        return response.order;
    } catch (error) {
        console.error("Error in createOrder:", error);
        throw error;
    }
}

export async function checkMintEligibility(walletAddress: string, collectibleId: number, deviceId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
        // Check if the NFT is still available and get its details
        const { data: collectible, error: collectibleError } = await supabase
            .from('collectibles')
            .select('quantity, quantity_type')
            .eq('id', collectibleId)
            .single();

        if (collectibleError) throw collectibleError;

        // Get the count of existing orders for this collectible
        const { count, error: countError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('collectible_id', collectibleId);

        if (countError) throw countError;

        // Check availability based on NFT type
        if (collectible.quantity_type === 'single') {
            if (count && count > 0) {
                return { eligible: false, reason: 'This single edition NFT has already been minted.' };
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
            .single();

        if (orderError && orderError.code !== 'PGRST116') throw orderError; // PGRST116 means no rows returned
        if (existingOrder) {
            return { eligible: false, reason: 'You have already minted this NFT.' };
        }

        // Check if the device has been used to mint this NFT before
        const { data: existingDeviceMint, error: deviceError } = await supabase
            .from('orders')
            .select('id')
            .eq('device_id', deviceId)
            .eq('collectible_id', collectibleId)
            .single();

        if (deviceError && deviceError.code !== 'PGRST116') throw deviceError;
        if (existingDeviceMint) {
            return { eligible: false, reason: 'This device has already been used to mint this NFT.' };
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
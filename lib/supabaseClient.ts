
import { AuthError, createClient, User } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type Collection = {
    id: number;
    name: string;
    description: string;
    artist: number;
    nfts: NFT[];
};

export enum QuantityType {
    Unlimited = "unlimited",
    Single = "single",
    Limited = "limited",
}


export type NFT = {
    id: number;
    name: string;
    description: string;
    primary_image_url: string;
    quantity_type: QuantityType;
    quantity?: number;
    price_usd: number;
    location?: string;
    gallery_urls: string[];
};

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

    const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .insert({
            id: collection.id,
            artist: collection.artist,
            name: collection.name,
            description: collection.description,
            nfts: collection.nfts.map(nft => nft.id)
        })
        .select();

    if (collectionError) {
        console.error('Error creating collection:', collectionError);
        return null;
    }

    // Insert the NFTs
    const nftsWithCollectionId = collection.nfts.map(nft => ({
        ...nft,
        collection_id: collectionData[0].id
    }));

    const { data: nftsData, error: nftsError } = await supabase
        .from('nfts')
        .insert(nftsWithCollectionId);

    if (nftsError) {
        console.error('Error creating NFTs:', nftsError);
        return null;
    }

    if (collectionData[0]) {
        return {
            ...collectionData[0],
            nfts: collection.nfts
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

export const fetchNFTById = async (id: number) => {
    const { data, error } = await supabase
        .from("nfts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching NFT:", error);
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

export const getCollectionsByArtistId = async (artistId: number) => {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("artist", artistId);

    if (error) throw error;
    return data;
};

export const getCollectionById = async (id: number) => {
    const { data, error } = await supabase.from("collections").select("*").eq("id", id).single();

    if (error) {
        console.error("Error fetching collection:", error);
        return null;
    }
    return data;
};

export const fetchNFTsByCollectionId = async (collectionId: number) => {
    const { data, error } = await supabase.from("nfts").select("*").eq("collection_id", collectionId);
    if (error) {
        console.error("Error fetching nfts:", error);
        return null;
    }
    return data;
};
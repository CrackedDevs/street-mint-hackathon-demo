import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';
import { NumericUUID } from './utils';

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

export const createCollection = async (collection: Collection): Promise<Collection | null> => {
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


export const fetchProfileData = async (walletAddress: string) => {
    const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return { exists: false, data: null, error };
    }


    return { exists: true, data: data, error: null };

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
    const { data, error } = await supabase
        .from("artists")
        .update(profileData)
        .eq("wallet_address", wallet_address);
    return { data, error };
};

export const createProfile = async (profileData: Artist) => {
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
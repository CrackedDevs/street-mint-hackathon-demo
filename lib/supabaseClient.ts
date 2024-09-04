import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type Collection = {
    id?: number;
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
};

export type Artist = {
    username: string;
    bio: string;
    email: string;
    avatar_url: string;
    x_username: string;
    instagram_username: string;
    wallet_address: string;
};

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);

export const createCollection = async (collection: Collection): Promise<Collection | null> => {
    const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .insert({
            artist: collection.artist,
            name: collection.name,
            description: collection.description
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
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

export type NFT = {
    id?: number;
    name: string;
    description: string;
    primary_image_url: string;
    quantity_type: "unlimited" | "single" | "limited";
    quantity?: number;
    price_usd: number;
    location?: string;
};

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);

export const createCollection = async (collection: Collection): Promise<Collection | null> => {
    // Insert the collection
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
    console.log("Image data", data);

    if (error) {
        return null;
    }

    const { data: publicUrlData } = supabase.storage.from("nft-images").getPublicUrl(fileName);
    console.log(publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
};
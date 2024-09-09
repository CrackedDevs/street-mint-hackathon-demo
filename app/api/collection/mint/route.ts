import { NextResponse } from 'next/server';
import { mintNFTs } from '../collection.helper';
import { PublicKey } from '@metaplex-foundation/umi';

export async function POST(request: Request) {
    try {
        const { candyMachinePublicKey, collectionMintPublicKey } = await request.json();

        if (!candyMachinePublicKey || !collectionMintPublicKey) {
            return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
        }

        const result = await mintNFTs(
            candyMachinePublicKey,
            collectionMintPublicKey
        );

        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (error) {
        // console.error('Error minting NFT:', error);
        return NextResponse.json({ success: false, error: 'Failed to mint NFT' }, { status: 500 });
    }
}

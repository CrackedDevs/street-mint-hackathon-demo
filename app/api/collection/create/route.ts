import { NextResponse } from 'next/server';
import { createBubbleGumTree, } from '../collection.helper';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { collectionData } = body;
        const result = await createBubbleGumTree(collectionData);
        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (error) {
        // console.error('Error creating collection:', error);
        return NextResponse.json({ success: false, error: 'Failed to create collection' }, { status: 500 });
    }
}


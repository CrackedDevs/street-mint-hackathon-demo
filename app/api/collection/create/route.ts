import { NextResponse } from 'next/server';
import { createBubbleGumTree, setupCandyMachineAndCreateCollection } from '../collection.helper';

export async function POST(request: Request) {
    try {
        // Note: In a real-world scenario, you'd need to handle wallet authentication
        // and pass a proper wallet instance. For this example, we'll use a mock wallet.
        // const result = await setupCandyMachineAndCreateCollection();
        const result = await createBubbleGumTree();

        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (error) {
        // console.error('Error creating collection:', error);
        return NextResponse.json({ success: false, error: 'Failed to create collection' }, { status: 500 });
    }
}


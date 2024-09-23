"use server"

export async function updateNfcPublicKey(collectibleId: string, newNFCPublicKey: string) {
    const apiSecret = process.env.API_SECRET;

    const response = await fetch(`${process.env.API_BASE_URL}/api/collectible/update-nfc-public-key`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiSecret}`,
        },
        body: JSON.stringify({ collectibleId, nfcPublicKey: newNFCPublicKey }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update NFC public key');
    }

    return response.json();
}
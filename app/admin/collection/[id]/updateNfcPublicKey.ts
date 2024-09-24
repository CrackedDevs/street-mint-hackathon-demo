"use server"

export async function updateNfcPublicKey(collectibleId: string, newNFCPublicKey: string) {
    const response = await fetch(`${process.env.API_BASE_URL}/api/collectible/update-nfc-public-key`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ collectibleId, nfcPublicKey: newNFCPublicKey, artistPassword: process.env.APP_ADMIN_PASSWORD }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update NFC public key');
    }

    return response.json();
}
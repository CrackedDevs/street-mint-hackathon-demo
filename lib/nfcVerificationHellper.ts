
async function verifySignature(randomNumber: string, signatureHex: string, publicKeyHex: string) {
    const elliptic = await import('elliptic');
    const EC = elliptic.ec;
    const ec = new EC('p256');

    try {
        // SHA-256 hash the random number
        const msgBuffer = new TextEncoder().encode(randomNumber);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const messageHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Convert the public key from hex to a key object
        const publicKey = ec.keyFromPublic('04' + publicKeyHex, 'hex');

        // Parse the signature
        const signatureBuffer = Buffer.from(signatureHex, 'hex');
        const signature = {
            r: signatureBuffer.slice(0, 32),
            s: signatureBuffer.slice(32, 64)
        };
        // Verify the signature
        const valid = publicKey.verify(messageHex, signature);
        return valid;
    } catch (error) {
        console.error('Verification failed:', error);
        return false;
    }
}
// Example usage:
export async function isSignatureValid(rnd: string, sign: string, pubKey: string): Promise<boolean> {
    return await verifySignature(rnd, sign, pubKey);
}
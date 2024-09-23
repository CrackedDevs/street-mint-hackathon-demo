export class StringService {
    static formatNfcPublicKey(nfcPublicKey: string): string {
        return nfcPublicKey.length < 8 ? nfcPublicKey : nfcPublicKey.slice(0, 4) + "..." + nfcPublicKey.slice(-4);
    }
}
export class SolanaExplorerService {
    private static readonly BASE_URL = 'https://explorer.solana.com';
    private static readonly CLUSTER = process.env.NODE_ENV === 'development' ? 'devnet' : 'mainnet';

    private static getUrl(type: 'tx' | 'address', id: string): string {
        const clusterParam = this.CLUSTER === 'devnet' ? '?cluster=devnet' : '';
        return `${this.BASE_URL}/${type}/${id}${clusterParam}`;
    }

    static getTransaction(transactionSignature: string): string {
        return this.getUrl('tx', transactionSignature);
    }

    static getAddress(address: string): string {
        return this.getUrl('address', address);
    }
}

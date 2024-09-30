"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  BaseMessageSignerWalletAdapter,
  WalletAdapterNetwork,
  WalletReadyState,
  WalletName,
  WalletNotConnectedError,
  TransactionOrVersionedTransaction,
  WalletError,
} from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  clusterApiUrl,
  PublicKey,
  Transaction,
  TransactionVersion,
} from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { Web3Auth } from "@web3auth/modal";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  SolanaPrivateKeyProvider,
  SolanaWallet,
} from "@web3auth/solana-provider";
import { CHAIN_NAMESPACES, CustomChainConfig } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";

class Web3AuthWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = "Social Login" as WalletName<"Web3Auth">;
  url = "https://web3auth.io";
  icon =
    "https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA";
  private _connecting: boolean;
  private _wallet: SolanaWallet | null;
  private _publicKey: PublicKey | null;
  private _ready: boolean;

  constructor(private web3auth: Web3Auth) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;
    this._ready = false;
    this.initializeWeb3Auth();
  }

  private async initializeWeb3Auth() {
    try {
      await this.web3auth.initModal();
      this._ready = true;
      this.emit("readyStateChange", this.readyState);
    } catch (error) {
      console.error("Failed to initialize Web3Auth:", error);
      this.emit(
        "error",
        new WalletError("Failed to initialize Web3Auth", error as Error)
      );
    }
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (!this._ready) {
        throw new WalletError(
          "Wallet is not ready yet, Login modal is not initialized"
        );
      }
      this._connecting = true;

      const web3authProvider = await this.web3auth.connect();
      this._wallet = new SolanaWallet(web3authProvider!);
      const accounts = await this._wallet.requestAccounts();
      this._publicKey = new PublicKey(accounts[0]);

      this.emit("connect", this._publicKey);
    } catch (error: any) {
      this.emit("error", new WalletError(error?.message, error));
      throw error;
    } finally {
      this._connecting = false;
    }
  }
  get readyState(): WalletReadyState {
    return WalletReadyState.Installed; // or another appropriate state
  }
  get supportedTransactionVersions(): ReadonlySet<TransactionVersion> {
    return new Set(); // Return an empty ReadonlySet
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      this._wallet = null;
      this._publicKey = null;

      try {
        await this.web3auth.logout();
        this.emit("disconnect");
      } catch (error: any) {
        this.emit("error", new WalletError(error?.message, error));
      }
    }
  }

  async signTransaction<T extends TransactionOrVersionedTransaction<any>>(
    transaction: T
  ): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      if (transaction instanceof Transaction) {
        return (await wallet.signTransaction(transaction)) as T;
      } else if (transaction) {
        // Implement VersionedTransaction signing if supported by Web3Auth
        throw new Error("VersionedTransaction signing not implemented");
      } else {
        throw new Error("Invalid transaction type");
      }
    } catch (error: any) {
      this.emit("error", new WalletError(error?.message, error));
      throw error;
    }
  }

  async signAllTransactions<T extends TransactionOrVersionedTransaction<any>>(
    transactions: T[]
  ): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      if (transactions[0] instanceof Transaction) {
        return (await wallet.signAllTransactions(
          transactions as Transaction[]
        )) as T[];
      } else if (transactions[0]) {
        // Implement VersionedTransaction signing if supported by Web3Auth
        throw new Error("VersionedTransaction signing not implemented");
      } else {
        throw new Error("Invalid transaction type");
      }
    } catch (error: any) {
      this.emit("error", new WalletError(error?.message, error));
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();
      const signedMessage = await wallet.signMessage(message);
      return signedMessage;
    } catch (error: any) {
      this.emit("error", new WalletError(error?.message, error));
      throw error;
    }
  }
}
const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: {
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.SOLANA,
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID!,
      rpcTarget: process.env.NEXT_PUBLIC_RPC_URL!,
    },
  },
});

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network =
    process.env.NODE_ENV === "development"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      const web3authInstance = new Web3Auth({
        clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.SOLANA,
          chainId: process.env.NEXT_PUBLIC_CHAIN_ID!, // Solana mainnet
          rpcTarget: process.env.NEXT_PUBLIC_RPC_URL!,
        } as CustomChainConfig,
        uiConfig: {
          loginMethodsOrder: ["google"],
        },
        privateKeyProvider,
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          network: "sapphire_devnet",
          uxMode: "popup",
        },
      });
      web3authInstance.configureAdapter(openloginAdapter);

      setWeb3auth(web3authInstance);
    };

    initWeb3Auth();
  }, []);

  // Custom Web3Auth wallet adapter

  const wallets = useMemo(() => {
    return [
      new TipLinkWalletAdapter({
        title: "Streetmint",
        clientId: "694bf97c-d2ac-4dfc-a786-a001812658df",
        theme: "dark", // pick between "dark"/"light"/"system"
      }),
      new PhantomWalletAdapter(),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

"use client";

import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from "@solana-mobile/wallet-standard-mobile";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { useStandardWalletAdapters } from "@solana/wallet-standard-wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useMemo, type ReactNode } from "react";
import { MapleWalletModalProvider } from "./maple-wallet-modal-provider";

import "@solana/wallet-adapter-react-ui/styles.css";

const NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
    ? WalletAdapterNetwork.Devnet
    : WalletAdapterNetwork.Mainnet;

/** React Strict Mode (dev) runs effects twice; avoid double registerWallet / duplicate MWA. */
let mwaWalletStandardRegistered = false;

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => {
    const custom = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (custom) return custom;
    return clusterApiUrl(NETWORK);
  }, []);

  // Phantom (and other extensions) register via Wallet Standard. A legacy
  // PhantomWalletAdapter + Standard adapter can race the extension and throw
  // inside inpage.js (emit / addListener on undefined).
  const wallets = useStandardWalletAdapters([]);

  useEffect(() => {
    if (mwaWalletStandardRegistered) return;
    mwaWalletStandardRegistered = true;
    registerMwa({
      appIdentity: {
        name: "Maple",
        uri: window.location.origin,
        icon: "/icon-192.png",
      },
      authorizationCache: createDefaultAuthorizationCache(),
      chains: ["solana:devnet", "solana:mainnet"],
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    });
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <MapleWalletModalProvider>{children}</MapleWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

import type { WalletName } from "@solana/wallet-adapter-base";
import { SolanaMobileWalletAdapterWalletName } from "@solana-mobile/wallet-standard-mobile";

export const MWA_WALLET_ADAPTER_NAME =
  SolanaMobileWalletAdapterWalletName as WalletName;
export const MWA_DISPLAY_NAME = "Use Installed Wallet";

export function walletAdapterDisplayName(adapterName: string): string {
  return adapterName === MWA_WALLET_ADAPTER_NAME
    ? MWA_DISPLAY_NAME
    : adapterName;
}

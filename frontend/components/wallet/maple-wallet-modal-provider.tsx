"use client";

import { WalletModalContext } from "@solana/wallet-adapter-react-ui";
import { useState, type ReactNode } from "react";
import { MapleWalletModal } from "./maple-wallet-modal";

export function MapleWalletModalProvider({
  children,
  className,
  container,
}: {
  children: ReactNode;
  className?: string;
  container?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <WalletModalContext.Provider value={{ visible, setVisible }}>
      {children}
      {visible && (
        <MapleWalletModal className={className} container={container} />
      )}
    </WalletModalContext.Provider>
  );
}

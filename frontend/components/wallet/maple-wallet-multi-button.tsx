"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { WalletIcon } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";
import { MWA_WALLET_ADAPTER_NAME } from "@/lib/solana/mwa-display";

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting …",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Select Wallet",
} as const;

function MapleWalletConnectionButton({
  walletIcon,
  walletName,
  className,
  style,
  children,
  disabled,
  tabIndex,
  "aria-expanded": ariaExpanded,
  onClick,
}: {
  walletIcon?: string;
  walletName?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  disabled?: boolean;
  tabIndex?: number;
  "aria-expanded"?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-expanded={ariaExpanded}
      className={cn(
        "wallet-adapter-button wallet-adapter-button-trigger",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      style={style}
      tabIndex={tabIndex}
      type="button"
    >
      {walletIcon && walletName ? (
        <i className="wallet-adapter-button-start-icon">
          <WalletIcon
            wallet={
              {
                adapter: { icon: walletIcon, name: walletName },
                readyState: WalletReadyState.Installed,
              } as Wallet
            }
          />
        </i>
      ) : null}
      {children}
    </button>
  );
}

/**
 * Connect flow tuned for Mobile Wallet Adapter (Android Chrome): prefer selecting
 * MWA and calling connect from the same gesture where appropriate.
 */
export function MapleWalletMultiButton({
  children,
  className,
  style,
  disabled,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const { setVisible: setModalVisible } = useWalletModal();
  const { connect, wallet, wallets, select, publicKey, connecting } =
    useWallet();

  const { buttonState, onConnect, onDisconnect, walletIcon, walletName } =
    useWalletMultiButton({
      onSelectWallet() {
        setModalVisible(true);
      },
    });

  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /** Avoid SSR vs client mismatch: extension / localStorage can differ before hydration. */
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const mwaEntry = useMemo(
    () =>
      wallets.find((w) => w.adapter.name === MWA_WALLET_ADAPTER_NAME) ??
      null,
    [wallets],
  );

  useEffect(() => {
    const listener = (event: Event) => {
      const node = ref.current;
      if (!node || !(event.target instanceof Node) || node.contains(event.target))
        return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  const content = useMemo(() => {
    if (children) return children;
    if (publicKey) {
      const base58 = publicKey.toBase58();
      return `${base58.slice(0, 4)}..${base58.slice(-4)}`;
    }
    if (buttonState === "connecting" || buttonState === "has-wallet") {
      return LABELS[buttonState];
    }
    return LABELS["no-wallet"];
  }, [buttonState, children, publicKey]);

  const runConnect = async () => {
    try {
      await connect();
    } catch {
      /* errors surface via WalletProvider onError */
    }
  };

  const handlePrimaryClick = async () => {
    switch (buttonState) {
      case "no-wallet": {
        if (mwaEntry) {
          try {
            await select(MWA_WALLET_ADAPTER_NAME);
            await runConnect();
          } catch {
            setModalVisible(true);
          }
        } else {
          setModalVisible(true);
        }
        break;
      }
      case "has-wallet": {
        if (wallet?.adapter.name === MWA_WALLET_ADAPTER_NAME) {
          await runConnect();
        } else if (mwaEntry) {
          try {
            await select(MWA_WALLET_ADAPTER_NAME);
            await runConnect();
          } catch {
            if (onConnect) onConnect();
          }
        } else if (onConnect) {
          onConnect();
        }
        break;
      }
      case "connected":
        setMenuOpen(true);
        break;
      default:
        break;
    }
  };

  const pointerEvents: CSSProperties =
    menuOpen ? { pointerEvents: "none" } : {};

  const labelContent = hydrated
    ? content
    : (children ?? LABELS["no-wallet"]);

  return (
    <div className="wallet-adapter-dropdown" ref={ref}>
      <MapleWalletConnectionButton
        aria-expanded={menuOpen}
        className={className}
        disabled={disabled ?? connecting}
        onClick={() => void handlePrimaryClick()}
        style={{ ...pointerEvents, ...style }}
        walletIcon={hydrated ? walletIcon : undefined}
        walletName={hydrated ? walletName : undefined}
      >
        {labelContent}
      </MapleWalletConnectionButton>
      <ul
        aria-label="dropdown-list"
        className={`wallet-adapter-dropdown-list ${menuOpen ? "wallet-adapter-dropdown-list-active" : ""}`}
        role="menu"
      >
        {hydrated && publicKey ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={async () => {
              await navigator.clipboard.writeText(publicKey.toBase58());
              setCopied(true);
              setTimeout(() => setCopied(false), 400);
            }}
            role="menuitem"
          >
            {copied ? LABELS.copied : LABELS["copy-address"]}
          </li>
        ) : null}
        <li
          className="wallet-adapter-dropdown-list-item"
          onClick={() => {
            setModalVisible(true);
            setMenuOpen(false);
          }}
          role="menuitem"
        >
          {LABELS["change-wallet"]}
        </li>
        {hydrated && onDisconnect ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              void onDisconnect();
              setMenuOpen(false);
            }}
            role="menuitem"
          >
            {LABELS.disconnect}
          </li>
        ) : null}
      </ul>
    </div>
  );
}

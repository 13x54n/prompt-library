"use client";

import {
  WalletReadyState,
  type WalletName,
} from "@solana/wallet-adapter-base";
import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import {
  WalletIcon,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { walletAdapterDisplayName } from "@/lib/solana/mwa-display";
import { cn } from "@/lib/utils";

function Collapse({
  id,
  children,
  expanded = false,
}: {
  id: string;
  children: React.ReactNode;
  expanded?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const instant = useRef(true);
  const transition = "height 250ms ease-out";

  const openCollapse = () => {
    const node = ref.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.style.height = `${node.scrollHeight}px`;
    });
  };

  const closeCollapse = () => {
    const node = ref.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.style.height = `${node.offsetHeight}px`;
      node.style.overflow = "hidden";
      requestAnimationFrame(() => {
        node.style.height = "0";
      });
    });
  };

  useLayoutEffect(() => {
    if (expanded) {
      openCollapse();
    } else {
      closeCollapse();
    }
  }, [expanded]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    function handleComplete() {
      if (!node) return;
      node.style.overflow = expanded ? "initial" : "hidden";
      if (expanded) {
        node.style.height = "auto";
      }
    }

    function handleTransitionEnd(event: TransitionEvent) {
      if (node && event.target === node && event.propertyName === "height") {
        handleComplete();
      }
    }

    if (instant.current) {
      handleComplete();
      instant.current = false;
    }
    node.addEventListener("transitionend", handleTransitionEnd);
    return () => node.removeEventListener("transitionend", handleTransitionEnd);
  }, [expanded]);

  return (
    <div
      className="wallet-adapter-collapse"
      id={id}
      ref={ref}
      role="region"
      style={{
        height: 0,
        transition: instant.current ? undefined : transition,
      }}
    >
      {children}
    </div>
  );
}

function MapleWalletListItem({
  handleClick,
  tabIndex,
  wallet,
}: {
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  wallet: Wallet;
}) {
  const label = walletAdapterDisplayName(wallet.adapter.name);
  const detected = wallet.readyState === WalletReadyState.Installed;
  return (
    <li>
      <button
        className={cn(
          "maple-wallet-connect__option flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-left text-[0.9375rem] font-medium text-foreground",
          "transition-[background-color,border-color,transform] hover:bg-muted/80 active:scale-[0.99]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64B5FF]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        onClick={handleClick}
        tabIndex={tabIndex ?? 0}
        type="button"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="maple-wallet-connect__icon flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-border">
            <span className="flex size-7 items-center justify-center [&_img]:size-7 [&_img]:rounded-md">
              <WalletIcon wallet={wallet} />
            </span>
          </span>
          <span className="truncate">{label}</span>
        </span>
        {detected ? (
          <span className="text-muted-foreground shrink-0 text-[0.8125rem]">
            Detected
          </span>
        ) : null}
      </button>
    </li>
  );
}

function WalletPlaceholderGraphic() {
  return (
    <div
      aria-hidden
      className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-emerald-500/20 ring-2 ring-violet-500/30"
    >
      <svg
        className="size-12 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3V9m0 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9v3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function MapleWalletModal({
  className = "",
  container = "body",
}: {
  className?: string;
  container?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { wallets, select } = useWallet();
  const { setVisible } = useWalletModal();
  const [expanded, setExpanded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [portal, setPortal] = useState<Element | null>(null);

  const [listedWallets, collapsedWallets] = useMemo(() => {
    const installed: Wallet[] = [];
    const notInstalled: Wallet[] = [];
    for (const wallet of wallets) {
      if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet);
      } else {
        notInstalled.push(wallet);
      }
    }
    return installed.length
      ? [installed, notInstalled]
      : [notInstalled, []];
  }, [wallets]);

  const hideModal = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => setVisible(false), 150);
  }, [setVisible]);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      hideModal();
    },
    [hideModal],
  );

  const handleWalletClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, walletName: WalletName) => {
      select(walletName);
      hideModal();
      event.preventDefault();
    },
    [select, hideModal],
  );

  const handleCollapseClick = useCallback(
    () => setExpanded((e) => !e),
    [],
  );

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideModal();
      } else if (event.key === "Tab") {
        const node = ref.current;
        if (!node) return;
        const focusableElements = node.querySelectorAll("button");
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };
    const { overflow } = window.getComputedStyle(document.body);
    setTimeout(() => setFadeIn(true), 0);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, false);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [hideModal]);

  useLayoutEffect(() => {
    setPortal(document.querySelector(container));
  }, [container]);

  if (!portal) return null;

  return createPortal(
    <div
      aria-labelledby="wallet-adapter-modal-title"
      aria-modal="true"
      className={cn(
        "maple-wallet-connect-root wallet-adapter-modal font-sans",
        fadeIn && "maple-wallet-connect--open",
        className,
      )}
      ref={ref}
      role="dialog"
    >
      <div
        className="maple-wallet-connect__backdrop wallet-adapter-modal-overlay"
        onMouseDown={handleClose}
        role="presentation"
      />
      <div className="wallet-adapter-modal-container maple-wallet-connect__container">
        <div
          className={cn(
            "wallet-adapter-modal-wrapper maple-wallet-connect__panel",
            "flex w-[min(100%,22rem)] min-w-[min(100%,17.5rem)] max-w-md flex-col",
            "rounded-2xl",
          )}
        >
          {/* <button
            className={cn(
              "wallet-adapter-modal-button-close maple-wallet-connect__close",
              "flex size-10 items-center justify-center rounded-full p-0 shadow-sm",
              "text-muted-foreground transition-colors hover:text-foreground",
            )}
            aria-label="Close"
            onClick={handleClose}
            type="button"
          >
            <X aria-hidden className="size-[1.05rem]" strokeWidth={2.25} />
          </button> */}
          {listedWallets.length ? (
            <>
              <h1
                className="maple-wallet-connect__title wallet-adapter-modal-title"
                id="wallet-adapter-modal-title"
              >
                Connect a wallet to continue
              </h1>
              <ul className="maple-wallet-connect__list wallet-adapter-modal-list">
                {listedWallets.map((wallet) => (
                  <MapleWalletListItem
                    key={wallet.adapter.name}
                    handleClick={(e) =>
                      handleWalletClick(e, wallet.adapter.name)
                    }
                    wallet={wallet}
                  />
                ))}
                {collapsedWallets.length ? (
                  <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                    {collapsedWallets.map((wallet) => (
                      <MapleWalletListItem
                        key={wallet.adapter.name}
                        handleClick={(e) =>
                          handleWalletClick(e, wallet.adapter.name)
                        }
                        tabIndex={expanded ? 0 : -1}
                        wallet={wallet}
                      />
                    ))}
                  </Collapse>
                ) : null}
              </ul>
              {collapsedWallets.length ? (
                <button
                  className="maple-wallet-connect__more wallet-adapter-modal-list-more"
                  onClick={handleCollapseClick}
                  tabIndex={0}
                  type="button"
                >
                  <span>
                    {expanded ? "Less " : "More "}
                    options
                  </span>
                  <svg
                    className={
                      expanded ? "wallet-adapter-modal-list-more-icon-rotate" : ""
                    }
                    height="7"
                    viewBox="0 0 13 7"
                    width="13"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" />
                  </svg>
                </button>
              ) : null}
            </>
          ) : (
            <>
              <h1
                className="maple-wallet-connect__title wallet-adapter-modal-title"
                id="wallet-adapter-modal-title"
              >
                You&apos;ll need a wallet on Solana to continue
              </h1>
              <div className="wallet-adapter-modal-middle maple-wallet-connect__middle">
                <WalletPlaceholderGraphic />
              </div>
              {collapsedWallets.length ? (
                <>
                  <button
                    className="maple-wallet-connect__more wallet-adapter-modal-list-more"
                    onClick={handleCollapseClick}
                    tabIndex={0}
                    type="button"
                  >
                    <span>
                      {expanded ? "Hide " : "Already have a wallet? View "}
                      options
                    </span>
                    <svg
                      className={
                        expanded ? "wallet-adapter-modal-list-more-icon-rotate" : ""
                      }
                      height="7"
                      viewBox="0 0 13 7"
                      width="13"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" />
                    </svg>
                  </button>
                  <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                    <ul className="maple-wallet-connect__list wallet-adapter-modal-list">
                      {collapsedWallets.map((wallet) => (
                        <MapleWalletListItem
                          key={wallet.adapter.name}
                          handleClick={(e) =>
                            handleWalletClick(e, wallet.adapter.name)
                          }
                          tabIndex={expanded ? 0 : -1}
                          wallet={wallet}
                        />
                      ))}
                    </ul>
                  </Collapse>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>,
    portal,
  );
}

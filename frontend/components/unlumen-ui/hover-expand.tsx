"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface HoverExpandItem {
  label: string;
  /** e.g. country, year, category */
  sublabel?: string;
  image: string;
  imageAlt?: string;
  /** app / dapp icon shown beside the label; defaults to site logo */
  logo?: string;
  logoAlt?: string;
  /** short descriptor shown when expanded */
  description?: string;
}

export interface HoverExpandProps {
  items: HoverExpandItem[];
  /**
   * Row height when collapsed, in pixels.
   * @default 68
   */
  collapsedHeight?: number;
  /**
   * Row height when expanded, in pixels.
   * @default 320
   */
  expandedHeight?: number;
  className?: string;
}

export function HoverExpand({
  items,
  collapsedHeight = 68,
  expandedHeight = 320,
  className,
}: HoverExpandProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <h2 className="font-semibold tracking-tight">
        ✨ Featured on Maple
      </h2>
      <div className="w-full  border-current opacity-15" />

      {items.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const isOtherHovered = hoveredIndex !== null && !isHovered;

        return (
          <React.Fragment key={i}>
            <motion.div
              className="relative w-full overflow-hidden cursor-default"
              animate={{
                height: isHovered ? expandedHeight : collapsedHeight,
                opacity: isOtherHovered ? 0.38 : 1,
              }}
              transition={{
                height: {
                  type: "spring",
                  stiffness: 280,
                  damping: 32,
                  mass: 0.9,
                },
                opacity: { duration: 0.22, ease: "easeOut" },
              }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 1.06,
                }}
                transition={{
                  opacity: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
                  scale: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
                }}
              >
                <img
                  src={item.image}
                  alt={item.imageAlt ?? ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              </motion.div>

              <div className="absolute inset-0 flex items-end px-5 pb-4">
                <div className="flex w-full items-end justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      className="size-8 shrink-0 overflow-hidden rounded-md bg-white/10 ring-1 ring-white/15"
                      animate={{
                        opacity: isHovered ? 1 : 0.72,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={item.logo ?? "/logo.png"}
                        alt={item.logoAlt ?? `${item.label} app logo`}
                        width={32}
                        height={32}
                        className="size-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.div>

                    <motion.span
                      className="font-semibold tracking-tight truncate"
                      style={{ fontSize: "clamp(1.1rem, 2.2vw, 1rem)" }}
                      animate={{
                        color: isHovered ? "#ffffff" : "currentColor",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>

                    {item.description && (
                      <motion.span
                        className="text-sm text-white/70 truncate hidden sm:block"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          x: isHovered ? 0 : -8,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: isHovered ? 0.12 : 0,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      >
                        — {item.description}
                      </motion.span>
                    )}
                  </div>

                  {item.sublabel && (
                    <motion.button
                      className="text-xs tracking-widest uppercase shrink-0 bg-white text-black px-2 py-1 rounded-md border-none cursor-pointer"
                      animate={{
                        color: isHovered
                          ? "rgba(0,0,0,1)"
                          : "rgba(0,0,0,0.55)",
                        opacity: isHovered ? 1 : 0.45,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.sublabel}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="w-full border-t border-current opacity-15" />
          </React.Fragment>
        );
      })}
    </div>
  );
}

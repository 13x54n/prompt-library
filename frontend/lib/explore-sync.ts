"use client";

const EXPLORE_INVALIDATE_EVENT = "pl:explore:invalidate";

export function emitExploreInvalidate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EXPLORE_INVALIDATE_EVENT));
}

export function onExploreInvalidate(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EXPLORE_INVALIDATE_EVENT, handler);
  return () => window.removeEventListener(EXPLORE_INVALIDATE_EVENT, handler);
}

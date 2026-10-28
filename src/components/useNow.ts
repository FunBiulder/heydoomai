"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 10_000);
  return () => clearInterval(id);
};
// Minute resolution keeps the snapshot stable between renders.
const snapshot = () => Math.floor(Date.now() / 60_000) * 60_000;

/** Current time (to the minute) on the client; null while prerendering so server HTML stays static. */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribe, snapshot, () => null);
  return ms === null ? null : new Date(ms);
}

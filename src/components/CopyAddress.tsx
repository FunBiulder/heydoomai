"use client";

import { useState } from "react";

/** Full contract address in a mono box with a copy button. */
export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="ca">
      <code className="ca-addr">{address}</code>
      <button
        type="button"
        className="btn ca-btn"
        onClick={() => {
          navigator.clipboard?.writeText(address).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            },
            () => {},
          );
        }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </span>
  );
}

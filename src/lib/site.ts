export const SITE_NAME = "Doom AI";

/** Set NEXT_PUBLIC_X_URL to the project's X (Twitter) profile, e.g. https://x.com/yourhandle */
export const X_URL = process.env.NEXT_PUBLIC_X_URL || "https://x.com";

/** The official $DOOM token. Verified on-chain: name "HeyDoomAI", symbol DOOM, 18 decimals, 1B supply. */
export const DOOM_TOKEN = {
  chainId: 4663,
  chainName: "Robinhood Chain",
  address: "0x4F6a163CCaa17A93088d40695754d65e583e3297",
  symbol: "DOOM",
  name: "HeyDoomAI",
  decimals: 18,
  totalSupply: "1,000,000,000",
  explorerUrl: "https://robinhoodchain.blockscout.com/token/0x4F6a163CCaa17A93088d40695754d65e583e3297",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/doomai", label: "DoomAI" },
  { href: "/docs", label: "Docs" },
] as const;

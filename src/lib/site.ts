export const SITE_NAME = "Doom AI";

/** Set NEXT_PUBLIC_X_URL to the project's X (Twitter) profile, e.g. https://x.com/yourhandle */
export const X_URL = process.env.NEXT_PUBLIC_X_URL || "https://x.com";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/doomai", label: "DoomAI" },
  { href: "/docs", label: "Docs" },
] as const;

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { X_URL } from "@/lib/site";
import { CardFileIcon, CoinIcon, DeskIcon, HelpIcon, KeyboardIcon, LedgerIcon, PlugIcon, PointIcon, XIcon } from "./Icons";
import { useNow } from "./useNow";

const PLACES: Record<string, { name: string; next: { href: string; label: string } }> = {
  "/": { name: "Desk", next: { href: "/doomai", label: "DoomAI" } },
  "/doomai": { name: "DoomAI", next: { href: "/docs", label: "Docs" } },
  "/docs": { name: "Docs", next: { href: "/", label: "Desk" } },
};

const TOOLS = [
  { href: "/", label: "Desk", icon: <DeskIcon /> },
  { href: "/doomai", label: "DoomAI", icon: <KeyboardIcon /> },
  { href: "/docs", label: "Docs", icon: <CardFileIcon /> },
  { href: "/docs#fees", label: "Fees", icon: <LedgerIcon /> },
  { href: "/docs#smart-contracts", label: "$DOOM", icon: <CoinIcon /> },
];

function Today() {
  const now = useNow();
  return (
    <span className="sb-date">
      {now
        ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : "Doom AI · Robinhood Chain"}
    </span>
  );
}

/** The whole-site "device": status bar on top, a scrolling screen, and a toolbar of tools at the bottom. */
export function DeviceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const place = PLACES[pathname] ?? PLACES["/"];
  return (
    <div className="device">
      <header className="statusbar">
        <Link href="/" className="sb-place">
          <HelpIcon /> {place.name}
        </Link>
        <span className="sb-mid">
          <Today />
          <PlugIcon />
        </span>
        <Link href={place.next.href} className="sb-next">
          <PointIcon /> {place.next.label}
        </Link>
      </header>

      <div className="screen">{children}</div>

      <nav className="toolbar" aria-label="Tools">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className={`tool${pathname === t.href ? " on" : ""}`}>
            {t.icon}
            <span>{t.label}</span>
          </Link>
        ))}
        <a href={X_URL} target="_blank" rel="noreferrer" className="tool">
          <XIcon size={22} />
          <span>Follow</span>
        </a>
      </nav>
    </div>
  );
}

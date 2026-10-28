import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { X_URL } from "@/lib/site";
import { Clock } from "./Clock";
import { CardFile, CoinStack, DeskBackdrop, Ledger, NetworkFrame, Postcard, Terminal, Tray } from "./Objects";

type Spot = { l: number; t: number; w: number; h?: number };

const pos = ({ l, t, w, h }: Spot): CSSProperties => ({
  left: `${l}%`,
  top: `${t}%`,
  width: `${w}%`,
  ...(h ? { height: `${h}%` } : {}),
});

function Obj({ href, label, spot, children, external, className = "" }: {
  href: string; label: string; spot: Spot; children: ReactNode; external?: boolean; className?: string;
}) {
  const body = (
    <>
      {children}
      <span className="obj-label">{label}</span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={`obj ${className}`} style={pos(spot)} aria-label={label}>
      {body}
    </a>
  ) : (
    <Link href={href} className={`obj ${className}`} style={pos(spot)} aria-label={label}>
      {body}
    </Link>
  );
}

/** The landing "desk": every object is a door into the product. */
export function DeskScene() {
  return (
    <div className="desk">
      <DeskBackdrop />

      <div className="obj obj-static" style={pos({ l: 4, t: 7, w: 8.5 })}>
        <Clock />
      </div>
      <Obj href="/docs#how-it-works" label="Network map" spot={{ l: 17, t: 9, w: 10.5 }}>
        <NetworkFrame />
      </Obj>
      <Obj href="/doomai" label="Swap inbox" spot={{ l: 52, t: 10, w: 8.4 }}>
        <Tray label="SWAP" />
      </Obj>
      <Obj href="/doomai" label="Bridge outbox" spot={{ l: 63, t: 10, w: 8.4 }}>
        <Tray label="BRIDGE" />
      </Obj>
      <Obj href="/docs" label="Docs cabinet" spot={{ l: 83.5, t: 20.5, w: 12.5, h: 34 }} className="obj-hit">
        <span />
      </Obj>

      <Obj href="/docs" label="Docs card file" spot={{ l: 5, t: 40, w: 16 }}>
        <CardFile />
      </Obj>
      <Obj href="/doomai" label="Open DoomAI" spot={{ l: 27, t: 24, w: 20 }} className="obj-hero">
        <Terminal />
      </Obj>
      <Obj href={X_URL} label="Follow on X" spot={{ l: 50, t: 51, w: 14 }} external>
        <Postcard />
      </Obj>
      <Obj href="/docs#fees" label="Fees ledger" spot={{ l: 66, t: 54, w: 12 }}>
        <Ledger />
      </Obj>
      <Obj href="/docs#smart-contracts" label="$DOOM — soon" spot={{ l: 78.5, t: 50, w: 11.5 }}>
        <CoinStack tag={false} />
      </Obj>

      <Obj href="/doomai" label="Swaps drawer" spot={{ l: 2.5, t: 81.4, w: 45.4, h: 10.7 }} className="obj-hit">
        <span />
      </Obj>
      <Obj href="/doomai" label="Bridges drawer" spot={{ l: 51.6, t: 81.4, w: 45.4, h: 10.7 }} className="obj-hit">
        <span />
      </Obj>
    </div>
  );
}

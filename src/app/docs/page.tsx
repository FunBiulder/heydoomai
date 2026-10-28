import type { Metadata } from "next";
import Link from "next/link";
import { Window } from "@/components/Window";
import { XLink } from "@/components/XLogo";

export const metadata: Metadata = {
  title: "Docs · Doom AI",
  description: "What Doom AI is, how it works, fees, smart contracts and the upcoming Doom token.",
};

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "what-is-doom", label: "What is Doom" },
  { id: "how-it-works", label: "How it works" },
  { id: "fees", label: "Fees" },
  { id: "smart-contracts", label: "Smart contracts" },
  { id: "doomai", label: "DoomAI" },
];

const UNIVERSAL_ROUTER = "0x204FAca1764B154221e35c0d20aBb3c525710498";

export default function DocsPage() {
  return (
    <main className="docs">
        <nav className="docs-tabs" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="docs-body">
          <Window title="Docs — card file" className="doc">
            <p className="kicker">Documentation</p>
            <h1 className="big-title">Doom, explained.</h1>
            <p className="lead">Everything you need to know before your first prompt.</p>
          </Window>

          <Window id="about" title="About" className="doc index-card">
            <p>
              Doom AI is an AI trading agent for <b>Robinhood Chain</b> — an Ethereum L2 (Arbitrum Orbit, chain id 4663,
              gas paid in ETH). It turns a sentence into a ready-to-sign swap or bridge, so you can move between crypto
              and tokenized US stocks without hunting for pools, routes or contract addresses.
            </p>
            <p>
              Doom is non-custodial. It never holds funds, never sees your private keys and never sends a transaction on
              its own — every action is signed by you, in your wallet.
            </p>
          </Window>

          <Window id="what-is-doom" title="What is Doom" className="doc index-card">
            <p>Doom is a conversational layer on top of the best on-chain liquidity available to Robinhood Chain:</p>
            <ul>
              <li>
                <b>Swaps</b> — crypto ⇄ crypto, crypto ⇄ Stock Tokens (NVDA, AAPL, SPY…) and stock ⇄ stock, routed through
                Uniswap v2/v3/v4 pools.
              </li>
              <li>
                <b>Bridges</b> — Robinhood Chain ⇄ Ethereum, Arbitrum, Base, Optimism, Polygon and BNB Chain via LI.FI
                (Across, Relay, Stargate and more), including bridge-and-swap in one step.
              </li>
              <li>
                <b>Safety by default</b> — ambiguous tickers are never guessed, decimals are read on-chain, and approvals
                are for the exact amount only.
              </li>
            </ul>
          </Window>

          <Window id="how-it-works" title="How it works" className="doc index-card">
            <ol className="flow">
              <li>
                <b>You type a request.</b> “Swap 0.05 ETH for NVDA” or “Bridge 50 USDC from Arbitrum and swap it into
                AAPL”.
              </li>
              <li>
                <b>Doom resolves tokens.</b> It searches the token lists, shows you candidates if a ticker is ambiguous,
                and reads decimals directly from the contract.
              </li>
              <li>
                <b>Doom checks balances and quotes.</b> Uniswap&apos;s Trading API for same-chain swaps (LI.FI as a
                fallback), LI.FI for bridges.
              </li>
              <li>
                <b>You review a plan card.</b> Amount in, expected and minimum out, price impact, fees, gas, ETA and any
                warnings (balance shortfall, impact &gt; 3%, third-party recipient).
              </li>
              <li>
                <b>You sign.</b> Approve (exact amount) → sign the Permit2 message if needed → send the swap or bridge. For
                bridges, Doom tracks the transfer until it lands.
              </li>
            </ol>
          </Window>

          <Window id="fees" title="Fees" className="doc index-card">
            <div className="fee-grid">
              <div className="fee">
                <span className="fee-big">0%</span>
                <span>Doom platform fee</span>
              </div>
              <div className="fee">
                <span className="fee-big">Gas</span>
                <span>Network fee, paid in ETH to the chain</span>
              </div>
              <div className="fee">
                <span className="fee-big">Route</span>
                <span>Pool or bridge fees set by Uniswap / the bridge</span>
              </div>
            </div>
            <p className="muted">
              Doom adds nothing on top of the route today. Every cost is shown on the plan card before you sign — the
              number you see is the number you pay.
            </p>
          </Window>

          <Window id="smart-contracts" title="Smart contracts" className="doc index-card">
            <div className="soon-card">
              <div>
                <span className="badge">Coming soon</span>
                <h3 className="fee-big">$DOOM token</h3>
                <p className="muted">
                  The Doom token is in the works. Contract address, supply and utility will be published here — and on
                  our X account — at launch. Until then, any “DOOM” token you see is not ours.
                </p>
              </div>
              <XLink size={20} />
            </div>
            <h3>Contracts Doom interacts with</h3>
            <dl className="contracts">
              <dt>Uniswap Universal Router · Robinhood Chain</dt>
              <dd className="mono">{UNIVERSAL_ROUTER}</dd>
            </dl>
            <p className="muted small">
              Any swap transaction that does not target this router is refused before it reaches your wallet. Bridge
              transactions use the contract returned by the selected LI.FI route, shown in your wallet before signing.
            </p>
          </Window>

          <Window id="doomai" title="DoomAI" className="doc index-card">
            <p>
              DoomAI is the chat app where it all happens. Connect a browser wallet (MetaMask, Rabby, Robinhood Wallet
              extension), switch to Robinhood Chain when prompted, and tell Doom what you want.
            </p>
            <div className="examples">
              {["Swap 0.05 ETH for NVDA", "Buy $200 of SPY with USDG", "Bridge 0.1 ETH from Base to Robinhood"].map(
                (e) => (
                  <span key={e} className="chip">
                    {e}
                  </span>
                ),
              )}
            </div>
            <Link href="/doomai" className="btn btn-default doc-cta">
              Open DoomAI →
            </Link>
            <p className="muted small">
              Stock Tokens are tokenized exposure to US equities, not brokerage shares, and may be unavailable in your
              jurisdiction. Doom does not give investment advice.
            </p>
          </Window>
        </div>
    </main>
  );
}

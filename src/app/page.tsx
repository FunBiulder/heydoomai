import Link from "next/link";
import { DeskScene } from "@/components/desk/DeskScene";
import { CoinStack } from "@/components/desk/Objects";
import { DoomLogo, DoomMark } from "@/components/Logo";
import { Window } from "@/components/Window";
import { XIcon } from "@/components/Icons";
import { CopyAddress } from "@/components/CopyAddress";
import { DOOM_TOKEN, X_URL } from "@/lib/site";

const TICKER = [
  "NVDA", "AAPL", "TSLA", "SPY", "ETH", "USDC", "USDG", "WETH",
  "UNISWAP V4", "LI.FI", "ACROSS", "RELAY", "STARGATE", "PERMIT2",
];

const SPECS = [
  { v: "7", k: "Networks", d: "Robinhood Chain ⇄ six major EVM ecosystems" },
  { v: "0%", k: "Protocol fee", d: "You pay the route and gas — nothing else" },
  { v: "v2–v4", k: "Liquidity", d: "Every Uniswap pool generation, one intent" },
  { v: "100%", k: "Custody", d: "Keys never leave your wallet" },
];

const ENGINE = [
  { n: "01", t: "Intent", b: "Speak in plain language. DoomAI decomposes it into a deterministic execution spec: asset, quantity, direction, origin chain and destination." },
  { n: "02", t: "Intelligence", b: "The agent resolves assets against on-chain state, inspects balances and benchmarks routes across Uniswap and the LI.FI aggregation layer for optimal output." },
  { n: "03", t: "Sovereignty", b: "A transparent execution plan is rendered for review. Approve, sign and broadcast from your own wallet. DoomAI never touches custody." },
];

const GUARDRAILS = [
  { t: "Router allowlist", b: "Swap calldata aimed at anything but the canonical Uniswap Universal Router is rejected before it reaches your wallet." },
  { t: "On-chain precision", b: "Token decimals are read straight from contract state, never inferred from a search index." },
  { t: "Anti-spoof resolution", b: "Ambiguous tickers surface verified candidates. DoomAI never guesses between look-alike assets." },
  { t: "Exact-amount approvals", b: "Allowances are scoped to the precise trade size. No unlimited approvals, ever." },
  { t: "Risk telemetry", b: "Price impact above 3%, balance shortfalls and third-party recipients are flagged before you sign." },
  { t: "Non-custodial core", b: "DoomAI prepares. You authorize. Funds and keys remain exclusively yours." },
];

const NETWORKS = ["Ethereum", "Arbitrum", "Base", "Optimism", "Polygon", "BNB Chain"];

export default function Landing() {
  return (
    <main className="landing">
      <div className="desk-wrap">
        <DeskScene />
        <p className="desk-hint">
          <span className="blink-dot" /> Click anything on the desk — or scroll for the full tour.
        </p>
      </div>

      <Window title="Welcome.doom" className="welcome">
        <div className="welcome-row">
          <DoomMark size={112} className="welcome-mark" />
          <div>
            <p className="kicker">Intent-native execution · Robinhood Chain</p>
            <h1 className="big-title">
              Hey,
              <br />
              Doom AI.
            </h1>
          </div>
        </div>
        <p className="lead">
          The autonomous trading desk for Robinhood Chain. Swap tokenized equities and crypto, bridge across seven
          networks — one sentence in, a verified, ready-to-sign transaction out.
        </p>
        <div className="btn-row">
          <Link href="/doomai" className="btn btn-default">
            Open DoomAI
          </Link>
          <Link href="/docs" className="btn">
            Read the docs
          </Link>
        </div>
      </Window>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>
              {t}
              <i>◆</i>
            </span>
          ))}
        </div>
      </div>

      <section className="spotlight">
        <div className="spot-copy">
          <p className="kicker">Flagship agent</p>
          <h2 className="sec-title">
            Meet <mark>DoomAI</mark>
          </h2>
          <p className="lead">
            An autonomous execution agent that compiles natural language into verified, ready-to-sign on-chain
            transactions. It reasons over live liquidity, resolves assets against on-chain truth and composes
            cross-chain routes — then hands the final signature to you.
          </p>
          <ul className="checks">
            <li>
              <b>Intent compiler</b> — asset, amount, side and chain, parsed from a single sentence.
            </li>
            <li>
              <b>Liquidity intelligence</b> — Uniswap v2·v3·v4 pools and LI.FI&apos;s bridge mesh, queried in real time.
            </li>
            <li>
              <b>Zero-trust output</b> — every transaction is checked against allowlisted contracts before it reaches you.
            </li>
          </ul>
          <Link href="/doomai" className="btn btn-default">
            Enter DoomAI →
          </Link>
        </div>

        <Window title="DoomAI — example session" className="term-win">
          <div className="term">
            <div className="term-user">Bridge 50 USDC from Arbitrum and swap it into AAPL</div>
            <ol className="term-trace">
              <li><code>find_token</code> AAPL → verified Stock Token · decimals read on-chain</li>
              <li><code>get_balances</code> 50.00 USDC available on Arbitrum</li>
              <li><code>quote_bridge</code> LI.FI best route · bridge + swap in one step</li>
            </ol>
            <div className="term-plan">
              <div><small>You pay · Arbitrum</small><strong>50 USDC</strong></div>
              <span>→</span>
              <div><small>You get · Robinhood Chain</small><strong>AAPL</strong></div>
            </div>
            <div className="term-steps">
              <span>approve</span><span>bridge</span><span className="on">sign in wallet</span>
            </div>
          </div>
        </Window>
      </section>

      <section className="specs">
        {SPECS.map((s) => (
          <Window key={s.k} title={s.k} className="spec">
            <span className="spec-v">{s.v}</span>
            <span className="muted">{s.d}</span>
          </Window>
        ))}
      </section>

      <section>
        <p className="kicker">The engine</p>
        <h2 className="sec-title">From intent to finality, in three movements.</h2>
        <div className="engine">
          {ENGINE.map((s) => (
            <Window key={s.n} title={`Step ${s.n}`} className="step">
              <h3>{s.t}</h3>
              <p>{s.b}</p>
            </Window>
          ))}
        </div>
      </section>

      <Window title="Security architecture" className="guard">
        <h2 className="sec-title">Guardrails engineered into the execution path.</h2>
        <p className="lead">Not bolted on. Every safeguard runs before a single byte reaches your wallet.</p>
        <div className="guard-grid">
          {GUARDRAILS.map((g, i) => (
            <div key={g.t} className="guard-item">
              <span className="guard-i">{String(i + 1).padStart(2, "0")}</span>
              <h3>{g.t}</h3>
              <p>{g.b}</p>
            </div>
          ))}
        </div>
      </Window>

      <section className="coverage">
        <div>
          <p className="kicker">Cross-chain coverage</p>
          <h2 className="sec-title">One hub. Seven networks.</h2>
          <p className="lead">
            Robinhood Chain sits at the center. DoomAI routes value in and out through Across, Relay, Stargate and
            more, selecting the optimal path for every transfer.
          </p>
        </div>
        <div className="hub">
          <div className="hub-core">
            <DoomMark size={48} />
            <b>Robinhood Chain</b>
            <span>chain id 4663</span>
          </div>
          {NETWORKS.map((n, i) => (
            <span key={n} className="hub-node" style={{ ["--i" as string]: i }}>
              {n}
            </span>
          ))}
        </div>
      </section>

      <Window title="$DOOM.token — live" className="token">
        <div className="token-row">
          <div className="token-art">
            <CoinStack />
          </div>
          <div>
            <span className="badge">Live on {DOOM_TOKEN.chainName}</span>
            <h2 className="sec-title">$DOOM</h2>
            <p className="lead">
              The native token of the Doom ecosystem — live on Robinhood Chain and routable straight from DoomAI. One
              contract, one source of truth: verify the address below before you trade.
            </p>
            <dl className="token-facts">
              <div><dt>Name</dt><dd>{DOOM_TOKEN.name}</dd></div>
              <div><dt>Symbol</dt><dd>${DOOM_TOKEN.symbol}</dd></div>
              <div><dt>Supply</dt><dd>{DOOM_TOKEN.totalSupply}</dd></div>
              <div><dt>Decimals</dt><dd>{DOOM_TOKEN.decimals}</dd></div>
            </dl>
            <CopyAddress address={DOOM_TOKEN.address} />
            <div className="btn-row token-actions">
              <Link href="/doomai" className="btn btn-default">
                Swap for $DOOM in DoomAI
              </Link>
              <a href={DOOM_TOKEN.explorerUrl} target="_blank" rel="noreferrer" className="btn">
                View on explorer ↗
              </a>
              <a href={X_URL} target="_blank" rel="noreferrer" className="btn">
                <XIcon size={14} /> Follow
              </a>
            </div>
          </div>
        </div>
      </Window>

      <section className="finale">
        <h2 className="big-title">
          Stop clicking.
          <br />
          Start commanding.
        </h2>
        <div className="btn-row">
          <Link href="/doomai" className="btn btn-default">
            Launch DoomAI
          </Link>
          <Link href="/docs" className="btn">
            Explore the docs
          </Link>
        </div>
      </section>

      <footer className="site-foot">
        <DoomLogo size={26} />
        <p>© 2026 Doom AI · Non-custodial · Stock Tokens are not brokerage shares · Not investment advice</p>
      </footer>
    </main>
  );
}

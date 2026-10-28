# Robin Agent

An AI agent that swaps and bridges from a prompt on **Robinhood Chain** (Arbitrum Orbit L2, chain id `4663`, ETH gas).

- **Swaps** — crypto ⇄ crypto, crypto ⇄ Stock Tokens (NVDA, AAPL, SPY…), stock ⇄ stock, routed through the Uniswap Trading API (v2/v3/v4 pools, Universal Router 2.1.2).
- **Bridges** — Robinhood Chain ⇄ Ethereum, Arbitrum, Base, Optimism, Polygon, BNB via LI.FI (Across, Relay, Stargate… best route), including bridge-and-swap in one step.
- **Non-custodial** — the agent only prepares transactions. Every approve / permit / swap / bridge is signed by the user in their own wallet.

```
"Bridge 50 USDC from Arbitrum and swap it into AAPL"
        │
        ▼
 /api/chat  (Claude + tools)
   find_token ─ LI.FI token list → Blockscout search fallback → on-chain decimals
   get_balances ─ viem RPC reads
   quote_swap ─ Uniswap /check_approval + /quote   (fallback: LI.FI same-chain)
   quote_bridge ─ LI.FI /quote + allowance check
        │  returns an ExecutionPlan
        ▼
 <PlanCard>  approve → sign Permit2 → /api/swap builds tx → wallet sends → receipt
                                         (bridge: polls /api/bridge-status until DONE)
```

## Run it

```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY and UNISWAP_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

Use any injected wallet (MetaMask, Rabby, Robinhood Wallet browser extension). The app prompts to add/switch to Robinhood Chain.

## Layout

| Path | What it does |
| --- | --- |
| `src/lib/chains.ts` | Robinhood Chain + bridge chains, aliases, explorer links |
| `src/lib/tokens.ts` | Token resolution (symbols, names, addresses) and balances |
| `src/lib/uniswap.ts` | Uniswap Trading API client; rejects any swap tx not sent to the documented Universal Router |
| `src/lib/lifi.ts` | LI.FI quote / status client; exact-amount approvals only |
| `src/lib/agent-tools.ts` | The agent's tools and the `ExecutionPlan` shape the UI renders |
| `src/app/api/chat/route.ts` | Agent loop (AI SDK v7, `streamText`, up to 6 steps) |
| `src/app/api/swap/route.ts` | Builds the final Uniswap swap tx after the Permit2 signature |
| `src/components/PlanCard.tsx` | The approve → sign → execute flow |

## Safety rails already in place

- Ambiguous tickers are never guessed — the agent shows candidates (scam copies of stock tickers exist).
- Token decimals are always read on-chain, never from a search index.
- Approvals are for the exact amount, never unlimited.
- Uniswap swap calldata must target Universal Router `0x204FAca1764B154221e35c0d20aBb3c525710498` on 4663 or it's refused.
- Balance shortfalls, >3% price impact and third-party recipients show as warnings on the card.
- Bridges are limited to routes into or out of Robinhood Chain for this launch.

## Before mainnet

- **Verify addresses yourself.** The Universal Router address comes from Uniswap's supported-chains page; confirm it on Blockscout before shipping.
- **Rate limits.** Put the Uniswap/LI.FI keys behind your own auth and add per-wallet rate limiting on `/api/chat` — it spends your LLM and API quota.
- **Compliance.** Stock Tokens aren't available everywhere. Add geo-gating / terms as your counsel advises; the UI only carries a disclaimer.
- **Next steps worth adding:** UniswapX routing (`/order` flow, gasless + MEV-protected; currently AMM-only), WalletConnect, a Stock Token allowlist from Robinhood's official registry, and portfolio view.

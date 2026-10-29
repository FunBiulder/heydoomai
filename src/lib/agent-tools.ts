import { tool } from "ai";
import { formatUnits, parseUnits, type Address } from "viem";
import { z } from "zod";
import { chainName, NATIVE, resolveChainId, ROBINHOOD_CHAIN_ID } from "./chains";
import { lifiQuote } from "./lifi";
import { findTokens, getBalances, getTokenPriceUSD, type Token } from "./tokens";
import { uniswapEnabled, uniswapQuote, type TxRequest } from "./uniswap";

export type TokenView = Pick<Token, "symbol" | "name" | "address" | "decimals" | "chainId">;

/** What the UI renders as an executable card. Amounts are already formatted for display. */
export type ExecutionPlan = {
  kind: "swap" | "bridge";
  provider: string;
  chainId: number; // chain the user signs on
  toChainId: number;
  from: TokenView & { amount: string };
  to: TokenView & { amount: string; minAmount?: string };
  priceImpact?: number;
  feesUSD?: number;
  gasUSD?: number;
  durationSec?: number;
  approval: TxRequest | null;
  /** Uniswap-only: Permit2 typed data to sign, then POST /api/swap to build the final tx. */
  permitData?: Record<string, unknown> | null;
  uniswapQuote?: Record<string, unknown>;
  /** Ready-to-send tx (LI.FI routes, or Uniswap after /api/swap). */
  tx?: TxRequest;
  warnings: string[];
  requestedUSD?: number;
};

const view = (t: Token): TokenView => ({
  symbol: t.symbol,
  name: t.name,
  address: t.address,
  decimals: t.decimals,
  chainId: t.chainId,
});

type Resolved = { ok: true; token: Token } | { ok: false; error: string; candidates?: TokenView[] };

async function resolveOne(query: string, chainId: number): Promise<Resolved> {
  const found = await findTokens(query, chainId);
  if (found.length === 0) return { ok: false, error: `No token matching "${query}" on ${chainName(chainId)}.` };
  const exact = found.filter(
    (t) => t.symbol.toLowerCase() === query.toLowerCase() || t.address.toLowerCase() === query.toLowerCase(),
  );
  if (exact.length === 1) return { ok: true, token: exact[0] };
  return {
    ok: false,
    error: `"${query}" is ambiguous on ${chainName(chainId)}. Ask the user which one, then retry with the address.`,
    candidates: found.map(view),
  };
}

async function balanceWarning(owner: Address, t: Token, amount: bigint): Promise<string | null> {
  try {
    const [b] = await getBalances(owner, t.chainId, [t]);
    if (BigInt(b.raw) < amount) {
      return `Insufficient ${t.symbol}: wallet has ${formatUnits(BigInt(b.raw), t.decimals)}, needs ${formatUnits(amount, t.decimals)}.`;
    }
  } catch {
    /* RPC hiccup — the wallet will catch it at signing time */
  }
  return null;
}

/** Strip bulky calldata before the plan goes back into the model's context. */
const forModel = (output: unknown) => {
  if (!output || typeof output !== "object" || !("plan" in output)) return { type: "json" as const, value: output as never };
  const p = (output as { plan: ExecutionPlan }).plan;
  return {
    type: "json" as const,
    value: {
      shownToUserAsCard: true,
      kind: p.kind,
      provider: p.provider,
      from: `${p.from.amount} ${p.from.symbol} on ${chainName(p.chainId)}`,
      to: `${p.to.amount} ${p.to.symbol} on ${chainName(p.toChainId)}`,
      minReceived: p.to.minAmount,
      priceImpact: p.priceImpact,
      feesUSD: p.feesUSD,
      gasUSD: p.gasUSD,
      durationSec: p.durationSec,
      needsApproval: Boolean(p.approval),
      needsPermitSignature: Boolean(p.permitData),
      warnings: p.warnings,
      requestedUSD: p.requestedUSD,
    } as never,
  };
};

export function buildTools(wallet: Address | undefined) {
  const needWallet = { error: "No wallet connected. Ask the user to connect a wallet first." };

  return {
    find_token: tool({
      description:
        "Look up crypto tokens or tokenized stocks/ETFs (e.g. NVDA, AAPL, SPY, USDG, WETH) by symbol, name or address. Defaults to Robinhood Chain.",
      inputSchema: z.object({
        query: z.string().describe("Symbol, name or 0x address"),
        chain: z.string().optional().describe("Chain name or id; defaults to Robinhood Chain"),
      }),
      execute: async ({ query, chain }) => {
        const chainId = chain ? resolveChainId(chain) : ROBINHOOD_CHAIN_ID;
        if (!chainId) return { error: `Unsupported chain "${chain}".` };
        return { chain: chainName(chainId), tokens: (await findTokens(query, chainId)).map(view) };
      },
    }),

    get_balances: tool({
      description: "Get the connected wallet's balances for specific tokens on a chain.",
      inputSchema: z.object({
        tokens: z.array(z.string()).min(1).max(10).describe("Symbols or addresses"),
        chain: z.string().optional(),
      }),
      execute: async ({ tokens, chain }) => {
        if (!wallet) return needWallet;
        const chainId = chain ? resolveChainId(chain) : ROBINHOOD_CHAIN_ID;
        if (!chainId) return { error: `Unsupported chain "${chain}".` };
        const resolved: Token[] = [];
        const errors: string[] = [];
        for (const q of tokens) {
          const r = await resolveOne(q, chainId);
          if (r.ok) resolved.push(r.token);
          else errors.push(r.error);
        }
        const bals = await getBalances(wallet, chainId, resolved);
        return {
          chain: chainName(chainId),
          balances: bals.map((b) => ({ symbol: b.token.symbol, address: b.token.address, balance: formatUnits(BigInt(b.raw), b.token.decimals) })),
          errors,
        };
      },
    }),

    quote_swap: tool({
      description:
        "Quote a same-chain swap on Robinhood Chain between any two tokens (crypto <-> crypto, crypto <-> stock token, stock <-> stock). For requests such as 'spend $10 of ETH', pass amountUSD: '10' and the input token as fromToken; do not ask the user to convert dollars to token units. The server uses the latest available token spot price and returns an error if no price is available. Renders a confirmation card the user signs in their wallet. Never claims the swap is done.",
      inputSchema: z.object({
        fromToken: z.string().describe("Symbol or address of the token to sell"),
        toToken: z.string().describe("Symbol or address of the token to buy"),
        amount: z.string().optional().describe("Human-readable amount of fromToken (e.g. '0.05'); provide this or amountUSD"),
        amountUSD: z.string().optional().describe("Approximate USD value of fromToken to spend (e.g. '1' for one dollar worth of ETH); provide this or amount"),
        side: z.enum(["sell", "buy"]).default("sell").describe("'sell' = amount is of fromToken; 'buy' = amount is of toToken"),
        slippageBps: z.number().int().min(1).max(500).optional().describe("Max slippage in basis points (50 = 0.5%)"),
      }).refine((input) => Boolean(input.amount) !== Boolean(input.amountUSD), {
        message: "Provide exactly one of amount or amountUSD.",
      }),
      execute: async ({ fromToken, toToken, amount, amountUSD, side, slippageBps }) => {
        if (!wallet) return needWallet;
        const chainId = ROBINHOOD_CHAIN_ID;
        const [a, b] = await Promise.all([resolveOne(fromToken, chainId), resolveOne(toToken, chainId)]);
        if (!a.ok) return a;
        if (!b.ok) return b;
        const tIn = a.token;
        const tOut = b.token;
        const exactIn = amountUSD !== undefined || side === "sell";
        let raw: string;
        if (amountUSD !== undefined) {
          const usd = Number(amountUSD);
          if (!Number.isFinite(usd) || usd <= 0) return { error: "Enter a positive USD amount." };
          const price = await getTokenPriceUSD(tIn);
          if (!price) return { error: `I can't get a current USD price for ${tIn.symbol}. Ask for an amount in ${tIn.symbol} instead.` };
          const tokenAmount = (usd / price).toFixed(Math.min(tIn.decimals, 18));
          const rawAmount = parseUnits(tokenAmount, tIn.decimals);
          if (rawAmount <= BigInt(0)) return { error: `That USD amount is too small to swap into ${tIn.symbol}.` };
          raw = rawAmount.toString();
        } else {
          raw = parseUnits(amount!, exactIn ? tIn.decimals : tOut.decimals).toString();
        }
        const inputAmount = amountUSD !== undefined ? formatUnits(BigInt(raw), tIn.decimals) : amount!;
        const warnings: string[] = [];
        if (amountUSD !== undefined) warnings.push("USD value is estimated from a spot price and may change before execution.");

        if (uniswapEnabled()) {
          const q = await uniswapQuote({
            swapper: wallet,
            tokenIn: tIn.address,
            tokenOut: tOut.address,
            amount: raw,
            type: exactIn ? "EXACT_INPUT" : "EXACT_OUTPUT",
            slippageBps,
          });
          if (q.routing !== "CLASSIC" && q.routing !== "WRAP" && q.routing !== "UNWRAP") {
            return { error: `Unsupported routing ${q.routing}.` };
          }
          const amountIn = BigInt(q.amountIn ?? raw);
          const w = await balanceWarning(wallet, tIn, amountIn);
          if (w) warnings.push(w);
          if ((q.priceImpact ?? 0) > 3) warnings.push(`High price impact: ${q.priceImpact}%.`);
          const plan: ExecutionPlan = {
            kind: "swap",
            provider: "Uniswap",
            chainId,
            toChainId: chainId,
            from: { ...view(tIn), amount: formatUnits(amountIn, tIn.decimals) },
            to: { ...view(tOut), amount: formatUnits(BigInt(q.amountOut ?? 0), tOut.decimals) },
            priceImpact: q.priceImpact,
            gasUSD: q.gasFeeUSD ? Number(q.gasFeeUSD) : undefined,
            approval: q.approval,
            permitData: q.permitData,
            uniswapQuote: q.rawQuote,
            warnings,
            requestedUSD: amountUSD !== undefined ? Number(amountUSD) : undefined,
          };
          return { plan };
        }

        // Fallback: LI.FI same-chain aggregation (exact-input only).
        if (!exactIn) return { error: "Exact-output swaps need UNISWAP_API_KEY. Ask the user for a sell amount instead." };
        const q = await lifiQuote({
          fromChain: chainId,
          toChain: chainId,
          fromToken: tIn.address,
          toToken: tOut.address,
          fromAmount: raw,
          fromAddress: wallet,
          slippageBps,
        });
        const w = await balanceWarning(wallet, tIn, BigInt(raw));
        if (w) warnings.push(w);
        const plan: ExecutionPlan = {
          kind: "swap",
          provider: `LI.FI · ${q.tool}`,
          chainId,
          toChainId: chainId,
          from: { ...view(tIn), amount: inputAmount },
          to: {
            ...view(tOut),
            amount: formatUnits(BigInt(q.amountOut), tOut.decimals),
            minAmount: formatUnits(BigInt(q.amountOutMin), tOut.decimals),
          },
          feesUSD: q.feesUSD,
          gasUSD: q.gasUSD,
          approval: q.approval,
          tx: q.tx,
          warnings,
          requestedUSD: amountUSD !== undefined ? Number(amountUSD) : undefined,
        };
        return { plan };
      },
      toModelOutput: ({ output }) => forModel(output),
    }),

    quote_bridge: tool({
      description:
        "Quote bridging assets between Robinhood Chain and another chain (Ethereum, Arbitrum, Base, Optimism, Polygon, BNB), optionally swapping into a different token on arrival. Renders a confirmation card the user signs.",
      inputSchema: z.object({
        fromChain: z.string().describe("Source chain name or id"),
        toChain: z.string().describe("Destination chain name or id"),
        fromToken: z.string().describe("Token on the source chain (symbol or address)"),
        toToken: z.string().optional().describe("Token to receive on the destination chain; defaults to same symbol"),
        amount: z.string().describe("Human-readable amount of fromToken"),
        recipient: z.string().optional().describe("Destination address if different from the connected wallet"),
        slippageBps: z.number().int().min(1).max(500).optional(),
      }),
      execute: async ({ fromChain, toChain, fromToken, toToken, amount, recipient, slippageBps }) => {
        if (!wallet) return needWallet;
        const src = resolveChainId(fromChain);
        const dst = resolveChainId(toChain);
        if (!src || !dst) return { error: `Unsupported chain. Supported: Robinhood Chain, Ethereum, Arbitrum, Base, Optimism, Polygon, BNB.` };
        if (src === dst) return { error: "Same chain — use quote_swap instead." };
        if (src !== ROBINHOOD_CHAIN_ID && dst !== ROBINHOOD_CHAIN_ID) {
          return { error: "This launch only supports bridges into or out of Robinhood Chain." };
        }
        const a = await resolveOne(fromToken, src);
        if (!a.ok) return a;
        const b = await resolveOne(toToken ?? a.token.symbol, dst);
        if (!b.ok) return b;
        const raw = parseUnits(amount, a.token.decimals);
        const warnings: string[] = [];
        if (recipient) warnings.push(`Funds will be sent to ${recipient}, not your connected wallet.`);
        const q = await lifiQuote({
          fromChain: src,
          toChain: dst,
          fromToken: a.token.address,
          toToken: b.token.address,
          fromAmount: raw.toString(),
          fromAddress: wallet,
          toAddress: recipient,
          slippageBps,
        });
        const w = await balanceWarning(wallet, a.token, raw);
        if (w) warnings.push(w);
        const plan: ExecutionPlan = {
          kind: "bridge",
          provider: `LI.FI · ${q.tool}`,
          chainId: src,
          toChainId: dst,
          from: { ...view(a.token), amount },
          to: {
            ...view(b.token),
            amount: formatUnits(BigInt(q.amountOut), b.token.decimals),
            minAmount: formatUnits(BigInt(q.amountOutMin), b.token.decimals),
          },
          feesUSD: q.feesUSD,
          gasUSD: q.gasUSD,
          durationSec: q.durationSec,
          approval: q.approval,
          tx: q.tx,
          warnings,
        };
        return { plan };
      },
      toModelOutput: ({ output }) => forModel(output),
    }),
  };
}

export { NATIVE };

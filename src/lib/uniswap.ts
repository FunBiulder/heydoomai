import { getAddress } from "viem";
import { ROBINHOOD_CHAIN_ID } from "./chains";

const API = "https://trade-api.gateway.uniswap.org/v1";
/** Universal Router 2.1.2 — 2.0/2.1.1 were sunset on Oct 21, 2026. */
export const UR_VERSION = "2.1.2";
/** Documented Universal Router 2.1.2 on Robinhood Chain. Every /swap tx is checked against it. */
export const UNIVERSAL_ROUTER: Record<number, `0x${string}`> = {
  [ROBINHOOD_CHAIN_ID]: "0x204FAca1764B154221e35c0d20aBb3c525710498",
};

export type TxRequest = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  chainId: number;
  gasLimit?: string;
};

export const uniswapEnabled = () => Boolean(process.env.UNISWAP_API_KEY);

async function call<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "x-api-key": process.env.UNISWAP_API_KEY ?? "",
      "x-universal-router-version": UR_VERSION,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as { detail?: string; errorCode?: string }).detail ?? (json as { errorCode?: string }).errorCode;
    throw new Error(`Uniswap ${path} ${res.status}: ${msg ?? "request failed"}`);
  }
  return json as T;
}

function toTx(raw: Record<string, unknown> | null | undefined): TxRequest | null {
  if (!raw) return null;
  return {
    to: getAddress(String(raw.to)) as `0x${string}`,
    data: (raw.data as `0x${string}`) ?? "0x",
    value: raw.value ? BigInt(String(raw.value)).toString() : "0",
    chainId: Number(raw.chainId ?? ROBINHOOD_CHAIN_ID),
    gasLimit: raw.gasLimit ? String(raw.gasLimit) : undefined,
  };
}

export async function uniswapQuote(p: {
  swapper: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  type: "EXACT_INPUT" | "EXACT_OUTPUT";
  slippageBps?: number;
  chainId?: number;
}) {
  const chainId = p.chainId ?? ROBINHOOD_CHAIN_ID;
  const NATIVE = "0x0000000000000000000000000000000000000000";

  const [approvalRes, quoteRes] = await Promise.all([
    p.tokenIn === NATIVE
      ? Promise.resolve({ approval: null })
      : call<{ approval: Record<string, unknown> | null }>("/check_approval", {
          walletAddress: p.swapper,
          token: p.tokenIn,
          amount: p.amount,
          chainId,
          tokenOut: p.tokenOut,
          tokenOutChainId: chainId,
        }),
    call<{
      routing: string;
      quote: Record<string, unknown>;
      permitData: Record<string, unknown> | null;
    }>("/quote", {
      swapper: p.swapper,
      tokenIn: p.tokenIn,
      tokenOut: p.tokenOut,
      tokenInChainId: chainId,
      tokenOutChainId: chainId,
      amount: p.amount,
      type: p.type,
      // AMM-only for now: UniswapX orders need a separate /order + polling flow.
      protocols: ["V2", "V3", "V4"],
      routingPreference: "BEST_PRICE",
      ...(p.slippageBps ? { slippageTolerance: p.slippageBps / 100 } : { autoSlippage: "DEFAULT" }),
    }),
  ]);

  const q = quoteRes.quote as {
    input?: { amount: string };
    output?: { amount: string };
    priceImpact?: number;
    gasFeeUSD?: string;
    slippage?: number;
  };

  return {
    routing: quoteRes.routing,
    amountIn: q.input?.amount,
    amountOut: q.output?.amount,
    priceImpact: q.priceImpact,
    gasFeeUSD: q.gasFeeUSD,
    slippage: q.slippage,
    approval: toTx(approvalRes.approval),
    permitData: quoteRes.permitData,
    rawQuote: quoteRes.quote,
  };
}

/** Build the swap tx after the user has (optionally) signed the Permit2 data. */
export async function uniswapBuildSwap(p: {
  quote: Record<string, unknown>;
  permitData?: Record<string, unknown> | null;
  signature?: string;
}): Promise<TxRequest> {
  const body: Record<string, unknown> = { quote: p.quote, simulateTransaction: true, refreshGasPrice: true };
  if (p.permitData && p.signature) {
    body.permitData = p.permitData;
    body.signature = p.signature;
  }
  const res = await call<{ swap: Record<string, unknown> }>("/swap", body);
  const tx = toTx(res.swap);
  if (!tx) throw new Error("Uniswap /swap returned no transaction");
  const router = UNIVERSAL_ROUTER[tx.chainId];
  if (router && tx.to.toLowerCase() !== router.toLowerCase()) {
    throw new Error(`Refusing swap: target ${tx.to} is not the documented Universal Router ${router}`);
  }
  return tx;
}

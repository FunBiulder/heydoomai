import { arbitrum, base, bsc, mainnet, optimism, polygon, robinhood } from "viem/chains";
import type { Chain } from "viem";

/** Robinhood Chain (Arbitrum Orbit L2, chain id 4663). Override the RPC via env. */
export const robinhoodChain: Chain = {
  ...robinhood,
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || "https://rpc.mainnet.chain.robinhood.com",
        ...robinhood.rpcUrls.default.http,
      ],
    },
  },
};

export const ROBINHOOD_CHAIN_ID = 4663;

/** Chains users can bridge FROM / TO Robinhood Chain. Robinhood Chain is the home chain. */
export const SUPPORTED_CHAINS = [robinhoodChain, mainnet, arbitrum, base, optimism, polygon, bsc] as const;

export const CHAIN_ALIASES: Record<string, number> = {
  robinhood: 4663,
  "robinhood chain": 4663,
  rh: 4663,
  ethereum: 1,
  eth: 1,
  mainnet: 1,
  arbitrum: 42161,
  arb: 42161,
  base: 8453,
  optimism: 10,
  op: 10,
  polygon: 137,
  matic: 137,
  bnb: 56,
  bsc: 56,
};

export function resolveChainId(input: string | number): number | null {
  if (typeof input === "number") return SUPPORTED_CHAINS.some((c) => c.id === input) ? input : null;
  const n = Number(input);
  if (Number.isInteger(n) && SUPPORTED_CHAINS.some((c) => c.id === n)) return n;
  return CHAIN_ALIASES[input.trim().toLowerCase()] ?? null;
}

export function chainName(id: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === id)?.name ?? `Chain ${id}`;
}

export function explorerTx(chainId: number, hash: string): string | undefined {
  const url = SUPPORTED_CHAINS.find((c) => c.id === chainId)?.blockExplorers?.default.url;
  return url ? `${url}/tx/${hash}` : undefined;
}

export const NATIVE = "0x0000000000000000000000000000000000000000" as const;

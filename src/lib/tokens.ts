import { createPublicClient, erc20Abi, getAddress, http, isAddress, type Address, type PublicClient } from "viem";
import { NATIVE, ROBINHOOD_CHAIN_ID, SUPPORTED_CHAINS } from "./chains";
import { DOOM_TOKEN } from "./site";

export type Token = {
  chainId: number;
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  priceUSD?: string;
  logoURI?: string;
  source: "native" | "lifi" | "blockscout" | "onchain";
};

const LIFI = "https://li.quest/v1";
const BLOCKSCOUT = "https://robinhoodchain.blockscout.com/api/v2";

type Reader = Pick<PublicClient, "readContract" | "getBalance">;
const clients = new Map<number, Reader>();
export function publicClient(chainId: number): Reader {
  const cached = clients.get(chainId);
  if (cached) return cached;
  const chain = SUPPORTED_CHAINS.find((x) => x.id === chainId);
  if (!chain) throw new Error(`Unsupported chain ${chainId}`);
  const c = createPublicClient({ transport: http(chain.rpcUrls.default.http[0]) }) as unknown as Reader;
  clients.set(chainId, c);
  return c;
}

export function lifiHeaders(): HeadersInit {
  const h: Record<string, string> = { accept: "application/json" };
  if (process.env.LIFI_API_KEY) h["x-lifi-api-key"] = process.env.LIFI_API_KEY;
  return h;
}

// ---- LI.FI token list cache (per chain, 10 min) ----
const listCache = new Map<number, { at: number; tokens: Token[] }>();
async function lifiTokens(chainId: number): Promise<Token[]> {
  const hit = listCache.get(chainId);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.tokens;
  try {
    const res = await fetch(`${LIFI}/tokens?chains=${chainId}`, { headers: lifiHeaders() });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as { tokens: Record<string, Array<Record<string, unknown>>> };
    const tokens: Token[] = (json.tokens[String(chainId)] ?? []).map((t) => ({
      chainId,
      address: getAddress(String(t.address)),
      symbol: String(t.symbol),
      name: String(t.name),
      decimals: Number(t.decimals),
      priceUSD: t.priceUSD ? String(t.priceUSD) : undefined,
      logoURI: t.logoURI ? String(t.logoURI) : undefined,
      source: "lifi",
    }));
    listCache.set(chainId, { at: Date.now(), tokens });
    return tokens;
  } catch {
    return hit?.tokens ?? [];
  }
}

/** Current USD spot price from LI.FI's token list, when available. */
export async function getTokenPriceUSD(token: Token): Promise<number | null> {
  const listed = (await lifiTokens(token.chainId)).find(
    (candidate) => candidate.address.toLowerCase() === token.address.toLowerCase(),
  );
  const price = Number(listed?.priceUSD ?? token.priceUSD);
  return Number.isFinite(price) && price > 0 ? price : null;
}

async function onchainToken(chainId: number, address: Address): Promise<Token | null> {
  try {
    const c = publicClient(chainId);
    const [symbol, name, decimals] = await Promise.all([
      c.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      c.readContract({ address, abi: erc20Abi, functionName: "name" }),
      c.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
    ]);
    return { chainId, address, symbol, name, decimals, source: "onchain" };
  } catch {
    return null;
  }
}

async function blockscoutSearch(query: string): Promise<Token[]> {
  try {
    const res = await fetch(`${BLOCKSCOUT}/search?q=${encodeURIComponent(query)}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: Array<Record<string, unknown>> };
    const out: Token[] = [];
    for (const it of json.items ?? []) {
      if (it.type !== "token") continue;
      const addr = String(it.address_hash ?? it.address ?? "");
      if (!isAddress(addr)) continue;
      // Always read decimals on-chain — never trust a search index for amounts.
      const t = await onchainToken(ROBINHOOD_CHAIN_ID, getAddress(addr));
      if (t) out.push({ ...t, source: "blockscout" });
      if (out.length >= 5) break;
    }
    return out;
  } catch {
    return [];
  }
}

function nativeToken(chainId: number): Token {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  return {
    chainId,
    address: NATIVE,
    symbol: chain?.nativeCurrency.symbol ?? "ETH",
    name: chain?.nativeCurrency.name ?? "Ether",
    decimals: chain?.nativeCurrency.decimals ?? 18,
    source: "native",
  };
}

/**
 * Resolve a symbol, name or address to tokens on a chain. Returns ranked candidates;
 * the agent must ask the user to disambiguate when there is more than one plausible match.
 */
const DOOM_ALIASES = new Set(["doom", "$doom", "heydoomai", "hey doom ai", "doom token", "doom ai token"]);
const isDoomImpostor = (t: Token) =>
  t.chainId === DOOM_TOKEN.chainId &&
  t.symbol.replace(/^\$/, "").toLowerCase() === "doom" &&
  t.address.toLowerCase() !== DOOM_TOKEN.address.toLowerCase();

export async function findTokens(query: string, chainId = ROBINHOOD_CHAIN_ID): Promise<Token[]> {
  const q = query.trim();

  // $DOOM is pinned to the official contract — look-alikes are never offered.
  if (chainId === DOOM_TOKEN.chainId && DOOM_ALIASES.has(q.toLowerCase())) {
    const official = await onchainToken(chainId, getAddress(DOOM_TOKEN.address));
    return official ? [official] : [];
  }
  const native = nativeToken(chainId);
  if (q.toLowerCase() === native.symbol.toLowerCase() || q.toLowerCase() === NATIVE.toLowerCase()) {
    const listed = (await lifiTokens(chainId)).find((t) => t.address.toLowerCase() === NATIVE.toLowerCase());
    return [{ ...native, priceUSD: listed?.priceUSD }];
  }

  if (isAddress(q)) {
    const addr = getAddress(q);
    const listed = (await lifiTokens(chainId)).find((t) => t.address === addr);
    if (listed) return [listed];
    const t = await onchainToken(chainId, addr);
    return t ? [t] : [];
  }

  const list = await lifiTokens(chainId);
  const lower = q.toLowerCase();
  const exact = list.filter((t) => t.symbol.toLowerCase() === lower);
  const partial = list.filter(
    (t) =>
      !exact.includes(t) &&
      (t.symbol.toLowerCase().includes(lower) || t.name.toLowerCase().includes(lower)),
  );
  let results = [...exact, ...partial];

  // Robinhood Chain has 450+ stock tokens; fall back to the explorer index for anything not listed.
  if (exact.length === 0 && chainId === ROBINHOOD_CHAIN_ID) {
    const extra = await blockscoutSearch(q);
    results = [...extra.filter((e) => !results.some((r) => r.address === e.address)), ...results];
  }
  return results.filter((r) => !isDoomImpostor(r)).slice(0, 8);
}

export async function getBalances(owner: Address, chainId: number, tokens: Token[]) {
  const c = publicClient(chainId);
  return Promise.all(
    tokens.map(async (t) => {
      const raw =
        t.address === NATIVE
          ? await c.getBalance({ address: owner })
          : await c.readContract({ address: t.address, abi: erc20Abi, functionName: "balanceOf", args: [owner] });
      return { token: t, raw: raw.toString() };
    }),
  );
}

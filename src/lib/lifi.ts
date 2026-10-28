import { encodeFunctionData, erc20Abi, getAddress, type Address } from "viem";
import { NATIVE } from "./chains";
import { lifiHeaders, publicClient } from "./tokens";
import type { TxRequest } from "./uniswap";

const LIFI = "https://li.quest/v1";

export type LifiQuote = {
  tool: string;
  fromChainId: number;
  toChainId: number;
  amountIn: string;
  amountOut: string;
  amountOutMin: string;
  durationSec?: number;
  feesUSD: number;
  gasUSD: number;
  approval: TxRequest | null;
  tx: TxRequest;
};

/** Cross-chain bridge (or same-chain swap) quote from LI.FI, which routes Across, Relay, Stargate etc. */
export async function lifiQuote(p: {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress?: string;
  slippageBps?: number;
}): Promise<LifiQuote> {
  const qs = new URLSearchParams({
    fromChain: String(p.fromChain),
    toChain: String(p.toChain),
    fromToken: p.fromToken,
    toToken: p.toToken,
    fromAmount: p.fromAmount,
    fromAddress: p.fromAddress,
    toAddress: p.toAddress ?? p.fromAddress,
    slippage: String((p.slippageBps ?? 50) / 10_000),
    integrator: process.env.LIFI_INTEGRATOR || "robin-agent",
    order: "CHEAPEST",
  });
  const res = await fetch(`${LIFI}/quote?${qs}`, { headers: lifiHeaders() });
  const json = (await res.json()) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!res.ok) throw new Error(`LI.FI quote ${res.status}: ${json.message ?? "no route found"}`);

  const est = json.estimate ?? {};
  const txr = json.transactionRequest ?? {};
  const sum = (arr: Array<{ amountUSD?: string }> = []) => arr.reduce((s, c) => s + Number(c.amountUSD ?? 0), 0);

  const tx: TxRequest = {
    to: getAddress(txr.to) as `0x${string}`,
    data: txr.data,
    value: txr.value ? BigInt(txr.value).toString() : "0",
    chainId: Number(txr.chainId ?? p.fromChain),
    gasLimit: txr.gasLimit ? BigInt(txr.gasLimit).toString() : undefined,
  };

  let approval: TxRequest | null = null;
  if (p.fromToken !== NATIVE && est.approvalAddress) {
    const spender = getAddress(est.approvalAddress);
    const allowance = await publicClient(p.fromChain).readContract({
      address: p.fromToken as Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [p.fromAddress as Address, spender],
    });
    if (allowance < BigInt(p.fromAmount)) {
      approval = {
        to: getAddress(p.fromToken) as `0x${string}`,
        // Exact-amount approval, never unlimited.
        data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender, BigInt(p.fromAmount)] }),
        value: "0",
        chainId: p.fromChain,
      };
    }
  }

  return {
    tool: json.toolDetails?.name ?? json.tool,
    fromChainId: p.fromChain,
    toChainId: p.toChain,
    amountIn: est.fromAmount ?? p.fromAmount,
    amountOut: est.toAmount,
    amountOutMin: est.toAmountMin,
    durationSec: est.executionDuration,
    feesUSD: sum(est.feeCosts),
    gasUSD: sum(est.gasCosts),
    approval,
    tx,
  };
}

export async function lifiStatus(txHash: string, fromChain: number, toChain: number) {
  const qs = new URLSearchParams({ txHash, fromChain: String(fromChain), toChain: String(toChain) });
  const res = await fetch(`${LIFI}/status?${qs}`, { headers: lifiHeaders() });
  const json = (await res.json()) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    status: json.status as string | undefined, // NOT_FOUND | PENDING | DONE | FAILED
    substatus: json.substatus as string | undefined,
    receivingTx: json.receiving?.txHash as string | undefined,
  };
}

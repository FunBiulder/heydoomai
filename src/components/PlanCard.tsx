"use client";

import { useState } from "react";
import { useConfig, useConnection } from "wagmi";
import { sendTransaction, signTypedData, switchChain, waitForTransactionReceipt } from "wagmi/actions";
import type { ExecutionPlan } from "@/lib/agent-tools";
import type { TxRequest } from "@/lib/uniswap";
import { chainName, explorerTx } from "@/lib/chains";

type Step = "idle" | "approving" | "signing" | "building" | "sending" | "confirming" | "bridging" | "done" | "error";

const fmt = (s: string | undefined, max = 6) => {
  if (!s) return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return n.toLocaleString(undefined, { maximumFractionDigits: n >= 1 ? 4 : max });
};

export function PlanCard({ plan, onRequote }: { plan: ExecutionPlan; onRequote: () => void }) {
  const config = useConfig();
  const { chainId: walletChain, address } = useConnection();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string>();
  const [hashes, setHashes] = useState<{ label: string; chainId: number; hash: string }[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState<string>();

  const busy = !["idle", "done", "error"].includes(step);

  async function send(tx: TxRequest, label: string) {
    const hash = await sendTransaction(config, {
      chainId: tx.chainId as never,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value || "0"),
      gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
    });
    setHashes((h) => [...h, { label, chainId: tx.chainId, hash }]);
    setStep("confirming");
    const r = await waitForTransactionReceipt(config, { chainId: tx.chainId as never, hash });
    if (r.status !== "success") throw new Error(`${label} transaction reverted`);
    return hash;
  }

  async function pollBridge(hash: string) {
    setStep("bridging");
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch(`/api/bridge-status?txHash=${hash}&fromChain=${plan.chainId}&toChain=${plan.toChainId}`);
      const s = (await res.json()) as { status?: string; substatus?: string; receivingTx?: string };
      setBridgeStatus(s.substatus ?? s.status);
      if (s.status === "DONE") {
        if (s.receivingTx) setHashes((h) => [...h, { label: "Received", chainId: plan.toChainId, hash: s.receivingTx! }]);
        return;
      }
      if (s.status === "FAILED") throw new Error(`Bridge failed (${s.substatus ?? "unknown"})`);
    }
    setBridgeStatus("Still in flight — check the explorer link later.");
  }

  async function execute() {
    setError(undefined);
    try {
      if (!address) throw new Error("Connect your wallet first");
      if (walletChain !== plan.chainId) await switchChain(config, { chainId: plan.chainId as never });

      if (plan.approval) {
        setStep("approving");
        await send(plan.approval, "Approve");
      }

      let tx = plan.tx;
      if (!tx && plan.uniswapQuote) {
        let signature: string | undefined;
        if (plan.permitData) {
          setStep("signing");
          const pd = plan.permitData as {
            domain: Record<string, unknown>;
            types: Record<string, Array<{ name: string; type: string }>>;
            values: Record<string, unknown>;
          };
          const primaryType = Object.keys(pd.types).find((k) => k !== "EIP712Domain")!;
          signature = await signTypedData(config, {
            domain: pd.domain as never,
            types: pd.types,
            primaryType,
            message: pd.values,
          });
        }
        setStep("building");
        const res = await fetch("/api/swap", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ quote: plan.uniswapQuote, permitData: plan.permitData, signature }),
        });
        const json = (await res.json()) as { tx?: TxRequest; error?: string };
        if (!json.tx) throw new Error(json.error ?? "Could not build swap — the quote may have expired");
        tx = json.tx;
      }
      if (!tx) throw new Error("No transaction to send");

      setStep("sending");
      const hash = await send(tx, plan.kind === "bridge" ? "Bridge" : "Swap");
      if (plan.kind === "bridge") await pollBridge(hash);
      setStep("done");
    } catch (e) {
      const msg = (e as { shortMessage?: string }).shortMessage ?? (e as Error).message;
      setError(msg);
      setStep("error");
    }
  }

  const label: Record<Step, string> = {
    idle: plan.approval ? `Approve & ${plan.kind}` : plan.kind === "bridge" ? "Bridge" : "Swap",
    approving: "Approve in wallet…",
    signing: "Sign permit in wallet…",
    building: "Building transaction…",
    sending: "Confirm in wallet…",
    confirming: "Waiting for confirmation…",
    bridging: "Bridging…",
    done: "Done",
    error: "Try again",
  };

  return (
    <div className="card">
      <div className="card-head">
        <span className={`tag ${plan.kind}`}>{plan.kind}</span>
        <span className="muted">{plan.provider}</span>
      </div>

      <div className="legs">
        <div className="leg">
          <div className="muted small">You pay · {chainName(plan.chainId)}</div>
          <div className="amount">
            {fmt(plan.from.amount)} <b>{plan.from.symbol}</b>
          </div>
          <div className="muted small mono">{plan.from.name}</div>
        </div>
        <div className="arrow">→</div>
        <div className="leg">
          <div className="muted small">You get · {chainName(plan.toChainId)}</div>
          <div className="amount accent">
            ≈ {fmt(plan.to.amount)} <b>{plan.to.symbol}</b>
          </div>
          <div className="muted small mono">{plan.to.name}</div>
        </div>
      </div>

      <dl className="facts">
        {plan.to.minAmount && (
          <>
            <dt>Min received</dt>
            <dd>
              {fmt(plan.to.minAmount)} {plan.to.symbol}
            </dd>
          </>
        )}
        {plan.priceImpact !== undefined && (
          <>
            <dt>Price impact</dt>
            <dd>{plan.priceImpact.toFixed(2)}%</dd>
          </>
        )}
        {!!plan.feesUSD && (
          <>
            <dt>Fees</dt>
            <dd>${plan.feesUSD.toFixed(2)}</dd>
          </>
        )}
        {plan.gasUSD !== undefined && (
          <>
            <dt>Gas</dt>
            <dd>${plan.gasUSD.toFixed(3)}</dd>
          </>
        )}
        {plan.durationSec !== undefined && (
          <>
            <dt>ETA</dt>
            <dd>~{Math.max(1, Math.round(plan.durationSec / 60))} min</dd>
          </>
        )}
        <dt>Steps</dt>
        <dd>
          {[plan.approval && "approve", plan.permitData && "sign permit", plan.kind].filter(Boolean).join(" → ")}
        </dd>
      </dl>

      {plan.warnings.map((w) => (
        <div key={w} className="warn">
          {w}
        </div>
      ))}

      <div className="actions">
        <button className="btn-primary" disabled={busy || step === "done"} onClick={execute}>
          {label[step]}
        </button>
        {(step === "idle" || step === "error") && (
          <button className="btn-ghost" onClick={onRequote}>
            Refresh quote
          </button>
        )}
      </div>

      {bridgeStatus && step === "bridging" && <div className="muted small">Status: {bridgeStatus}</div>}
      {error && <div className="err">{error}</div>}
      {hashes.length > 0 && (
        <ul className="hashes">
          {hashes.map((h) => (
            <li key={h.hash}>
              {h.label}:{" "}
              <a href={explorerTx(h.chainId, h.hash)} target="_blank" rel="noreferrer" className="mono">
                {h.hash.slice(0, 10)}…
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getToolName, isToolUIPart, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useConnection } from "wagmi";
import type { ExecutionPlan, TokenView } from "@/lib/agent-tools";
import { PlanCard } from "./PlanCard";

const EXAMPLES = [
  "Swap 0.05 ETH for NVDA",
  "Buy $200 of SPY with USDG",
  "Swap 0.01 ETH for $DOOM",
  "Sell all my TSLA for ETH",
  "Bridge 0.1 ETH from Base to Robinhood",
  "Bridge 50 USDC from Arbitrum and swap it into AAPL",
];

const TOOL_LABEL: Record<string, string> = {
  find_token: "Looking up token",
  get_balances: "Checking balances",
  quote_swap: "Getting swap quote",
  quote_bridge: "Finding bridge route",
};

type ToolOut = { plan?: ExecutionPlan; error?: string; candidates?: TokenView[] };

export function Chat() {
  const { address, chainId } = useConnection();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text }, { body: { wallet: address, chainId } });
    setInput("");
  };

  return (
    <div className="chat">
      <div className="thread">
        {messages.length === 0 && (
          <div className="empty">
            <h1>Trade by typing.</h1>
            <p className="muted">
              Swap crypto and tokenized stocks on Robinhood Chain, or bridge in and out — just say what you want. You
              review and sign every transaction in your own wallet.
            </p>
            <div className="examples">
              {EXAMPLES.map((e) => (
                <button key={e} className="chip" onClick={() => send(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m: UIMessage) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.parts.map((part, i) => {
              const key = `${m.id}-${i}`;
              if (part.type === "text") return <div key={key} className="text">{part.text}</div>;
              if (!isToolUIPart(part)) return null;
              const name = getToolName(part);

              if (part.state === "output-available") {
                const out = part.output as ToolOut;
                if (out?.plan)
                  return (
                    <PlanCard key={key} plan={out.plan} onRequote={() => send("Refresh that quote with current prices.")} />
                  );
                if (out?.candidates?.length)
                  return (
                    <div key={key} className="candidates">
                      {out.candidates.map((c) => (
                        <button key={c.address} className="chip" onClick={() => send(`Use ${c.symbol} at ${c.address}`)}>
                          <b>{c.symbol}</b> {c.name} <span className="mono muted">{c.address.slice(0, 8)}…</span>
                        </button>
                      ))}
                    </div>
                  );
                return null;
              }
              if (part.state === "output-error") return <div key={key} className="err small">{part.errorText}</div>;
              return (
                <div key={key} className="tool-pending">
                  <span className="spinner" /> {TOOL_LABEL[name] ?? name}…
                </div>
              );
            })}
          </div>
        ))}
        {status === "submitted" && (
          <div className="tool-pending">
            <span className="spinner" /> Thinking…
          </div>
        )}
        {error && <div className="err">Something went wrong: {error.message}</div>}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={address ? "e.g. swap 100 USDG for AAPL" : "Connect a wallet, then tell me what to trade"}
          autoFocus
        />
        <button className="btn-primary" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

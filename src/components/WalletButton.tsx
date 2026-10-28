"use client";

import { useState } from "react";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { chainName, ROBINHOOD_CHAIN_ID } from "@/lib/chains";

export function WalletButton() {
  const [showWallets, setShowWallets] = useState(false);
  const { address, chainId, isConnected } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();

  if (!isConnected) {
    return (
      <>
        <button
          className="btn-primary"
          onClick={() => {
            connect.reset();
            setShowWallets(true);
          }}
        >
          Connect wallet
        </button>

        {showWallets && (
          <div className="wallet-overlay" onMouseDown={() => !connect.isPending && setShowWallets(false)}>
            <section
              aria-labelledby="wallet-dialog-title"
              aria-modal="true"
              className="wallet-dialog"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="wallet-dialog-head">
                <div>
                  <h2 id="wallet-dialog-title">Connect a wallet</h2>
                  <p className="muted small">Choose a browser wallet to connect to Robinhood Chain.</p>
                </div>
                <button
                  aria-label="Close wallet dialog"
                  className="wallet-close"
                  disabled={connect.isPending}
                  onClick={() => setShowWallets(false)}
                >
                  ×
                </button>
              </div>

              <div className="wallet-options">
                {connectors.map((connector) => (
                  <button
                    className="wallet-option"
                    disabled={connect.isPending}
                    key={connector.uid}
                    onClick={() => connect.mutate({ connector }, { onSuccess: () => setShowWallets(false) })}
                  >
                    <span aria-hidden="true" className="wallet-icon">W</span>
                    <span className="wallet-option-copy">
                      <b>{connect.isPending ? "Connecting…" : connector.name}</b>
                      <span className="muted small">Browser extension or injected wallet</span>
                    </span>
                    <span aria-hidden="true" className="wallet-option-arrow">→</span>
                  </button>
                ))}
              </div>

              {!connectors.length && (
                <p className="wallet-help">No browser wallet connector is available in this browser.</p>
              )}
              {connect.error && <p className="err wallet-error">{connect.error.message}</p>}
              <p className="wallet-help">Your wallet stays in your control. Doom AI never receives your keys.</p>
            </section>
          </div>
        )}
      </>
    );
  }

  const wrongChain = chainId !== ROBINHOOD_CHAIN_ID;
  return (
    <div className="wallet-connected">
      {wrongChain ? (
        <button
          className="chip chip-warn"
          disabled={switchChain.isPending}
          onClick={() => switchChain.mutate({ chainId: ROBINHOOD_CHAIN_ID })}
        >
          {switchChain.isPending ? "Switching…" : `${chainName(chainId ?? 0)} · switch to Robinhood`}
        </button>
      ) : (
        <span className="chip">
          <span className="dot" /> Robinhood Chain
        </span>
      )}
      <button
        className="chip mono"
        disabled={disconnect.isPending}
        title="Disconnect wallet"
        onClick={() => disconnect.mutate()}
      >
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </button>
      {switchChain.error && <span className="err small">{switchChain.error.message}</span>}
    </div>
  );
}

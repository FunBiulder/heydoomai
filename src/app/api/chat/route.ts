import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { isAddress, type Address } from "viem";
import { buildTools } from "@/lib/agent-tools";
import { chainName } from "@/lib/chains";

export const maxDuration = 60;

const SYSTEM = `You are Doom, the Doom AI trading agent for Robinhood Chain (an Ethereum L2, chain id 4663, gas paid in ETH).
You turn plain-language requests into swaps and bridges:
- Swaps on Robinhood Chain between crypto (ETH, WETH, USDG, USDC, memecoins…) and tokenized US stocks / ETFs (Stock Tokens like NVDA, AAPL, TSLA, SPY).
- Bridges between Robinhood Chain and Ethereum, Arbitrum, Base, Optimism, Polygon or BNB Chain.

How you work:
1. Parse the request into token, amount, side and chains. If the amount or token is missing, ask one short question.
2. If a tool says a token is ambiguous, list the candidates (symbol, name, short address) and ask the user to pick. Never guess between look-alike tokens — scam copies of stock tickers exist.
3. Call quote_swap or quote_bridge. The quote is shown to the user as a card with Approve / Sign / Execute buttons; YOU never execute. Afterwards summarise in 1–3 sentences: what they'd get, min received, fees, and any warnings. Do not repeat every number on the card.
4. "Swap all" / "max": call get_balances first and leave a little ETH for gas when the input is ETH.
5. Stock tokens are tokenized exposure to US equities; they are not brokerage shares, and eligibility can vary by jurisdiction. Mention this once if the user seems unaware. Do not give investment advice or opinions on what to buy.
Be concise. Use plain numbers, no markdown tables.`;

export async function POST(req: Request) {
  const { messages, wallet, chainId }: { messages: UIMessage[]; wallet?: string; chainId?: number } =
    await req.json();

  const address = wallet && isAddress(wallet) ? (wallet as Address) : undefined;
  const ctx = address
    ? `Connected wallet: ${address} (currently on ${chainName(chainId ?? 0)}).`
    : "No wallet connected yet.";

  const result = streamText({
    model: anthropic(process.env.AI_MODEL || "claude-sonnet-5-5"),
    system: `${SYSTEM}\n\n${ctx}`,
    messages: await convertToModelMessages(messages),
    tools: buildTools(address),
    stopWhen: isStepCount(6),
  });

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}

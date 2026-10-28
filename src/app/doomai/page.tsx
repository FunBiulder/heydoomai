import type { Metadata } from "next";
import { Chat } from "@/components/Chat";
import { WalletButton } from "@/components/WalletButton";
import { Window } from "@/components/Window";

export const metadata: Metadata = {
  title: "DoomAI",
  description: "Swap and bridge on Robinhood Chain by typing what you want.",
};

export default function DoomAIPage() {
  return (
    <main className="app-page">
      <Window title="DoomAI" right={<WalletButton />} className="app-win">
        <Chat />
      </Window>
      <p className="foot">
        Non-custodial: DoomAI only prepares transactions; you sign them. Stock Tokens are not brokerage shares and may be
        unavailable in your jurisdiction. Not investment advice.
      </p>
    </main>
  );
}

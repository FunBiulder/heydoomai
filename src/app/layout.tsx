import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import { DeviceShell } from "@/components/DeviceShell";
import { DitherDefs } from "@/components/desk/Objects";
import "./globals.css";

const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "Doom AI",
  description: "Doom AI — swap and bridge crypto and tokenized stocks on Robinhood Chain from a single prompt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${pixel.variable}`}>
      <body>
        <DitherDefs />
        <Providers>
          <DeviceShell>{children}</DeviceShell>
        </Providers>
      </body>
    </html>
  );
}

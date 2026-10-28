/** 1-bit line icons for the status bar and the toolbar. All 32×24, black ink on paper. */
import type { ReactNode } from "react";
type P = { size?: number };

const svg = (size: number, children: ReactNode, vb = "0 0 32 24") => (
  <svg aria-hidden="true" width={size} height={(size * 24) / 32} viewBox={vb} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    {children}
  </svg>
);

export const HelpIcon = ({ size = 20 }: P) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8.5" fill="#fff" stroke="currentColor" strokeWidth="2" />
    <text x="10" y="14.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="var(--font-pixel), monospace">?</text>
  </svg>
);

export const PlugIcon = ({ size = 34 }: P) =>
  svg(size, <>
    <path d="M1 12h9" />
    <path d="M10 6h7a6 6 0 0 1 0 12h-7z" fill="currentColor" />
    <path d="M23 9h7M23 15h7" />
    <path d="M13 12h3" stroke="#fff" />
  </>);

export const PointIcon = ({ size = 26 }: P) =>
  svg(size, <>
    <path d="M3 9h12l-3-4M3 15h12" />
    <path d="M15 7h12a2 2 0 0 1 0 4h-4M23 11h2a2 2 0 0 1 0 4h-3M22 15h1a2 2 0 0 1 0 4H12a3 3 0 0 1-3-3V9" />
  </>);

export const DeskIcon = ({ size = 34 }: P) =>
  svg(size, <>
    <path d="M6 7h20l4 5H2z" fill="#fff" />
    <path d="M4 12v10M28 12v10M8 12v6h16v-6" />
  </>);

export const KeyboardIcon = ({ size = 34 }: P) =>
  svg(size, <>
    <rect x="2" y="5" width="28" height="15" rx="2" fill="#fff" />
    <path d="M6 9h2M11 9h2M16 9h2M21 9h2M26 9h0M6 13h2M11 13h2M16 13h2M21 13h4M9 17h14" />
  </>);

export const CardFileIcon = ({ size = 34 }: P) =>
  svg(size, <>
    <path d="M5 14 9 4h14l-4 10M9 14l3-7h12l-3 7" fill="#fff" />
    <path d="M3 14h26l-2 8H5z" fill="#fff" />
    <path d="M12 18h8" />
  </>);

export const CoinIcon = ({ size = 34 }: P) =>
  svg(size, <>
    <ellipse cx="16" cy="17" rx="11" ry="4" fill="#fff" />
    <path d="M5 13v4M27 13v4" />
    <ellipse cx="16" cy="13" rx="11" ry="4" fill="#fff" />
    <ellipse cx="16" cy="9" rx="11" ry="4" fill="#fff" />
    <path d="M5 5v4M27 5v4" />
    <ellipse cx="16" cy="5" rx="11" ry="3.5" fill="#fff" />
  </>);

export const LedgerIcon = ({ size = 34 }: P) =>
  svg(size, <>
    <path d="M7 3h18v18H7z" fill="#fff" />
    <path d="M11 3v18M14 8h8M14 12h8M14 16h5" />
  </>);

export const XIcon = ({ size = 20 }: P) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

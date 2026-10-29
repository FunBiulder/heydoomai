/**
 * Line-art desk objects. 1-bit: black ink, white paper, dither patterns from <DitherDefs/>.
 * Each draws its own solid drop shadow (offset +4,+4) like the windows.
 */
import { DoomMark } from "../Logo";

const ink = { stroke: "#000", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Pattern defs shared by every desk SVG on the page (referenced by id, so render once). */
export function DitherDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <pattern id="d50" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#fff" />
          <rect width="2" height="2" fill="#000" />
          <rect x="2" y="2" width="2" height="2" fill="#000" />
        </pattern>
        <pattern id="d25" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#fff" />
          <rect width="2" height="2" fill="#000" />
          <rect x="3" y="3" width="2" height="2" fill="#000" />
        </pattern>
        <pattern id="d12" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#fff" />
          <rect width="2" height="2" fill="#000" />
          <rect x="4" y="4" width="2" height="2" fill="#000" />
        </pattern>
        <pattern id="d75" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#000" />
          <rect width="2" height="2" fill="#fff" />
        </pattern>
      </defs>
    </svg>
  );
}

/** Wall, filing cabinet, desk top, desk front and drawers — the static backdrop (viewBox 1600×860). */
export function DeskBackdrop() {
  return (
    <svg viewBox="0 0 1600 860" className="desk-bg" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1600" height="470" fill="url(#d12)" />
      <rect width="1600" height="56" fill="url(#d25)" />
      <rect y="0" width="1600" height="470" fill="none" />

      {/* filing cabinet */}
      <rect x="1344" y="184" width="200" height="290" fill="#000" />
      <rect x="1336" y="176" width="200" height="290" fill="#fff" {...ink} strokeWidth="5" />
      <rect x="1356" y="198" width="160" height="116" fill="url(#d12)" {...ink} strokeWidth="3" />
      <rect x="1356" y="330" width="160" height="116" fill="url(#d12)" {...ink} strokeWidth="3" />
      <rect x="1406" y="246" width="60" height="12" rx="3" fill="#fff" {...ink} strokeWidth="3" />
      <rect x="1406" y="378" width="60" height="12" rx="3" fill="#fff" {...ink} strokeWidth="3" />

      {/* desk top */}
      <polygon points="160,446 1440,446 1590,650 10,650" fill="url(#d50)" {...ink} strokeWidth="5" />
      {/* desk front edge */}
      <rect x="10" y="650" width="1580" height="38" fill="#fff" {...ink} strokeWidth="5" />
      {/* under-desk floor */}
      <rect y="688" width="1600" height="172" fill="url(#d25)" />
      {/* drawers */}
      <rect x="48" y="708" width="726" height="92" fill="#000" />
      <rect x="40" y="700" width="726" height="92" fill="#fff" {...ink} strokeWidth="5" />
      <rect x="834" y="708" width="726" height="92" fill="#000" />
      <rect x="826" y="700" width="726" height="92" fill="#fff" {...ink} strokeWidth="5" />
      <rect x="333" y="738" width="140" height="14" rx="7" fill="#fff" {...ink} strokeWidth="4" />
      <rect x="1119" y="738" width="140" height="14" rx="7" fill="#fff" {...ink} strokeWidth="4" />
      {/* drawer icons */}
      <g transform="translate(70 722)" {...ink} strokeWidth="3" fill="#fff">
        <path d="M0 14h44l-8-8M44 30H0l8 8" fill="none" />
      </g>
      <g transform="translate(1466 720)" {...ink} strokeWidth="3" fill="#fff">
        <path d="M0 34Q30 0 60 34" fill="none" />
        <path d="M-4 34h68M12 22v12M30 16v18M48 22v12" fill="none" />
      </g>
    </svg>
  );
}

export function Tray({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 134 124" className="obj-svg" aria-hidden="true">
      <rect x="34" y="6" width="70" height="56" fill="#fff" {...ink} strokeWidth="3" />
      <rect x="43" y="14" width="16" height="13" fill="url(#d50)" {...ink} strokeWidth="2" />
      <path d="M66 18h28M66 26h22M43 38h48" {...ink} strokeWidth="2.5" />
      <rect x="14" y="56" width="114" height="64" rx="6" fill="#000" />
      <rect x="10" y="52" width="114" height="64" rx="6" fill="#fff" {...ink} strokeWidth="4" />
      <rect x="22" y="66" width="90" height="36" rx="4" fill="#fff" {...ink} strokeWidth="2" />
      <text x="67" y="91" textAnchor="middle" className="obj-text" fontSize="17">{label}</text>
    </svg>
  );
}

export function NetworkFrame() {
  const nodes = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 170 132" className="obj-svg" aria-hidden="true">
      <rect x="10" y="10" width="156" height="118" fill="#000" />
      <rect x="6" y="6" width="156" height="118" fill="#fff" {...ink} strokeWidth="5" />
      <rect x="18" y="18" width="132" height="94" fill="url(#d12)" {...ink} strokeWidth="2" />
      {nodes.map((a) => {
        const r = (a * Math.PI) / 180;
        const x = 84 + Math.cos(r) * 38;
        const y = 62 + Math.sin(r) * 30;
        return (
          <g key={a}>
            <line x1="84" y1="62" x2={x} y2={y} {...ink} strokeWidth="2" />
            <circle cx={x} cy={y} r="6" fill="#fff" {...ink} strokeWidth="2.5" />
          </g>
        );
      })}
      <circle cx="84" cy="62" r="11" fill="#000" />
      <circle cx="84" cy="62" r="4" fill="#fff" />
    </svg>
  );
}

export function CardFile() {
  const cards = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 260 190" className="obj-svg" aria-hidden="true">
      <polygon points="38,126 230,126 250,182 22,182" fill="#000" transform="translate(4 4)" />
      {cards.map((i) => {
        const x = 52 + i * 16;
        const y = 30 + i * 12;
        return (
          <g key={i} transform={`rotate(-10 ${x + 70} ${y + 50})`}>
            <rect x={x} y={y} width="140" height="86" fill="#fff" {...ink} strokeWidth="3" />
            <rect x={x + 18 + i * 14} y={y - 12} width="30" height="13" fill={i % 2 ? "url(#d50)" : "#fff"} {...ink} strokeWidth="2.5" />
            {i === cards.length - 1 && <path d={`M${x + 14} ${y + 26}h80M${x + 14} ${y + 42}h104M${x + 14} ${y + 58}h64`} {...ink} strokeWidth="3" />}
          </g>
        );
      })}
      <polygon points="38,126 230,126 250,182 22,182" fill="#fff" {...ink} strokeWidth="4" />
      <polygon points="30,150 242,150 250,182 22,182" fill="url(#d50)" {...ink} strokeWidth="3" />
      <rect x="112" y="132" width="48" height="10" rx="4" fill="#fff" {...ink} strokeWidth="2.5" />
    </svg>
  );
}

export function Terminal() {
  return (
    <svg viewBox="0 0 320 300" className="obj-svg" aria-hidden="true">
      {/* monitor */}
      <rect x="54" y="14" width="220" height="176" rx="16" fill="#000" />
      <rect x="48" y="8" width="220" height="176" rx="16" fill="#fff" {...ink} strokeWidth="5" />
      <rect x="68" y="26" width="180" height="122" rx="8" fill="#000" />
      <text x="82" y="54" className="obj-screen" fontSize="15">{"> swap 1 ETH"}</text>
      <text x="82" y="76" className="obj-screen" fontSize="15">{"  for NVDA"}</text>
      <text x="82" y="102" className="obj-screen" fontSize="15">{"✓ route found"}</text>
      <text x="82" y="128" className="obj-screen" fontSize="15">{">"}</text>
      <rect x="98" y="116" width="10" height="15" fill="#fff" className="blink" />
      <path d="M88 166h140" {...ink} strokeWidth="3" />
      <circle cx="240" cy="166" r="4" fill="#000" />
      {/* stand */}
      <polygon points="128,184 188,184 198,212 118,212" fill="url(#d50)" {...ink} strokeWidth="4" />
      {/* keyboard */}
      <polygon points="36,226 284,226 302,286 18,286" fill="#000" transform="translate(5 5)" />
      <polygon points="36,226 284,226 302,286 18,286" fill="#fff" {...ink} strokeWidth="4" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {Array.from({ length: 11 }, (_, k) => {
            const y = 234 + row * 16;
            const inset = 40 - row * 6;
            const w = (240 + row * 12) / 11;
            return <rect key={k} x={inset + k * w + 2} y={y} width={w - 5} height="11" rx="2" fill={row === 2 && k > 2 && k < 8 ? "#fff" : "url(#d12)"} {...ink} strokeWidth="1.8" />;
          })}
        </g>
      ))}
    </svg>
  );
}

export function Postcard() {
  return (
    <svg viewBox="0 0 230 160" className="obj-svg" aria-hidden="true">
      <g transform="rotate(-9 110 80)">
        <rect x="24" y="34" width="176" height="104" fill="#000" />
        <rect x="20" y="30" width="176" height="104" fill="#fff" {...ink} strokeWidth="3.5" />
        <path d="M110 44v78" {...ink} strokeWidth="2" />
        <rect x="150" y="40" width="36" height="38" fill="#fff" {...ink} strokeWidth="2.5" strokeDasharray="3 3" />
        <g transform="translate(157 48) scale(0.95)">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000" />
        </g>
        <path d="M120 96h66M120 110h56M120 124h62M32 52h64M32 64h54M32 76h60" {...ink} strokeWidth="2.5" />
      </g>
      {/* pen */}
      <g transform="rotate(32 150 110)">
        <rect x="70" y="104" width="130" height="12" rx="3" fill="#fff" {...ink} strokeWidth="3" />
        <rect x="176" y="104" width="24" height="12" fill="url(#d50)" {...ink} strokeWidth="2" />
        <path d="M70 104 52 110l18 6z" fill="#fff" {...ink} strokeWidth="3" />
      </g>
    </svg>
  );
}

export function Ledger() {
  return (
    <svg viewBox="0 0 200 140" className="obj-svg" aria-hidden="true">
      {[3, 2, 1].map((i) => (
        <polygon key={i} points={`${30 + i * 2},${30 + i * 6} ${170 + i * 2},${30 + i * 6} ${188 + i * 2},${110 + i * 6} ${12 + i * 2},${110 + i * 6}`}
          fill={i === 3 ? "#000" : "#fff"} {...ink} strokeWidth="3" />
      ))}
      <polygon points="30,24 170,24 188,104 12,104" fill="#fff" {...ink} strokeWidth="3.5" />
      <path d="M48 24l-12 80" {...ink} strokeWidth="2" />
      {[40, 56, 72, 88].map((y, i) => (
        <line key={y} x1={50 - i * 2} y1={y} x2={170 + i * 4} y2={y} {...ink} strokeWidth="1.6" />
      ))}
      <text x="62" y="68" className="obj-text" fontSize="20">FEE 0%</text>
    </svg>
  );
}

export function CoinStack({ tag = true }: { tag?: boolean }) {
  const coins = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 170 180" className="obj-svg" aria-hidden="true">
      <ellipse cx="90" cy="160" rx="62" ry="16" fill="#000" />
      {coins.map((i) => {
        const cy = 150 - i * 18;
        return (
          <g key={i}>
            <path d={`M24 ${cy}v-14a62 16 0 0 0 124 0v14a62 16 0 0 1-124 0z`} fill="url(#d50)" {...ink} strokeWidth="3" />
            <ellipse cx="86" cy={cy - 14} rx="62" ry="16" fill="#fff" {...ink} strokeWidth="3" />
          </g>
        );
      })}
      <foreignObject x="68" y="68" width="36" height="36">
        <DoomMark size={36} />
      </foreignObject>
      {tag && (
        <g>
          <path d="M118 40 150 18" {...ink} strokeWidth="2" />
          <rect x="126" y="2" width="44" height="22" rx="3" fill="#000" />
          <text x="148" y="18" textAnchor="middle" className="obj-text inv" fontSize="12">LIVE</text>
        </g>
      )}
    </svg>
  );
}

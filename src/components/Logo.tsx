/**
 * Doom AI mark: a 16×16 1-bit bitmap — a bold "D" with a dithered counter and a blinking text cursor,
 * in a rounded window with a 1px drop shadow. `#` ink, `:` 50% dither, `c` cursor (blinks), `.` paper.
 * Keep in sync with brand/build.py, which renders the same bitmap to the brand SVG/PNG files.
 */
const MARK = [
  ".##############.",
  "#..............#",
  "#..............#",
  "#.#######......#",
  "#.##....##.....#",
  "#.##.::::##....#",
  "#.##.:::::##...#",
  "#.##.:::::##...#",
  "#.##.:::::##...#",
  "#.##.:::::##...#",
  "#.##.::::##.cc.#",
  "#.##....##..cc.#",
  "#.#######...cc.#",
  "#..............#",
  "#..............#",
  ".##############.",
];

type Run = { x: number; y: number; w: number };

function runs(match: (ch: string, x: number, y: number) => boolean): Run[] {
  const out: Run[] = [];
  MARK.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x++) {
      const on = x < row.length && match(row[x], x, y);
      if (on && start < 0) start = x;
      if (!on && start >= 0) {
        out.push({ x: start, y, w: x - start });
        start = -1;
      }
    }
  });
  return out;
}

const INK = runs((ch, x, y) => ch === "#" || (ch === ":" && (x + y) % 2 === 0));
const CURSOR = runs((ch) => ch === "c");

export function DoomMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 17 17"
      shapeRendering="crispEdges"
    >
      <rect x="2" y="16" width="14" height="1" fill="#000" />
      <rect x="16" y="2" width="1" height="14" fill="#000" />
      <rect x="15" y="15" width="1" height="1" fill="#000" />
      <rect x="1" y="1" width="14" height="14" fill="#fff" />
      {INK.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" fill="#000" />
      ))}
      <g className="mark-cursor">
        {CURSOR.map((r) => (
          <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" fill="#000" />
        ))}
      </g>
    </svg>
  );
}

export function DoomLogo({ size = 28 }: { size?: number }) {
  return (
    <span className="logo-lockup">
      <DoomMark size={size} />
      <span className="logo-word">
        DOOM<b>AI</b>
      </span>
    </span>
  );
}

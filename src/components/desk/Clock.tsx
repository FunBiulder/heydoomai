"use client";

import { useNow } from "../useNow";

/** Wall clock that shows the viewer's local time (10:10 while prerendering). */
export function Clock() {
  const now = useNow();
  const h = now ? now.getHours() % 12 : 10;
  const m = now ? now.getMinutes() : 10;
  const hourDeg = h * 30 + m * 0.5;
  const minDeg = m * 6;
  return (
    <svg viewBox="0 0 124 124" className="obj-svg" role="img" aria-label={`Clock, ${h || 12}:${String(m).padStart(2, "0")}`}>
      <circle cx="64" cy="64" r="56" fill="#000" />
      <circle cx="60" cy="60" r="56" fill="#fff" stroke="#000" strokeWidth="5" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="#000" strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="60" y1="17" x2="60" y2={i % 3 === 0 ? 27 : 23} stroke="#000" strokeWidth={i % 3 === 0 ? 4 : 2.5}
          transform={`rotate(${i * 30} 60 60)`} />
      ))}
      <line x1="60" y1="60" x2="60" y2="34" stroke="#000" strokeWidth="5.5" strokeLinecap="round" transform={`rotate(${hourDeg} 60 60)`} />
      <line x1="60" y1="60" x2="60" y2="21" stroke="#000" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minDeg} 60 60)`} />
      <circle cx="60" cy="60" r="4.5" fill="#000" />
    </svg>
  );
}

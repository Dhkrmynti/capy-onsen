/**
 * An account seal: no faces in this paper, just the engraved seal a private client's
 * statements are stamped with, struck from four parts. Every wallet gets one generated
 * from its address; holders can pick their own at the seal desk.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts.
 */
import type { CSSProperties, ReactNode } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = ink, hat = frame, acc = emblem, bg = paper (slot keys kept for the engine). */
export const PART_NAMES = {
  fur: ["Navy", "Racing green", "Oxblood", "Black", "Gold leaf"],
  hat: ["Plain ring", "Rope", "Scalloped", "Laurel", "Double ring"],
  acc: ["Crossed keys", "Column", "Star", "Crown", "Coin", "Oak leaf"],
  bg: ["Ivory", "Cream", "Linen", "Navy", "Money green", "Black"],
};

const INKS = ["#24375c", "#24553a", "#6d2128", "#1b1a18", "#b58b2e"];
const PAPER = ["#f4f1e8", "#efe6cf", "#e2dccb", "#1c2d4d", "#2e5c41", "#1b1a18"];
const DARK_PAPER = [3, 4, 5];

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The seal a wallet gets until its owner picks one. */
export function traitsFor(addr: string): Traits {
  const h = fnv(addr.toLowerCase() + ":mugshot");
  return [h % PARTS.fur, Math.floor(h / 7) % PARTS.hat, Math.floor(h / 53) % PARTS.acc, Math.floor(h / 419) % PARTS.bg];
}

export function validTraits(t: unknown): t is Traits {
  const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg];
  return Array.isArray(t) && t.length === 4 && t.every((v, i) => Number.isInteger(v) && v >= 0 && v < max[i]);
}

function Frame({ kind, c }: { kind: number; c: string }) {
  if (kind === 1)
    return (
      <g fill="none" stroke={c}>
        <circle cx="50" cy="50" r="40" strokeWidth="3" />
        <circle cx="50" cy="50" r="36" strokeWidth="4" strokeDasharray="3 2.2" />
      </g>
    );
  if (kind === 2) {
    const bumps = Array.from({ length: 20 }, (_, i) => {
      const a = (i * Math.PI) / 10;
      return <circle key={i} cx={50 + Math.cos(a) * 38} cy={50 + Math.sin(a) * 38} r="4.4" fill="none" stroke={c} strokeWidth="2" />;
    });
    return <g>{bumps}</g>;
  }
  if (kind === 3) {
    const leaves: ReactNode[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i * Math.PI) / 9;
      const x = 50 + Math.cos(a) * 38;
      const y = 50 + Math.sin(a) * 38;
      leaves.push(<ellipse key={i} cx={x} cy={y} rx="5" ry="2.2" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} fill={c} />);
    }
    return <g>{leaves}</g>;
  }
  if (kind === 4)
    return (
      <g fill="none" stroke={c}>
        <circle cx="50" cy="50" r="41" strokeWidth="2" />
        <circle cx="50" cy="50" r="35" strokeWidth="2" />
        <circle cx="50" cy="50" r="38" strokeWidth="1" strokeDasharray="1 2" />
      </g>
    );
  return <circle cx="50" cy="50" r="39" fill="none" stroke={c} strokeWidth="3.5" />;
}

function Emblem({ kind, c }: { kind: number; c: string }) {
  const s = { fill: "none", stroke: c, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === 0)
    return (
      <g {...s}>
        <path d="M34 66 L 64 36 M 36 36 L 66 66" />
        <circle cx="30" cy="70" r="5" />
        <circle cx="70" cy="70" r="5" />
        <path d="M60 36 l 6 -6 M 64 40 l 6 -6 M 40 36 l -6 -6 M 36 40 l -6 -6" />
      </g>
    );
  if (kind === 1)
    return (
      <g {...s}>
        <path d="M36 34 H 64 M 38 38 H 62 M 38 66 H 62 M 35 70 H 65" />
        <path d="M42 38 V 66 M 50 38 V 66 M 58 38 V 66" />
      </g>
    );
  if (kind === 2) return <path d="M50 30 L 55.9 43.9 L 71 45.3 L 59.5 55.2 L 63 70 L 50 62 L 37 70 L 40.5 55.2 L 29 45.3 L 44.1 43.9 Z" fill={c} />;
  if (kind === 3)
    return (
      <g {...s}>
        <path d="M32 64 L 30 40 L 40 50 L 50 34 L 60 50 L 70 40 L 68 64 Z" fill={c} fillOpacity="0.18" />
        <path d="M32 70 H 68" />
      </g>
    );
  if (kind === 4)
    return (
      <g {...s}>
        <circle cx="50" cy="50" r="17" />
        <text x="50" y="57" textAnchor="middle" fontFamily="var(--f-mast), serif" fontSize="20" fill={c} stroke="none">
          $
        </text>
      </g>
    );
  return (
    <g {...s}>
      <path d="M50 72 V 52" />
      <path d="M50 30 C 40 34 36 42 40 46 C 34 48 34 56 42 56 C 40 62 46 64 50 58 C 54 64 60 62 58 56 C 66 56 66 48 60 46 C 64 42 60 34 50 30 Z" fill={c} fillOpacity="0.18" />
    </g>
  );
}

export function Mugshot({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const [ink, frame, emblem, paper] = traits;
  const dark = DARK_PAPER.includes(paper);
  // On dark paper the seal is struck in gold or cream so it still reads.
  const c = dark ? (ink === 4 ? "#e9d39a" : "#efe6cf") : INKS[ink] ?? INKS[0];
  return (
    <svg className={`mugshot ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={PAPER[paper] ?? PAPER[0]} />
      {/* faint guilloche behind the seal */}
      <g fill="none" stroke={c} strokeOpacity="0.14" strokeWidth="0.8">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <circle key={i} cx={50 + Math.cos(a) * 14} cy={50 + Math.sin(a) * 14} r="30" />;
        })}
      </g>
      <Frame kind={frame} c={c} />
      <Emblem kind={emblem} c={c} />
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="#1b1a18" strokeWidth="2" />
    </svg>
  );
}

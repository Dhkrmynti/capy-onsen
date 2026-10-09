/**
 * A citizen's coin portrait: an owl bust in Glaux's line style, struck from four parts.
 * Every wallet gets one generated from its address; holders can pick their own parts
 * in the portrait booth. Part counts must match MUGSHOT_PARTS in bot/byline.ts.
 */
import type { CSSProperties } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

export const PART_NAMES = {
  fur: ["Tawny", "Ash", "Snow", "Bronze", "Night"],
  hat: ["Bare head", "Laurel", "Olive crown", "Helmet", "Phrygian cap"],
  acc: ["Nothing", "Olive sprig", "Coin pendant", "Scroll", "Spectacles", "Battle scar"],
  bg: ["Papyrus", "Marble", "Terracotta", "Aegean", "Black-figure", "Gold"],
};

/** Plumage: [feather, dark feather, light face]. */
const PLUME: [string, string, string][] = [
  ["#9c7a55", "#6b5138", "#ecdcbc"],
  ["#8b8f94", "#5d6166", "#e4e6e8"],
  ["#d6d2c8", "#a19c90", "#f7f5ef"],
  ["#b07a3e", "#7c5226", "#f0d8b0"],
  ["#4b4640", "#2c2824", "#cfc6b8"],
];
const BG = ["#e8dcc0", "#e6e4df", "#b8471f", "#2f5d8a", "#1d1a17", "#d4a845"];
const DARK_BG = [2, 3, 4];
const INK = "#1d1712";
const GOLD = "#d4a845";
const OLIVE = "#7d8c3c";
const CLOTH = "#f1ebdc";
const CLAY = "#b8471f";
const BRONZE = "#b98a3a";

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The portrait a wallet gets until its owner picks one. */
export function traitsFor(addr: string): Traits {
  const h = fnv(addr.toLowerCase() + ":mugshot");
  return [h % PARTS.fur, Math.floor(h / 7) % PARTS.hat, Math.floor(h / 53) % PARTS.acc, Math.floor(h / 419) % PARTS.bg];
}

export function validTraits(t: unknown): t is Traits {
  const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg];
  return Array.isArray(t) && t.length === 4 && t.every((v, i) => Number.isInteger(v) && v >= 0 && v < max[i]);
}

/** A ring of leaves around the crown of the head, for the laurel and the olive crown. */
function Wreath({ leaf, berry }: { leaf: string; berry?: string }) {
  const leaves = [-62, -44, -26, 26, 44, 62];
  return (
    <g>
      {leaves.map((a) => {
        const r = (a * Math.PI) / 180;
        const x = 50 + Math.sin(r) * 27;
        const y = 34 - Math.cos(r) * 13;
        return <ellipse key={a} cx={x} cy={y} rx="5.2" ry="2.6" transform={`rotate(${a + (a < 0 ? -20 : 20)} ${x} ${y})`} fill={leaf} stroke={INK} strokeWidth="1.1" />;
      })}
      {berry ? (
        <g fill={berry}>
          <circle cx="36" cy="27.5" r="1.7" />
          <circle cx="64" cy="27.5" r="1.7" />
        </g>
      ) : null}
    </g>
  );
}

export function Mugshot({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const [f, hat, acc, bg] = traits;
  const [plume, plumeDark, face] = PLUME[f] ?? PLUME[0];
  const dark = DARK_BG.includes(bg);
  return (
    <svg className={`mugshot ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={BG[bg] ?? BG[0]} />
      {/* the coin the portrait is struck on */}
      <circle cx="50" cy="50" r="43" fill="none" stroke={dark ? "#ffffff" : INK} strokeOpacity="0.2" strokeWidth="2" strokeDasharray="1.5 3" />
      <circle cx="50" cy="50" r="38" fill={dark ? "#ffffff" : INK} fillOpacity="0.06" />

      {/* draped chiton with a clay border, pinned at the shoulder */}
      <path d="M12 100 C 16 82 32 76 50 76 C 68 76 84 82 88 100 Z" fill={CLOTH} stroke={INK} strokeWidth="2.4" />
      <path d="M22 100 C 30 88 48 80 70 77" fill="none" stroke={CLAY} strokeWidth="4" />
      <path d="M22 100 C 30 88 48 80 70 77" fill="none" stroke={INK} strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="68" cy="82" r="3.2" fill={GOLD} stroke={INK} strokeWidth="1.2" />

      {/* ear tufts */}
      <g fill={plumeDark} stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M24 38 L 21 17 L 39 28 Z" />
        <path d="M76 38 L 79 17 L 61 28 Z" />
      </g>
      {/* head */}
      <path d="M20 50 C 19 33 32 24 50 24 C 68 24 81 33 80 50 C 79 66 66 76 50 76 C 34 76 21 66 20 50 Z" fill={plume} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M33 37 C 41 32 47 33 50 38 C 53 33 59 32 67 37" fill="none" stroke={face} strokeWidth="2.6" strokeLinecap="round" />
      {/* facial discs and eyes */}
      <g fill={face} stroke={INK} strokeWidth="1.6">
        <circle cx="38.5" cy="49" r="12" />
        <circle cx="61.5" cy="49" r="12" />
      </g>
      <g fill="#e3a63c" stroke={INK} strokeWidth="1.5">
        <circle cx="38.5" cy="49" r="7.6" />
        <circle cx="61.5" cy="49" r="7.6" />
      </g>
      <g fill={INK}>
        <circle cx="39" cy="49.6" r="4.1" />
        <circle cx="61" cy="49.6" r="4.1" />
      </g>
      <g fill="#ffffff">
        <circle cx="40.6" cy="47.6" r="1.3" />
        <circle cx="62.6" cy="47.6" r="1.3" />
      </g>
      {/* beak */}
      <path d="M50 55 L 46.2 59.5 L 50 66 L 53.8 59.5 Z" fill="#d8a24a" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />

      {/* extras */}
      {acc === 1 ? (
        <g>
          <path d="M50 64 C 58 66 66 66 74 62" fill="none" stroke="#3f4a1c" strokeWidth="1.6" strokeLinecap="round" />
          {[
            [58, 64, -18],
            [66, 63.5, 12],
            [72, 61, -24],
          ].map(([x, y, a]) => (
            <ellipse key={x} cx={x} cy={y} rx="3.6" ry="1.7" transform={`rotate(${a} ${x} ${y})`} fill={OLIVE} stroke={INK} strokeWidth="0.9" />
          ))}
          <circle cx="75" cy="63" r="1.8" fill="#3f4a1c" />
        </g>
      ) : null}
      {acc === 2 ? (
        <g>
          <path d="M34 78 Q 50 92 66 78" fill="none" stroke={INK} strokeWidth="1.2" />
          <circle cx="50" cy="88" r="5.2" fill={GOLD} stroke={INK} strokeWidth="1.4" />
          <circle cx="48.4" cy="87.3" r="1.2" fill="none" stroke={INK} strokeWidth="0.8" />
          <circle cx="51.6" cy="87.3" r="1.2" fill="none" stroke={INK} strokeWidth="0.8" />
        </g>
      ) : null}
      {acc === 3 ? (
        <g stroke={INK} strokeWidth="1.3" strokeLinejoin="round">
          <rect x="70" y="80" width="20" height="9" rx="1.5" fill="#f1e2bf" transform="rotate(-18 80 84.5)" />
          <circle cx="71" cy="87.4" r="2.6" fill="#e3cf9f" />
          <circle cx="89" cy="81.6" r="2.6" fill="#e3cf9f" />
        </g>
      ) : null}
      {acc === 4 ? (
        <g fill="none" stroke={GOLD} strokeWidth="1.8">
          <circle cx="38.5" cy="49" r="9.6" />
          <circle cx="61.5" cy="49" r="9.6" />
          <path d="M48 48 Q 50 46 52 48" />
        </g>
      ) : null}
      {acc === 5 ? (
        <g stroke="#7e1d16" strokeLinecap="round" fill="none">
          <path d="M66 33 L 56 58" strokeWidth="2.1" />
          <path d="M60 39 L 64 41 M 58.5 45 L 62.5 47 M 57 51 L 61 53" strokeWidth="1.1" />
        </g>
      ) : null}

      {/* crowns */}
      {hat === 1 ? <Wreath leaf="#5f8a3a" /> : null}
      {hat === 2 ? <Wreath leaf={OLIVE} berry="#2f3a14" /> : null}
      {hat === 3 ? (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          {/* crest first, then the bronze bowl over it */}
          <path d="M31 19 C 39 5 61 5 69 19 L 65 22 C 57 13 43 13 35 22 Z" fill={CLAY} />
          <path d="M23 37 C 21 22 35 15 50 15 C 65 15 79 22 77 37 L 70 37 C 68 30 60 27 50 27 C 40 27 32 30 30 37 Z" fill={BRONZE} />
          <path d="M27 32 H 73" fill="none" stroke={INK} strokeWidth="1" />
        </g>
      ) : null}
      {hat === 4 ? (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M26 38 C 24 22 40 12 56 14 C 66 15 70 22 66 26 C 72 26 74 32 70 34 C 60 32 40 32 26 38 Z" fill={CLAY} />
          <path d="M27 36 C 40 31 58 31 71 34" fill="none" stroke={CLOTH} strokeWidth="2" />
        </g>
      ) : null}

      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

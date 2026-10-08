/**
 * A crew mugshot: a raccoon head in Robin's line style, assembled from four parts.
 * Every wallet gets one generated from its address; holders can pick their own parts
 * in the mugshot booth. Part counts must match MUGSHOT_PARTS in bot/byline.ts.
 */
import type { CSSProperties } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

export const PART_NAMES = {
  fur: ["Gray", "Charcoal", "Silver", "Brown", "Ginger"],
  hat: ["No hat", "Bowler", "Fedora", "Flat cap", "Top hat"],
  acc: ["Nothing", "Monocle", "Shades", "Cigar", "Gold chain", "Scar"],
  bg: ["Newsprint", "Ash", "Paper", "Red", "Navy", "Brass"],
};

const FUR: [string, string, string][] = [
  ["#8d95a3", "#5f6775", "#dfe2e7"],
  ["#5c626d", "#3b4049", "#c9ccd2"],
  ["#b7bcc5", "#868c97", "#eef0f3"],
  ["#8a6a52", "#5e4636", "#e4d3c4"],
  ["#c08552", "#8c5a31", "#f1dcc7"],
];
const BG = ["#dedcd5", "#bdb9ae", "#e9e7e1", "#c8241b", "#2f3d55", "#d4a845"];
const INK = "#141a26";
const MASK = "#1d2330";
const BRASS = "#d4a845";
const HAT = "#1b2232";

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The mugshot a wallet gets until its owner picks one. */
export function traitsFor(addr: string): Traits {
  const h = fnv(addr.toLowerCase() + ":mugshot");
  return [h % PARTS.fur, Math.floor(h / 7) % PARTS.hat, Math.floor(h / 53) % PARTS.acc, Math.floor(h / 419) % PARTS.bg];
}

export function validTraits(t: unknown): t is Traits {
  const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg];
  return Array.isArray(t) && t.length === 4 && t.every((v, i) => Number.isInteger(v) && v >= 0 && v < max[i]);
}

export function Mugshot({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const [f, hat, acc, bg] = traits;
  const [fur, furDark, furLight] = FUR[f] ?? FUR[0];
  const dark = bg === 3 || bg === 4;
  return (
    <svg className={`mugshot ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={BG[bg] ?? BG[0]} />
      {/* the height chart behind every mugshot */}
      <g stroke={dark ? "#ffffff" : INK} strokeOpacity="0.16" strokeWidth="1">
        {[18, 34, 50, 66, 82].map((y) => (
          <path key={y} d={`M0 ${y}h100`} />
        ))}
      </g>

      {/* shoulders in a suit, collar and tie */}
      <path d="M12 100 C 16 82 32 77 50 77 C 68 77 84 82 88 100 Z" fill="#2f3d55" stroke={INK} strokeWidth="2.5" />
      <path d="M41 78 L 50 92 L 59 78 Z" fill="#f3ecdc" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 84 L 46 80 L 46 88 Z M50 84 L 54 80 L 54 88 Z" fill="#c8402a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />

      {/* ears */}
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <path d="M24 36 L 19 12 L 40 25 Z" fill={fur} />
        <path d="M76 36 L 81 12 L 60 25 Z" fill={fur} />
      </g>
      <path d="M26 30 L 23 17 L 35 25 Z" fill={MASK} />
      <path d="M74 30 L 77 17 L 65 25 Z" fill={MASK} />

      {/* head with cheek tufts */}
      <path d="M20 48 C 20 30 34 22 50 22 C 66 22 80 30 80 48 L 88 54 L 79 56 C 75 68 63 74 50 74 C 37 74 25 68 21 56 L 12 54 Z" fill={fur} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 24 C 47 31 47 37 50 42 C 53 37 53 31 50 24 Z" fill={furDark} />
      {/* the bandit mask */}
      <path d="M22 44 C 30 34 44 34 50 41 C 56 34 70 34 78 44 C 76 54 66 57 58 53 C 54 51 46 51 42 53 C 34 57 24 54 22 44 Z" fill={MASK} />
      <path d="M38 61 C 40 54 60 54 62 61 C 62 68 56 72 50 72 C 44 72 38 68 38 61 Z" fill={furLight} stroke={INK} strokeWidth="2" />
      <ellipse cx="50" cy="57" rx="4" ry="3" fill={INK} />
      <path d="M44 65 Q 50 68.5 56 64" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <g fill="#ffffff" stroke={INK} strokeWidth="1.6">
        <circle cx="39" cy="45" r="5.8" />
        <circle cx="61" cy="45" r="5.8" />
      </g>
      <g fill={INK}>
        <circle cx="39.8" cy="45.6" r="3" />
        <circle cx="60.2" cy="45.6" r="3" />
      </g>
      <g fill="#ffffff">
        <circle cx="41" cy="44" r="1" />
        <circle cx="61.4" cy="44" r="1" />
      </g>

      {/* accessories */}
      {acc === 1 ? (
        <g fill="none" stroke={BRASS}>
          <circle cx="61" cy="45" r="8.5" strokeWidth="2.6" />
          <path d="M68 50 C 74 58 73 66 69 72" strokeWidth="1.2" strokeDasharray="2 1.6" />
        </g>
      ) : null}
      {acc === 2 ? (
        <g fill={INK} stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
          <path d="M29 40 H 47 L 46 49 Q 38 53 31 49 Z" />
          <path d="M53 40 H 71 L 69 49 Q 62 53 54 49 Z" />
          <path d="M47 42 H 53" fill="none" strokeWidth="2" />
          <path d="M33 42 L 38 41" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.4" fill="none" />
        </g>
      ) : null}
      {acc === 3 ? (
        <g>
          <path d="M55 66 L 74 62 L 75 66 L 56 70 Z" fill="#7a4a2a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M72 62.4 L 75 61.8 L 76 65.8 L 73 66.4 Z" fill="#c8241b" />
          <path d="M77 58 C 80 54 76 51 79 47" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ) : null}
      {acc === 4 ? (
        <g>
          <path d="M33 84 Q 50 98 67 84" fill="none" stroke={BRASS} strokeWidth="2.6" strokeDasharray="3 1.4" />
          <circle cx="50" cy="93" r="4.6" fill={BRASS} stroke={INK} strokeWidth="1.4" />
          <path d="M50 90.2 V 95.8 M 48.2 91.6 Q 50 90.4 51.6 91.8 Q 50 93 48.6 94.2 Q 50 95.6 51.8 94.4" fill="none" stroke={INK} strokeWidth="0.9" />
        </g>
      ) : null}
      {acc === 5 ? (
        <g stroke="#7e1d16" strokeLinecap="round" fill="none">
          <path d="M31 33 L 45 54" strokeWidth="2.2" />
          <path d="M34 39 L 38 37 M 37 44 L 41 42 M 40 49 L 44 47" strokeWidth="1.2" />
        </g>
      ) : null}

      {/* hats */}
      {hat === 1 ? (
        <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M33 27 C 33 11 67 11 67 27 Z" fill={HAT} />
          <ellipse cx="50" cy="27.5" rx="26" ry="4.6" fill={HAT} />
          <path d="M33.4 23 H 66.6 V 26.4 H 33.4 Z" fill={BRASS} stroke="none" />
        </g>
      ) : null}
      {hat === 2 ? (
        <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="50" cy="27.5" rx="31" ry="5.2" fill="#3a3330" />
          <path d="M34 27 L 37 12 Q 50 5 63 12 L 66 27 Z" fill="#3a3330" />
          <path d="M44 9.5 Q 50 14 56 9.5" fill="none" />
          <path d="M34.8 22 H 65.2 L 65.8 25.6 H 34.2 Z" fill="#c8241b" stroke="none" />
        </g>
      ) : null}
      {hat === 3 ? (
        <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M24 31 C 25 15 58 10 74 22 L 84 27 C 72 33 40 34 24 31 Z" fill="#6b6a5f" />
          <path d="M30 26 C 40 22 58 21 70 23" fill="none" strokeWidth="1.2" />
        </g>
      ) : null}
      {hat === 4 ? (
        <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M37 27 V 3 H 63 V 27 Z" fill={HAT} />
          <ellipse cx="50" cy="27.5" rx="23" ry="4" fill={HAT} />
          <path d="M37.4 20 H 62.6 V 24 H 37.4 Z" fill={BRASS} stroke="none" />
        </g>
      ) : null}

      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/**
 * A holder's portrait: a bored cartoon ape, head and shoulders. Every wallet gets one generated
 * from its address; holders can pick their own at the desk. The same four traits dress the 3D
 * ape that sits in the waiting room, so the portrait and the chair always match.
 * Drawn flat in SVG, so it costs nothing to show.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts (the slot keys are kept for the engine).
 */
import { type CSSProperties } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = fur colour, hat = headwear, acc = eyewear and earring, bg = shirt (and the portrait's backdrop). */
export const PART_NAMES = {
  fur: ["Brown", "Cream", "Grey", "Gold", "Blue"],
  hat: ["No hat", "Beanie", "Cap", "Party hat", "Headband"],
  acc: ["Nothing", "Shades", "Gold specs", "Earring", "Shades + earring", "Specs + earring"],
  bg: ["Red shirt", "Blue shirt", "Green shirt", "Orange shirt", "Purple shirt", "Black shirt"],
};

/** Shared with the 3D ape. */
export const APE_FUR = ["#8a5a3a", "#d9b98a", "#5d5856", "#e0b03a", "#7fb6d9"];
export const APE_SHIRT = ["#e5262b", "#1f6fe0", "#16a34a", "#f59e0b", "#7c3aed", "#1b2230"];
/** Hat and trim colour: the shirt's opposite number, so a hat never vanishes into the shirt. */
export const APE_TRIM = ["#ffc93c", "#ff8a2b", "#f4f1e8", "#1f6fe0", "#ffc93c", "#e5262b"];
export const hasShades = (acc: number) => acc === 1 || acc === 4;
export const hasSpecs = (acc: number) => acc === 2 || acc === 5;
export const hasEarring = (acc: number) => acc >= 3;

const INK = "#1a1206";
const BACK = ["#ffd3d0", "#cfe2ff", "#cdeed9", "#ffe6b8", "#e2d6ff", "#cfd5dd"];
const GOLD = "#ffc93c";

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

/** Mixes a hex colour toward another by k (0..1). */
function mix(a: string, b: string, k: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
}

const line = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export function Mugshot({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const [f, hat, acc, shirtN] = traits;
  const fur = APE_FUR[f] ?? APE_FUR[0];
  const skin = mix(fur, "#f3d6b3", 0.72);
  const shirt = APE_SHIRT[shirtN] ?? APE_SHIRT[0];
  const trim = APE_TRIM[shirtN] ?? APE_TRIM[0];
  return (
    <svg className={`mugshot ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={BACK[shirtN] ?? BACK[0]} />
      {/* shirt and collar */}
      <path d="M8 101 C 10 85, 24 76, 38 74 L 62 74 C 76 76, 90 85, 92 101 Z" fill={shirt} {...line} />
      <path d="M38 74 C 43 81, 57 81, 62 74" fill="none" stroke={trim} strokeWidth="4" strokeLinecap="round" />
      {/* ears */}
      {[22, 78].map((x) => (
        <g key={x}>
          <circle cx={x} cy="46" r="9.5" fill={fur} {...line} />
          <circle cx={x} cy="46" r="5" fill={skin} />
        </g>
      ))}
      {hasEarring(acc) ? <circle cx="80" cy="57" r="3.2" fill="none" stroke={GOLD} strokeWidth="2.2" /> : null}
      {/* skull, face, muzzle */}
      <circle cx="50" cy="44" r="27" fill={fur} {...line} />
      <ellipse cx="50" cy="42" rx="19.5" ry="12.5" fill={skin} />
      <ellipse cx="50" cy="60" rx="20" ry="13.5" fill={skin} {...line} strokeWidth={1.8} />
      <path d="M33 32 C 40 28.5, 60 28.5, 67 32" fill="none" stroke={mix(fur, "#000000", 0.4)} strokeWidth="4" strokeLinecap="round" />
      {/* bored eyes: a heavy lid over each */}
      {[42, 58].map((x) => (
        <g key={x}>
          <circle cx={x} cy="42" r="5.6" fill="#fffdf7" {...line} strokeWidth={1.6} />
          <circle cx={x} cy="43.6" r="2.3" fill={INK} />
          <path d={`M${x - 5.6} 42 A 5.6 5.6 0 0 1 ${x + 5.6} 42 Z`} fill={skin} {...line} strokeWidth={1.6} />
        </g>
      ))}
      <circle cx="47" cy="54" r="1.3" fill={INK} />
      <circle cx="53" cy="54" r="1.3" fill={INK} />
      <path d="M40 63.5 C 46 66, 54 66, 60 63.5" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {hasShades(acc) ? (
        <g>
          <rect x="33" y="36.5" width="15" height="10" rx="4" fill={INK} />
          <rect x="52" y="36.5" width="15" height="10" rx="4" fill={INK} />
          <path d="M48 40 L 52 40 M33 40 L 24 38 M67 40 L 76 38" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M36 39 L 40 39" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ) : null}
      {hasSpecs(acc) ? (
        <g fill="none" stroke={GOLD} strokeWidth="2">
          <circle cx="42" cy="42" r="7.4" />
          <circle cx="58" cy="42" r="7.4" />
          <path d="M49.4 42 L 50.6 42 M34.6 42 L 25 39.5 M65.4 42 L 75 39.5" />
        </g>
      ) : null}
      {hat === 1 ? (
        <g>
          <path d="M24 34 C 24 10, 76 10, 76 34 Z" fill={trim} {...line} />
          <rect x="21" y="29" width="58" height="9" rx="4.5" fill="#fffdf7" {...line} strokeWidth={1.8} />
          <circle cx="50" cy="13" r="5" fill="#fffdf7" {...line} strokeWidth={1.8} />
        </g>
      ) : null}
      {hat === 2 ? (
        <g>
          <path d="M25 33 C 25 12, 75 12, 75 33 Z" fill={trim} {...line} />
          <path d="M40 33 C 44 27, 78 26, 88 34 C 78 37, 52 37, 40 33 Z" fill={trim} {...line} />
        </g>
      ) : null}
      {hat === 3 ? (
        <g>
          <path d="M40 22 L 54 -2 L 64 22 Z" fill={trim} {...line} />
          <circle cx="54" cy="0" r="4" fill={GOLD} {...line} strokeWidth={1.6} />
          <path d="M45 14 L 60 12" stroke="#fffdf7" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ) : null}
      {hat === 4 ? <path d="M24.5 33 C 34 24, 66 24, 75.5 33" fill="none" stroke={trim} strokeWidth="6" strokeLinecap="round" /> : null}
      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

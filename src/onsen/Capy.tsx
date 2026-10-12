/**
 * The capybara. One head, drawn flat in SVG, used everywhere: the portrait on a bath tag, the
 * ten soaking in the hero, the attendant at the counter, the mark. Every wallet gets one generated
 * from its address; holders can pick their own in the changing room.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts (the slot keys are kept for the engine).
 */
import { type CSSProperties } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = coat, hat = what sits on the head, acc = eyewear and ear flower, bg = the wall behind. */
export const PART_NAMES = {
  fur: ["Chestnut", "Sand", "Ash", "Cocoa", "Rust"],
  hat: ["Bare head", "Towel", "Bucket", "Duckling", "Leaf"],
  acc: ["Nothing", "Foggy specs", "Shades", "Ear flower", "Specs + flower", "Shades + flower"],
  bg: ["Fuji mural", "Indigo tile", "Yuzu tile", "Moss tile", "Clay tile", "Night bath"],
};

export const FUR = ["#a9744a", "#d9bb8e", "#8f8a83", "#6d4b35", "#c8703d"];
const WALL = ["#c5e1e6", "#1c2d5a", "#f4c430", "#86a871", "#d98c62", "#1b1917"];
const INK = "#1a1814";
export const WATER = "#9fd3cc";
const hasSpecs = (acc: number) => acc === 1 || acc === 4;
const hasShades = (acc: number) => acc === 2 || acc === 5;
const hasFlower = (acc: number) => acc >= 3;

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The capybara a wallet gets until its owner picks one. */
export function traitsFor(addr: string): Traits {
  const h = fnv(addr.toLowerCase() + ":mugshot");
  return [h % PARTS.fur, Math.floor(h / 7) % PARTS.hat, Math.floor(h / 53) % PARTS.acc, Math.floor(h / 419) % PARTS.bg];
}

export function validTraits(t: unknown): t is Traits {
  const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg];
  return Array.isArray(t) && t.length === 4 && t.every((v, i) => Number.isInteger(v) && v >= 0 && v < max[i]);
}

/** A wallet's capybara: the parts it picked, else the ones its address generates. */
export function capyOf(addr: string, pp?: number[] | null): Traits {
  return validTraits(pp) ? pp : traitsFor(addr);
}

/** Mixes a hex colour toward another by k (0..1). */
function mix(a: string, b: string, k: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
}

const line = { stroke: INK, strokeWidth: 2.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** The yuzu: only ever on the head of No. 1. */
export function Yuzu({ x = 50, y = 9, r = 11 }: { x?: number; y?: number; r?: number }) {
  return (
    <g className="yuzu">
      <circle cx={x} cy={y} r={r} fill="#f4c430" {...line} />
      <path d={`M${x} ${y - r} q1 -5 6 -6`} fill="none" {...line} strokeWidth={2.2} />
      <path d={`M${x + 5} ${y - r - 5} q7 -4 10 2 q-6 4 -10 -2 Z`} fill="#6f9a52" {...line} strokeWidth={2} />
      <circle cx={x - 4} cy={y - 2} r="1" fill="#d9a514" />
      <circle cx={x + 3} cy={y + 3} r="1" fill="#d9a514" />
      <circle cx={x - 2} cy={y + 5} r="1" fill="#d9a514" />
    </g>
  );
}

/**
 * The head alone, in a 100 by 100 box with the chin near y=88. `yuzu` puts the yuzu on top in
 * place of the hat; `startled` is the face of a wallet that just got out.
 */
export function CapyHead({ traits, yuzu = false, startled = false }: { traits: Traits; yuzu?: boolean; startled?: boolean }) {
  const [f, hat, acc] = traits;
  const fur = FUR[f] ?? FUR[0];
  const pale = mix(fur, "#fff1d6", 0.5);
  const dark = mix(fur, "#000000", 0.42);
  return (
    <g>
      {[28, 72].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="23" rx="8" ry="7" fill={fur} {...line} />
          <ellipse cx={x} cy="24" rx="3.6" ry="3" fill={dark} />
        </g>
      ))}
      <path d="M30 22 C 40 15, 60 15, 70 22 C 81 29, 85 46, 85 60 C 85 79, 72 89, 50 89 C 28 89, 15 79, 15 60 C 15 46, 19 29, 30 22 Z" fill={fur} {...line} />
      <ellipse cx="50" cy="69" rx="25" ry="17" fill={pale} />
      <ellipse cx="25" cy="59" rx="6" ry="3.6" fill="#ee8571" opacity="0.6" />
      <ellipse cx="75" cy="59" rx="6" ry="3.6" fill="#ee8571" opacity="0.6" />
      {startled
        ? [31, 69].map((x) => (
            <g key={x}>
              <circle cx={x} cy="45" r="5.4" fill="#fffaf0" {...line} strokeWidth={2} />
              <circle cx={x} cy="45" r="1.8" fill={INK} />
            </g>
          ))
        : [31, 69].map((x) => (
            <g key={x}>
              <circle cx={x} cy="46.5" r="3.5" fill={INK} />
              <path d={`M${x - 6} 44.5 h12 v-6 h-12 Z`} fill={fur} />
              <path d={`M${x - 5.5} 44.5 h11`} fill="none" {...line} strokeWidth={2.4} />
            </g>
          ))}
      <path d="M41 56 H59 A5 5 0 0 1 64 61 V63 A7 7 0 0 1 57 70 H43 A7 7 0 0 1 36 63 V61 A5 5 0 0 1 41 56 Z" fill={dark} {...line} strokeWidth={2.2} />
      <path d="M50 70 V75 M44 78.5 Q50 82 56 78.5" fill="none" {...line} strokeWidth={2.2} />
      {hasSpecs(acc) ? (
        <g>
          <circle cx="31" cy="45.5" r="8.4" fill="#fffaf0" fillOpacity="0.72" {...line} strokeWidth={2.2} />
          <circle cx="69" cy="45.5" r="8.4" fill="#fffaf0" fillOpacity="0.72" {...line} strokeWidth={2.2} />
          <path d="M39.4 45.5 H60.6" fill="none" {...line} strokeWidth={2.2} />
        </g>
      ) : null}
      {hasShades(acc) ? (
        <g>
          <rect x="21" y="39.5" width="20" height="12" rx="4" fill={INK} />
          <rect x="59" y="39.5" width="20" height="12" rx="4" fill={INK} />
          <path d="M41 43 H59" fill="none" {...line} strokeWidth={2.6} />
          <path d="M25 43 h6" stroke="#fffaf0" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : null}
      {hasFlower(acc) ? (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="78" cy="19.5" rx="3.6" ry="5.2" fill="#f3a7b4" {...line} strokeWidth={1.6} transform={`rotate(${a} 78 25)`} />
          ))}
          <circle cx="78" cy="25" r="2.8" fill="#f4c430" {...line} strokeWidth={1.4} />
        </g>
      ) : null}
      {yuzu ? (
        <Yuzu />
      ) : hat === 1 ? (
        <g>
          <rect x="33" y="8" width="34" height="12" rx="3" fill="#fffaf0" {...line} />
          <path d="M33 14 H67" stroke="#1c2d5a" strokeWidth="2.4" />
        </g>
      ) : hat === 2 ? (
        <g>
          <path d="M31 21 L36 1 H64 L69 21 Z" fill="#c58b52" {...line} />
          <path d="M34.5 7 H65.5 M32.5 15 H67.5" fill="none" stroke={INK} strokeWidth="1.8" />
        </g>
      ) : hat === 3 ? (
        <g>
          <ellipse cx="48" cy="13" rx="10" ry="7.5" fill="#f4c430" {...line} strokeWidth={2.2} />
          <circle cx="58" cy="6.5" r="5.6" fill="#f4c430" {...line} strokeWidth={2.2} />
          <path d="M63 6 L69 7.6 L63 9.4 Z" fill="#e4472b" {...line} strokeWidth={1.6} />
          <circle cx="59" cy="5.4" r="1.1" fill={INK} />
        </g>
      ) : hat === 4 ? (
        <g>
          <path d="M50 19 C 36 16, 33 4, 44 0 C 58 0, 64 10, 50 19 Z" fill="#6f9a52" {...line} strokeWidth={2.2} />
          <path d="M50 19 C 48 12, 46 7, 44 2" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
}

/** A capybara soaking: head above the waterline, a ripple around it. Sits in a 100 by 100 box. */
export function Soaker({ traits, yuzu = false, startled = false, className = "" }: { traits: Traits; yuzu?: boolean; startled?: boolean; className?: string }) {
  return (
    <svg className={`soaker ${className}`} viewBox="0 -6 100 106" aria-hidden="true">
      <ellipse className="soaker__ring" cx="50" cy="88" rx="47" ry="9" fill="none" stroke="#fffaf0" strokeOpacity="0.7" strokeWidth="2" />
      <g className="soaker__head">
        <CapyHead traits={traits} yuzu={yuzu} startled={startled} />
      </g>
      <path d="M0 100 V88 Q12 82 25 86 T50 86 T75 86 T100 88 V100 Z" fill={WATER} />
      <path d="M8 87.5 Q17 83 26 86 T50 86 T74 86 T92 87.5" fill="none" stroke="#fffaf0" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** The portrait on a tag: head and shoulders in the water, the chosen wall behind. */
export function Portrait({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const wallN = traits[3];
  const wall = WALL[wallN] ?? WALL[0];
  const dim = wallN === 1 || wallN === 5;
  const grout = dim ? "#fffaf0" : INK;
  return (
    <svg className={`portrait ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={wall} />
      {wallN === 0 ? (
        <g>
          <circle cx="80" cy="20" r="9" fill="#e4472b" />
          <path d="M-4 70 L34 22 L46 22 L84 70 Z" fill="#35518f" />
          <path d="M34 22 L46 22 L52 30 L46 27 L40 31 L34 27 L28 30 Z" fill="#fffaf0" />
        </g>
      ) : wallN === 5 ? (
        <g>
          <circle cx="78" cy="20" r="9" fill="#f4c430" />
          <circle cx="20" cy="16" r="1.2" fill="#fffaf0" />
          <circle cx="38" cy="30" r="1" fill="#fffaf0" />
          <circle cx="56" cy="12" r="1.2" fill="#fffaf0" />
        </g>
      ) : (
        <path d="M0 25 H100 M0 50 H100 M25 0 V78 M50 0 V78 M75 0 V78" stroke={grout} strokeOpacity="0.22" strokeWidth="1.4" />
      )}
      <g transform="translate(12 5) scale(0.76)">
        <CapyHead traits={traits} />
      </g>
      <path d="M0 100 V80 Q12 75 25 79 T50 79 T75 79 T100 80 V100 Z" fill={WATER} />
      <path d="M0 80 Q12 75 25 79 T50 79 T75 79 T100 80" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/** The mark: the bathhouse sign, a capybara under a yuzu on noren indigo. */
export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <rect x="3" y="3" width="114" height="114" fill="#1c2d5a" stroke={INK} strokeWidth="6" />
      <g transform="translate(16 22) scale(0.88)">
        <CapyHead traits={[0, 0, 0, 0]} yuzu />
      </g>
    </svg>
  );
}

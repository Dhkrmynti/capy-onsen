/**
 * A client's portrait: a cartoon head and shoulders in a white shirt and tie, the way a
 * private client sits for the house. Every wallet gets one generated from its address;
 * holders can pick their own at the desk. Drawn flat in SVG, so it costs nothing to show.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts (the slot keys are kept for the engine).
 */
import type { CSSProperties, ReactNode } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = skin, hat = hair, acc = tie, bg = backdrop. */
export const PART_NAMES = {
  fur: ["Porcelain", "Peach", "Honey", "Bronze", "Umber"],
  hat: ["Side part", "Slicked back", "Curls", "Bob", "Bun"],
  acc: ["Navy tie", "Claret tie", "Gold tie", "Green tie", "Bow tie", "Striped tie"],
  bg: ["Ivory", "Cream", "Linen", "Navy", "Money green", "Black"],
};

const INK = "#1c1913";
const SKIN = ["#f6dcc8", "#efc2a0", "#d9a274", "#b07a4f", "#7a4f32"];
const HAIR = ["#2a1d14", "#5a3a22", "#8a5a2b", "#c9a45c", "#3b3b3f"];
const TIE = ["#24375c", "#7a1f2b", "#c9a045", "#24553a", "#1b1a18", "#24375c"];
const PAPER = ["#f4f1e8", "#efe6cf", "#e2dccb", "#1c2d4d", "#2e5c41", "#1b1a18"];

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

const line = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Hair drawn over the head; the bob also falls behind the ears. */
function Hair({ kind, c }: { kind: number; c: string }): ReactNode {
  if (kind === 1)
    return (
      <g>
        <path d="M29.5 41 C 29 24, 41 16.5, 52 17.5 C 64 18.5, 71 27, 70.5 41 C 66 31.5, 58 28, 49 28.5 C 40 29, 33 33, 29.5 41 Z" fill={c} {...line} />
        <path d="M40 23 C 46 21, 54 21, 60 23.5" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    );
  if (kind === 2)
    return (
      <g fill={c} {...line}>
        {[
          [34, 34],
          [39, 26],
          [47, 22],
          [55, 22],
          [62, 26],
          [67, 34],
          [43, 30],
          [52, 28],
          [60, 31],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} />
        ))}
      </g>
    );
  if (kind === 3)
    return <path d="M27.5 56 C 23.5 30, 36 17, 50 17 C 64 17, 76.5 30, 72.5 56 L 66 56 C 67.5 40, 61 31, 50 31 C 39 31, 32.5 40, 34 56 Z" fill={c} {...line} />;
  if (kind === 4)
    return (
      <g>
        <circle cx="50" cy="15" r="7.5" fill={c} {...line} />
        <path d="M29.5 43 C 28.5 26, 39 19, 50 19 C 61 19, 71.5 26, 70.5 43 C 66 33, 58 29, 50 29 C 42 29, 34 33, 29.5 43 Z" fill={c} {...line} />
      </g>
    );
  // side part
  return (
    <g>
      <path d="M29.5 42 C 28.5 25, 40 17.5, 51 18 C 63 18.5, 72 26, 70.5 42 C 67 33, 61 29, 53 29 L 44 29.5 C 37.5 31, 32.5 35, 29.5 42 Z" fill={c} {...line} />
      <path d="M44 20 C 42 24, 42 27, 44 29.5" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

function Tie({ kind, c }: { kind: number; c: string }): ReactNode {
  if (kind === 4)
    return (
      <g fill={c} {...line} strokeWidth={1.8}>
        <path d="M50 84 L 40 79 L 40 89 Z" />
        <path d="M50 84 L 60 79 L 60 89 Z" />
        <circle cx="50" cy="84" r="2.6" />
      </g>
    );
  return (
    <g>
      <path d="M46 80.5 L 54 80.5 L 52.6 86.5 L 47.4 86.5 Z" fill={c} {...line} strokeWidth={1.8} />
      <path d="M47.4 86.5 L 52.6 86.5 L 56.5 101 L 43.5 101 Z" fill={c} {...line} strokeWidth={1.8} />
      {kind === 5 ? <path d="M45 92 L 55 89.5 M44.4 97 L 55.8 94" stroke="#e8c16e" strokeWidth="1.8" /> : null}
    </g>
  );
}

export function Mugshot({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const [skin, hair, tie, paper] = traits;
  const s = SKIN[skin] ?? SKIN[0];
  const h = HAIR[(hair + skin) % HAIR.length];
  const t = TIE[tie] ?? TIE[0];
  return (
    <svg className={`mugshot ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={PAPER[paper] ?? PAPER[0]} />
      {/* a soft halo behind the sitter */}
      <circle cx="50" cy="48" r="36" fill="#ffffff" fillOpacity={paper >= 3 ? 0.08 : 0.35} />
      {hair === 3 ? <path d="M27.5 56 C 26 62, 30 66, 34 66 L 66 66 C 70 66, 74 62, 72.5 56 Z" fill={h} {...line} /> : null}
      {/* shoulders: a white shirt */}
      <path d="M8 101 C 10 84, 23 75.5, 38 73 L 62 73 C 77 75.5, 90 84, 92 101 Z" fill="#f8f6f0" {...line} />
      <path d="M31 87 C 30 92, 30 96, 31 101 M69 87 C 70 92, 70 96, 69 101" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.4" />
      {/* neck */}
      <path d="M42.5 60 L 57.5 60 L 57.5 73 L 50 80 L 42.5 73 Z" fill={s} {...line} />
      <path d="M43 68 C 47 71, 53 71, 57 68" fill="none" stroke={INK} strokeOpacity="0.18" strokeWidth="1.6" />
      {/* the tie, then the collar points over its knot */}
      <Tie kind={tie} c={t} />
      <path d="M39.5 71.5 L 50 81 L 43.5 88 L 35.5 76 Z" fill="#ffffff" {...line} strokeWidth={1.8} />
      <path d="M60.5 71.5 L 50 81 L 56.5 88 L 64.5 76 Z" fill="#ffffff" {...line} strokeWidth={1.8} />
      {/* ears, then the head */}
      <circle cx="30" cy="46" r="4.6" fill={s} {...line} />
      <circle cx="70" cy="46" r="4.6" fill={s} {...line} />
      <ellipse cx="50" cy="43" rx="20.5" ry="22.5" fill={s} {...line} />
      <Hair kind={hair} c={h} />
      {/* face */}
      <path d="M38.5 38 L 45 37 M55 37 L 61.5 38" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="42.5" cy="44" r="2.3" fill={INK} />
      <circle cx="57.5" cy="44" r="2.3" fill={INK} />
      <circle cx="43.2" cy="43.2" r="0.7" fill="#fff" />
      <circle cx="58.2" cy="43.2" r="0.7" fill="#fff" />
      <ellipse cx="38" cy="51" rx="3.4" ry="2" fill="#e8806b" fillOpacity="0.28" />
      <ellipse cx="62" cy="51" rx="3.4" ry="2" fill="#e8806b" fillOpacity="0.28" />
      <path d="M48.5 46.5 C 47.5 49, 48 50.5, 50.5 50.5" fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M43.5 54.5 C 46.5 58, 53.5 58, 56.5 54.5" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/**
 * A crew portrait: a cartoon astronaut, head and shoulders, face behind the visor. Every
 * wallet gets one generated from its address; holders can pick their own at the desk.
 * Drawn flat in SVG, so it costs nothing to show.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts (the slot keys are kept for the engine).
 */
import { useId, type CSSProperties, type ReactNode } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = skin, hat = suit, acc = kit (patch, antenna, lamps or visor), bg = backdrop. */
export const PART_NAMES = {
  fur: ["Porcelain", "Peach", "Honey", "Bronze", "Umber"],
  hat: ["White suit", "Rescue orange", "Silver suit", "Hazard yellow", "Black suit"],
  acc: ["Hazard patch", "Orbit patch", "Star patch", "Antenna", "Headlamps", "Gold visor"],
  bg: ["Deep space", "Hazard yellow", "Signal red", "Mission blue", "Pad green", "Steel"],
};

const INK = "#121212";
const SKIN = ["#f6dcc8", "#efc2a0", "#d9a274", "#b07a4f", "#7a4f32"];
const SUIT = ["#f4f4f0", "#ff7a1a", "#c4c8cc", "#ffd100", "#4a4f57"];
const BACK = ["#121212", "#ffd100", "#d52b1e", "#0057b8", "#00843d", "#3a3e44"];
const STARS = [
  [12, 14, 1.1],
  [86, 10, 0.9],
  [90, 34, 1.3],
  [8, 40, 0.8],
  [18, 64, 1],
  [84, 60, 0.8],
  [70, 6, 0.7],
];

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

/** The chest patch on the left shoulder; kits 3-5 sit on the helmet instead. */
function Patch({ kind, id }: { kind: number; id: string }): ReactNode {
  if (kind === 0)
    return (
      <g>
        <clipPath id={`${id}-p`}>
          <rect x="23" y="84" width="11" height="11" />
        </clipPath>
        <g clipPath={`url(#${id}-p)`}>
          <rect x="23" y="84" width="11" height="11" fill="#ffd100" />
          {[0, 5, 10, 15].map((o) => (
            <path key={o} d={`M${19 + o} 95 L ${25 + o} 84`} stroke={INK} strokeWidth="2.4" />
          ))}
        </g>
        <rect x="23" y="84" width="11" height="11" fill="none" {...line} strokeWidth={1.6} />
      </g>
    );
  if (kind === 1)
    return (
      <g>
        <circle cx="28.5" cy="89.5" r="6" fill="#0057b8" {...line} strokeWidth={1.6} />
        <circle cx="28.5" cy="89.5" r="2.2" fill="#121212" />
        <ellipse cx="28.5" cy="89.5" rx="5" ry="1.8" fill="none" stroke="#ff9e1b" strokeWidth="1.2" transform="rotate(-20 28.5 89.5)" />
      </g>
    );
  if (kind === 2)
    return (
      <g>
        <circle cx="28.5" cy="89.5" r="6" fill="#d52b1e" {...line} strokeWidth={1.6} />
        <path d="M28.5 85.4 L 29.7 88.3 L 32.6 88.4 L 30.3 90.2 L 31.1 93.2 L 28.5 91.4 L 25.9 93.2 L 26.7 90.2 L 24.4 88.4 L 27.3 88.3 Z" fill="#f4f4f0" />
      </g>
    );
  return <rect x="24" y="86" width="9" height="6" rx="1" fill="#d52b1e" {...line} strokeWidth={1.4} />;
}

export function Mugshot({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const id = useId().replace(/:/g, "");
  const [skin, suit, kit, back] = traits;
  const s = SKIN[skin] ?? SKIN[0];
  const c = SUIT[suit] ?? SUIT[0];
  const dark = back === 0 || back === 5;
  return (
    <svg className={`mugshot ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={BACK[back] ?? BACK[0]} />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity={dark ? 0.85 : 0.45} />
      ))}
      {/* the suit: shoulders, the neck ring, the chest unit */}
      <path d="M6 101 C 8 84, 21 74, 37 71 L 63 71 C 79 74, 92 84, 94 101 Z" fill={c} {...line} />
      <path d="M22 84 C 20 90, 19 95, 19 101 M78 84 C 80 90, 81 95, 81 101" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.4" />
      <rect x="40" y="81" width="20" height="13" rx="2" fill="#3a3e44" {...line} strokeWidth={1.8} />
      <circle cx="45" cy="87.5" r="2" fill="#d52b1e" />
      <circle cx="50.5" cy="87.5" r="2" fill="#ffd100" />
      <rect x="54" y="85.5" width="3.5" height="4" fill="#9cc3f0" />
      <Patch kind={kit} id={id} />
      <rect x="66" y="85" width="12" height="4" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1.3" />
      <path d="M34 73 C 40 78, 60 78, 66 73 L 64 68 C 58 72, 42 72, 36 68 Z" fill="#a3a6ab" {...line} strokeWidth={1.8} />
      {/* kit on the helmet, behind it */}
      {kit === 3 ? (
        <g>
          <path d="M69 25 L 77 9" {...line} fill="none" />
          <circle cx="77.5" cy="8" r="2.6" fill="#d52b1e" {...line} strokeWidth={1.6} />
        </g>
      ) : null}
      {/* the helmet */}
      <circle cx="50" cy="44" r="28" fill={c} {...line} />
      <circle cx="23.5" cy="47" r="4" fill="#a3a6ab" {...line} strokeWidth={1.8} />
      <circle cx="76.5" cy="47" r="4" fill="#a3a6ab" {...line} strokeWidth={1.8} />
      {kit === 4 ? (
        <g>
          <rect x="27" y="22" width="9" height="6" rx="1.5" fill="#3a3e44" {...line} strokeWidth={1.6} transform="rotate(-35 31.5 25)" />
          <rect x="64" y="22" width="9" height="6" rx="1.5" fill="#3a3e44" {...line} strokeWidth={1.6} transform="rotate(35 68.5 25)" />
          <circle cx="31.5" cy="25" r="2" fill="#ffd100" />
          <circle cx="68.5" cy="25" r="2" fill="#ffd100" />
        </g>
      ) : null}
      {/* the visor and the face behind it */}
      <clipPath id={`${id}-v`}>
        <ellipse cx="50" cy="46" rx="20" ry="19" />
      </clipPath>
      <ellipse cx="50" cy="46" rx="20" ry="19" fill="#1f2a38" />
      <g clipPath={`url(#${id}-v)`}>
        <ellipse cx="50" cy="49" rx="15.5" ry="17" fill={s} {...line} strokeWidth={1.8} />
        <path d="M41 42 L 46 41.2 M54 41.2 L 59 42" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="44" cy="47" r="2" fill={INK} />
        <circle cx="56" cy="47" r="2" fill={INK} />
        <circle cx="44.6" cy="46.3" r="0.6" fill="#fff" />
        <circle cx="56.6" cy="46.3" r="0.6" fill="#fff" />
        <ellipse cx="40.5" cy="53" rx="2.8" ry="1.7" fill="#e8806b" fillOpacity="0.3" />
        <ellipse cx="59.5" cy="53" rx="2.8" ry="1.7" fill="#e8806b" fillOpacity="0.3" />
        <path d="M45.5 55.5 C 48 58.5, 52 58.5, 54.5 55.5" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        {kit === 5 ? <rect x="28" y="20" width="44" height="31" fill="#d9a63a" fillOpacity="0.92" /> : null}
        {kit === 5 ? <path d="M30 51 L 70 51" stroke={INK} strokeWidth="1.6" /> : null}
        {/* glass: a tint and a highlight */}
        <ellipse cx="50" cy="46" rx="20" ry="19" fill="#9cc3f0" fillOpacity="0.12" />
        <path d="M36 36 C 39 30, 45 28, 50 28" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="62" cy="33" r="1.6" fill="#fff" fillOpacity="0.6" />
      </g>
      <ellipse cx="50" cy="46" rx="20" ry="19" fill="none" {...line} />
      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

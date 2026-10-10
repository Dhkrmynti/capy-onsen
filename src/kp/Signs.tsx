/**
 * Safety signs in the ISO 7010 grammar, drawn as geometry: a yellow warning triangle, a red
 * prohibition circle, a blue mandatory disc, a green safe-condition square, and the few
 * pictograms the facility needs. Icon-sized or plate-sized, always one hard black outline.
 */
import type { ReactNode } from "react";

export const HZ = { yellow: "#ffd100", black: "#121212", red: "#d52b1e", blue: "#0057b8", green: "#00843d", white: "#f4f4f0" } as const;

export type Pict = "hole" | "sell" | "coins" | "core" | "vault" | "flame" | "hand";

/** Pictograms on a 100×100 field, centred, black unless told otherwise. */
export function Pictogram({ kind, color = HZ.black }: { kind: Pict; color?: string }) {
  switch (kind) {
    case "hole":
      return (
        <g fill="none" stroke={color} strokeWidth="6">
          <ellipse cx="50" cy="52" rx="34" ry="11" transform="rotate(-14 50 52)" />
          <circle cx="50" cy="50" r="14" fill={color} stroke="none" />
        </g>
      );
    case "sell":
      return (
        <g fill={color}>
          <ellipse cx="38" cy="66" rx="20" ry="7" />
          <rect x="18" y="52" width="40" height="14" />
          <ellipse cx="38" cy="52" rx="20" ry="7" fill={HZ.white} stroke={color} strokeWidth="4" />
          <path d="M58 40 L 78 22 M78 22 L 62 22 M78 22 L 78 38" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>
      );
    case "coins":
      return (
        <g fill={color}>
          {[64, 50, 36].map((y) => (
            <g key={y}>
              <rect x="28" y={y} width="44" height="10" />
              <ellipse cx="50" cy={y + 10} rx="22" ry="6" />
              <ellipse cx="50" cy={y} rx="22" ry="6" fill={HZ.white} stroke={color} strokeWidth="3.5" />
            </g>
          ))}
        </g>
      );
    case "core":
      return (
        <g fill={color}>
          <circle cx="50" cy="50" r="10" />
          {[0, 120, 240].map((a) => (
            <path key={a} d="M50 50 L 34 22 A 32 32 0 0 1 66 22 Z" transform={`rotate(${a} 50 50)`} />
          ))}
        </g>
      );
    case "vault":
      return (
        <g fill="none" stroke={color} strokeWidth="6">
          <rect x="22" y="26" width="56" height="50" rx="4" />
          <circle cx="50" cy="51" r="11" />
          <path d="M50 40 V 46 M50 56 V 62 M39 51 H 45 M55 51 H 61" strokeWidth="4" />
          <path d="M30 76 V 82 M70 76 V 82" />
        </g>
      );
    case "flame":
      return <path d="M50 16 C 64 34, 74 44, 72 60 C 70 74, 60 82, 50 82 C 40 82, 30 74, 28 60 C 27 48, 36 40, 42 30 C 44 42, 50 46, 54 44 C 58 36, 54 26, 50 16 Z" fill={color} />;
    case "hand":
      return (
        <g fill={color}>
          <rect x="30" y="44" width="40" height="34" rx="8" />
          {[30, 40, 50, 60].map((x) => (
            <rect key={x} x={x} y="20" width="9" height="34" rx="4.5" />
          ))}
          <rect x="18" y="46" width="16" height="9" rx="4.5" transform="rotate(-30 26 50)" />
        </g>
      );
  }
}

type SignProps = { size?: number; kind: Pict; className?: string; title?: string };
function Svg({ size = 64, className = "", title, children }: { size?: number; className?: string; title?: string; children: ReactNode }) {
  return (
    <svg className={`sign ${className}`} viewBox="0 0 120 120" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {children}
    </svg>
  );
}

/** Warning: yellow triangle, black border and pictogram. */
export function Warn({ size, kind, className, title }: SignProps) {
  return (
    <Svg size={size} className={className} title={title}>
      <path d="M60 6 L 115 108 H 5 Z" fill={HZ.yellow} stroke={HZ.black} strokeWidth="9" strokeLinejoin="round" />
      <g transform="translate(30 46) scale(0.6)">
        <Pictogram kind={kind} />
      </g>
    </Svg>
  );
}

/** Prohibition: red ring and bar over a black pictogram. */
export function Prohibit({ size, kind, className, title }: SignProps) {
  return (
    <Svg size={size} className={className} title={title}>
      <circle cx="60" cy="60" r="52" fill={HZ.white} />
      <g transform="translate(22 22) scale(0.76)">
        <Pictogram kind={kind} />
      </g>
      <circle cx="60" cy="60" r="49" fill="none" stroke={HZ.red} strokeWidth="11" />
      <path d="M26 26 L 94 94" stroke={HZ.red} strokeWidth="11" />
    </Svg>
  );
}

/** Mandatory action: blue disc, white pictogram. */
export function Mandatory({ size, kind, className, title }: SignProps) {
  return (
    <Svg size={size} className={className} title={title}>
      <circle cx="60" cy="60" r="55" fill={HZ.blue} />
      <g transform="translate(20 20) scale(0.8)">
        <Pictogram kind={kind} color={HZ.white} />
      </g>
    </Svg>
  );
}

/** Safe condition / information: green square, white pictogram. */
export function Safe({ size, kind, className, title }: SignProps) {
  return (
    <Svg size={size} className={className} title={title}>
      <rect x="5" y="5" width="110" height="110" rx="6" fill={HZ.green} />
      <g transform="translate(20 20) scale(0.8)">
        <Pictogram kind={kind} color={HZ.white} />
      </g>
    </Svg>
  );
}

/**
 * The board's pieces, drawn as chunky toy pieces: flat fill, one hard ink outline, a base plate.
 * No Unicode chess glyphs: these are the board's own set, so they read the same on every device.
 */
import type { CSSProperties } from "react";

export type PieceKind = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

const INK = "var(--ink, #170c29)";
const stroke = { stroke: INK, strokeWidth: 3.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Body({ kind }: { kind: PieceKind }) {
  switch (kind) {
    case "king":
      return (
        <>
          <path d="M28 6 h8 v6 h6 v7 h-6 v6 h-8 v-6 h-6 v-7 h6 z" />
          <path d="M18 30 C 18 25, 46 25, 46 30 L 43 46 H 21 Z" />
          <rect x="19" y="45" width="26" height="6" rx="2" />
        </>
      );
    case "queen":
      return (
        <>
          <circle cx="32" cy="10" r="4.5" />
          <path d="M16 20 L 22 40 H 42 L 48 20 L 40 28 L 32 16 L 24 28 Z" />
          <rect x="19" y="40" width="26" height="7" rx="2" />
        </>
      );
    case "rook":
      return (
        <>
          <path d="M17 10 h7 v5 h5 v-5 h6 v5 h5 v-5 h7 v12 l-4 4 v15 h-26 v-15 l-4 -4 z" />
          <rect x="18" y="41" width="28" height="6" rx="2" />
        </>
      );
    case "bishop":
      return (
        <>
          <circle cx="32" cy="8" r="3.6" />
          <path d="M32 12 C 21 20, 21 32, 25 37 H 39 C 43 32, 43 20, 32 12 Z" />
          <path d="M33 20 L 28 29" fill="none" />
          <rect x="21" y="37" width="22" height="5" rx="2" />
          <path d="M19 42 h26 v5 h-26 z" />
        </>
      );
    case "knight":
      return (
        <>
          <path d="M22 46 C 22 36, 30 31, 29 25 C 25 27, 21 29, 17 26 C 15 24, 16 20, 20 18 C 25 12, 30 8, 36 8 C 45 9, 49 20, 47 30 C 46 37, 44 42, 44 46 Z" />
          <circle cx="33" cy="16" r="2" fill={INK} stroke="none" />
          <rect x="19" y="45" width="28" height="6" rx="2" />
        </>
      );
    default:
      return (
        <>
          <circle cx="32" cy="17" r="8" />
          <path d="M24 26 C 24 24, 40 24, 40 26 L 43 41 H 21 Z" />
          <rect x="18" y="41" width="28" height="6" rx="2" />
        </>
      );
  }
}

/** A piece. `tone` picks the fill: cream for the light side, crown orange for the King. */
export function Piece({ kind, size = 40, tone = "cream", lying = false, className = "", style, title }: { kind: PieceKind; size?: number; tone?: "cream" | "crown" | "violet" | "lime" | "ink"; lying?: boolean; className?: string; style?: CSSProperties; title?: string }) {
  const fill = { cream: "#fff6e3", crown: "#ff7a1a", violet: "#6c3bff", lime: "#c6f432", ink: "#2a1a47" }[tone];
  return (
    <svg
      className={`piece ${lying ? "is-lying" : ""} ${className}`}
      viewBox="0 0 64 56"
      width={size}
      height={(size * 56) / 64}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={style}
    >
      <g fill={fill} {...stroke}>
        <Body kind={kind} />
      </g>
    </svg>
  );
}

/** The piece a rank plays on the board: No. 1 the King, 2–5 the Court, 6–10 the Guard. */
export function pieceFor(rank: number): PieceKind {
  if (rank === 1) return "king";
  if (rank === 2) return "queen";
  if (rank === 3) return "rook";
  if (rank === 4) return "bishop";
  if (rank === 5) return "knight";
  return "pawn";
}

/** The Kingpins mark: a crown pierced by a pin. */
export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="9" fill="#c6f432" stroke={INK} strokeWidth="3" />
      <path d="M10 33 L 12 16 L 19 24 L 24 12 L 29 24 L 36 16 L 38 33 Z" fill="#ff7a1a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="10" y="33" width="28" height="5" rx="1.5" fill="#fff6e3" stroke={INK} strokeWidth="3" />
      <circle cx="24" cy="12" r="2.6" fill="#fff6e3" stroke={INK} strokeWidth="2.4" />
    </svg>
  );
}

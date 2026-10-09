/**
 * The hoard's tokens, drawn flat with one hard ink outline: the dragon (No. 1), gems (No. 2–5),
 * coin stacks (No. 6–10), and a scorched coin for the burned. Kept under the old names so the
 * ladder code that places them did not have to change.
 */
import type { CSSProperties } from "react";

export type PieceKind = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
const INK = "#1a0f0d";
const st = { stroke: INK, strokeWidth: 3.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Dragon() {
  return (
    <>
      <path d="M14 40 C 10 28, 18 16, 32 14 C 44 12, 54 20, 54 30 C 54 36, 50 40, 44 41 L 46 48 L 38 44 L 30 48 L 30 42 C 22 44, 16 44, 14 40 Z" fill="#2fbf71" />
      <path d="M22 16 L 18 4 L 28 13 Z" fill="#f3e9d2" />
      <path d="M36 13 L 40 2 L 44 15 Z" fill="#f3e9d2" />
      <circle cx="40" cy="26" r="4.5" fill="#ffcf3a" />
      <path d="M40 23 L 40 29" stroke={INK} strokeWidth="2.4" />
      <path d="M46 36 C 49 35, 51 34, 52 32" fill="none" />
    </>
  );
}
function Gem({ c }: { c: string }) {
  return (
    <>
      <path d="M14 22 L 24 10 H 40 L 50 22 L 32 48 Z" fill={c} />
      <path d="M14 22 H 50 M24 10 L 28 22 L 32 48 M40 10 L 36 22 L 32 48" fill="none" />
    </>
  );
}
function Coins() {
  return (
    <>
      <ellipse cx="32" cy="44" rx="18" ry="6" fill="#d9a21e" />
      <path d="M14 40 V 44 C 14 48, 50 48, 50 44 V 40" fill="#d9a21e" />
      <ellipse cx="32" cy="34" rx="18" ry="6" fill="#ffc83d" />
      <path d="M14 30 V 34 C 14 38, 50 38, 50 34 V 30" fill="#ffc83d" />
      <ellipse cx="32" cy="24" rx="18" ry="6" fill="#ffe08a" />
      <path d="M14 20 V 24 C 14 28, 50 28, 50 24 V 20" fill="#ffe08a" />
      <ellipse cx="32" cy="20" rx="18" ry="6" fill="#fff0bd" />
    </>
  );
}
function Burnt() {
  return (
    <>
      <ellipse cx="32" cy="30" rx="20" ry="20" fill="#5b4038" />
      <path d="M22 22 L 42 38 M42 22 L 22 38" fill="none" stroke="#ff6a1f" strokeWidth="4" />
    </>
  );
}

const GEMS: Record<PieceKind, string> = { king: "", queen: "#e2341d", rook: "#38c7ff", bishop: "#7c5cff", knight: "#2fd18a", pawn: "" };

export function Piece({ kind, size = 40, lying = false, className = "", style, title }: { kind: PieceKind; size?: number; tone?: string; lying?: boolean; className?: string; style?: CSSProperties; title?: string }) {
  return (
    <svg className={`piece ${className}`} viewBox="0 0 64 56" width={size} height={(size * 56) / 64} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <g {...st}>{lying ? <Burnt /> : kind === "king" ? <Dragon /> : kind === "pawn" ? <Coins /> : <Gem c={GEMS[kind]} />}</g>
    </svg>
  );
}

/** No. 1 the dragon, 2–5 a gem each, 6–10 coin stacks. */
export function pieceFor(rank: number): PieceKind {
  return (["king", "queen", "rook", "bishop", "knight"] as PieceKind[])[rank - 1] ?? "pawn";
}

/** The Hoard mark: a dragon's eye over a coin. */
export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#ffc83d" stroke={INK} strokeWidth="3" />
      <path d="M8 24 C 14 13, 34 13, 40 24 C 34 35, 14 35, 8 24 Z" fill="#2fbf71" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 15 C 21 20, 21 28, 24 33 C 27 28, 27 20, 24 15 Z" fill={INK} />
    </svg>
  );
}

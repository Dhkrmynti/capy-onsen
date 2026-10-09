/** Kingpins ($KING): the board in play. Same palette, type and pieces as kingpins.fun. */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadDela } from "@remotion/google-fonts/DelaGothicOne";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadMono } from "@remotion/google-fonts/MartianMono";

export const K = {
  grape0: "#170c29",
  grape1: "#22133d",
  grape2: "#362262",
  ink: "#170c29",
  edge: "#5b3fa8",
  violet: "#6c3bff",
  violetDeep: "#4b1fd8",
  violetSoft: "#b9a3ff",
  lime: "#c6f432",
  cream: "#fff6e3",
  cream2: "#d6cbee",
  crown: "#ff7a1a",
  exile: "#ff4d6a",
};

export const KF = {
  display: loadDela("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  body: loadArchivo("normal", { weights: ["400", "600", "800"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const back = (t: number) => {
  const c1 = 1.7;
  const c3 = c1 + 1;
  const k = Math.min(1, Math.max(0, t)) - 1;
  return 1 + c3 * k * k * k + c1 * k * k;
};

/** A still from the site, pushed in slowly, dimmed so type reads on it. */
export function Plate({ src, from = 1.03, to = 1.1, dark = 0.4, origin = "50% 50%", tint = K.grape0 }: { src: string; from?: number; to?: number; dark?: number; origin?: string; tint?: string }) {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 300], [from, to], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: K.grape0 }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`, transformOrigin: origin }} />
      <AbsoluteFill style={{ background: tint, opacity: dark }} />
    </AbsoluteFill>
  );
}

export function Head({ children, size = 110, color = K.cream, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: KF.display, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.02em", color, textShadow: `0 ${Math.round(size / 16)}px 0 ${K.ink}`, ...style }}>{children}</div>;
}

export function Body({ children, size = 34, color = K.cream, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: KF.body, fontWeight: 600, fontSize: size, lineHeight: 1.35, color, ...style }}>{children}</div>;
}

export function Mono({ children, size = 24, color = K.cream, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: KF.mono, fontWeight: 600, fontSize: size, color, fontVariantNumeric: "tabular-nums", ...style }}>{children}</div>;
}

/** A printed board-game token: ink outline, hard base shadow. */
export function Token({ children, bg = K.lime, color = K.ink, style }: { children: ReactNode; bg?: string; color?: string; style?: CSSProperties }) {
  return <div style={{ border: `5px solid ${K.ink}`, borderRadius: 18, background: bg, color, boxShadow: `0 10px 0 ${K.ink}`, ...style }}>{children}</div>;
}

/** The Kingpins mark: a crown on a lime square. */
export function Mark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="2" y="2" width="44" height="44" rx="9" fill={K.lime} stroke={K.ink} strokeWidth="3" />
      <path d="M10 33 L 12 16 L 19 24 L 24 12 L 29 24 L 36 16 L 38 33 Z" fill={K.crown} stroke={K.ink} strokeWidth="3" strokeLinejoin="round" />
      <rect x="10" y="33" width="28" height="5" rx="1.5" fill={K.cream} stroke={K.ink} strokeWidth="3" />
      <circle cx="24" cy="12" r="2.6" fill={K.cream} stroke={K.ink} strokeWidth="2.4" />
    </svg>
  );
}

export type PieceKind = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
/** The board's toy pieces, the same set the site draws. */
export function Piece({ kind, size = 120, fill = K.cream, style }: { kind: PieceKind; size?: number; fill?: string; style?: CSSProperties }) {
  const st = { stroke: K.ink, strokeWidth: 3.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const body = {
    king: (
      <>
        <path d="M28 6 h8 v6 h6 v7 h-6 v6 h-8 v-6 h-6 v-7 h6 z" />
        <path d="M18 30 C 18 25, 46 25, 46 30 L 43 46 H 21 Z" />
        <rect x="19" y="45" width="26" height="6" rx="2" />
      </>
    ),
    queen: (
      <>
        <circle cx="32" cy="10" r="4.5" />
        <path d="M16 20 L 22 40 H 42 L 48 20 L 40 28 L 32 16 L 24 28 Z" />
        <rect x="19" y="40" width="26" height="7" rx="2" />
      </>
    ),
    rook: (
      <>
        <path d="M17 10 h7 v5 h5 v-5 h6 v5 h5 v-5 h7 v12 l-4 4 v15 h-26 v-15 l-4 -4 z" />
        <rect x="18" y="41" width="28" height="6" rx="2" />
      </>
    ),
    bishop: (
      <>
        <circle cx="32" cy="8" r="3.6" />
        <path d="M32 12 C 21 20, 21 32, 25 37 H 39 C 43 32, 43 20, 32 12 Z" />
        <rect x="21" y="37" width="22" height="5" rx="2" />
        <path d="M19 42 h26 v5 h-26 z" />
      </>
    ),
    knight: (
      <>
        <path d="M22 46 C 22 36, 30 31, 29 25 C 25 27, 21 29, 17 26 C 15 24, 16 20, 20 18 C 25 12, 30 8, 36 8 C 45 9, 49 20, 47 30 C 46 37, 44 42, 44 46 Z" />
        <rect x="19" y="45" width="28" height="6" rx="2" />
      </>
    ),
    pawn: (
      <>
        <circle cx="32" cy="17" r="8" />
        <path d="M24 26 C 24 24, 40 24, 40 26 L 43 41 H 21 Z" />
        <rect x="18" y="41" width="28" height="6" rx="2" />
      </>
    ),
  }[kind];
  return (
    <svg width={size} height={(size * 56) / 64} viewBox="0 0 64 56" style={{ overflow: "visible", filter: `drop-shadow(0 ${size / 20}px 0 ${K.ink})`, ...style }}>
      <g fill={fill} {...st}>
        {body}
      </g>
    </svg>
  );
}

/** A toy crown, flat-drawn, for stills and motion where the 3D one isn't needed. */
export function Crown({ size = 300, style }: { size?: number; style?: CSSProperties }) {
  const pts = [0, 1, 2, 3, 4];
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 200 156" style={{ overflow: "visible", ...style }}>
      <path d="M18 120 L 26 44 L 62 86 L 100 26 L 138 86 L 174 44 L 182 120 Z" fill={K.crown} stroke={K.ink} strokeWidth="8" strokeLinejoin="round" />
      <rect x="14" y="116" width="172" height="28" rx="8" fill={K.cream} stroke={K.ink} strokeWidth="8" />
      {pts.map((i) => {
        const x = [26, 62, 100, 138, 174][i];
        const y = [44, 86, 26, 86, 44][i];
        return <circle key={i} cx={x} cy={y - (i % 2 ? 0 : 6)} r="11" fill={K.cream} stroke={K.ink} strokeWidth="6" />;
      })}
      {[50, 100, 150].map((x, i) => (
        <rect key={x} x={x - 11} y="122" width="22" height="16" rx="3" fill={i === 1 ? K.violet : K.lime} stroke={K.ink} strokeWidth="5" />
      ))}
    </svg>
  );
}

/** An 8x8 lime/violet board, flat, used as a field. */
export function BoardField({ cell = 135, style }: { cell?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${cell}px)`, border: `10px solid ${K.ink}`, ...style }}>
      {Array.from({ length: 64 }, (_, i) => (
        <div key={i} style={{ width: cell, height: cell, background: (Math.floor(i / 8) + i) % 2 ? K.violetDeep : K.lime }} />
      ))}
    </div>
  );
}

export function Sig({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, ...style }}>
      <Mark size={52} />
      <div>
        <div style={{ fontFamily: KF.display, fontSize: 28, color: K.cream }}>KINGPINS</div>
        <div style={{ fontFamily: KF.mono, fontWeight: 600, fontSize: 16, color: K.lime }}>kingpins.fun</div>
      </div>
    </div>
  );
}

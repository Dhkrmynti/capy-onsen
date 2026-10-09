/**
 * The Kingpins world mapped onto the token names the shared video scenes were written with, so the
 * tutorial, the simulation and the gauge render in lime / violet / crown with Dela Gothic and mono.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Crown, K, KF, Mark, Piece, clamp, ease, easeInOut, ramp } from "./KPTheme";

export const H = {
  v0: K.grape0,
  v1: K.grape1,
  v2: K.grape2,
  gold: K.lime,
  gold2: K.lime,
  goldPale: K.lime,
  goldDeep: K.ink,
  ivory: K.cream,
  paper: K.cream,
  ink: K.ink,
  ink2: "#4a3a6b",
  deedBlue: K.violetDeep,
  text: K.cream,
  text2: K.cream2,
  feeding: K.lime,
  keeper: K.violet,
  sink: K.crown,
  wax: K.exile,
  fire: K.crown,
};

export const HF = {
  display: KF.display,
  displayItalic: KF.display,
  serif: KF.body,
  serifItalic: KF.body,
  caps: KF.body,
  data: KF.mono,
};

export { clamp, ease, easeInOut, ramp };

export function Plate({ src, from = 1.03, to = 1.1, dark = 0.55, origin = "50% 50%", style }: { src: string; from?: number; to?: number; dark?: number; origin?: string; style?: CSSProperties }) {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 300], [from, to], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: K.grape0, ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`, transformOrigin: origin }} />
      <AbsoluteFill style={{ background: K.grape0, opacity: dark }} />
    </AbsoluteFill>
  );
}

export function Caps({ children, size = 22, color = K.lime, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: KF.body, fontWeight: 800, fontSize: size, letterSpacing: "0.04em", color, ...style }}>{children}</div>;
}

export function Head({ children, size = 96, color = K.cream, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: KF.display, fontSize: size, lineHeight: 0.98, letterSpacing: "-0.02em", color, textShadow: `0 ${Math.max(3, Math.round(size / 18))}px 0 ${K.ink}`, ...style }}>{children}</div>;
}

export function Body({ children, size = 34, color = K.cream2, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: KF.body, fontWeight: 600, fontSize: size, lineHeight: 1.38, color, ...style }}>{children}</div>;
}

/** Where the Heirloom scenes spun a coin, Kingpins drops the crown on a turning King. */
export function Coin({ size = 400, turn = 0 }: { size?: number; turn?: number; glow?: number; id?: string }) {
  return (
    <div style={{ width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
      <Crown size={size * 0.62} style={{ marginBottom: -size * 0.08, zIndex: 1, rotate: `${Math.sin(turn) * 6}deg` }} />
      <Piece kind="king" size={size * 0.62} fill={K.crown} style={{ transform: `scaleX(${0.75 + Math.abs(Math.cos(turn)) * 0.25})` }} />
    </div>
  );
}

export function Sig({ style }: { dark?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, ...style }}>
      <Mark size={48} />
      <div>
        <div style={{ fontFamily: KF.display, fontSize: 24, color: K.cream }}>KINGPINS</div>
        <div style={{ fontFamily: KF.mono, fontWeight: 600, fontSize: 15, color: K.lime }}>kingpins.fun</div>
      </div>
    </div>
  );
}

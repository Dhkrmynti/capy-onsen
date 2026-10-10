/**
 * Horizon ($VOID): a physics figure about a black hole. White hairlines on the void, journal
 * captions in STIX italic, data in Geist Mono, one accretion orange. Same look as thehorizon.fun.
 * Also exports the token names the shared tutorial / simulation scenes were written with.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadStix } from "@remotion/google-fonts/STIXTwoText";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

export const SITE = "thehorizon.fun";

export const V = {
  void: "#050506",
  raised: "#0d0d10",
  paper: "#f3f3ef",
  muted: "#8f8f8a",
  hair: "rgba(243, 243, 239, 0.22)",
  hair2: "rgba(243, 243, 239, 0.45)",
  orange: "#ff6b1a",
  orangeDeep: "#d9540d",
  glow: "#ffb377",
};

export const VF = {
  display: loadGrotesk("normal", { weights: ["600", "800", "900"], subsets: ["latin"] }).fontFamily,
  serif: loadStix("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  serifItalic: loadStix("italic", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily,
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

/* ───────── the shared scenes' token names, mapped onto the void ───────── */
export const H = {
  v0: V.void,
  v1: V.raised,
  v2: "#16161b",
  gold: V.hair2,
  gold2: V.orange,
  goldPale: V.glow,
  goldDeep: V.orangeDeep,
  ivory: V.paper,
  paper: V.paper,
  ink: V.void,
  ink2: "#3c3c40",
  deedBlue: "#3c3c40",
  text: V.paper,
  text2: V.muted,
  feeding: V.orange,
  keeper: V.paper,
  sink: V.glow,
  wax: V.orange,
  fire: V.orange,
};

export const HF = {
  display: VF.display,
  displayItalic: VF.serifItalic,
  serif: VF.serif,
  serifItalic: VF.serifItalic,
  caps: VF.mono,
  data: VF.mono,
};

/** A still from the site, pushed in slowly, dimmed so type reads on it. */
export function Plate({ src, from = 1.03, to = 1.1, dark = 0.55, origin = "50% 50%", style }: { src: string; from?: number; to?: number; dark?: number; origin?: string; style?: CSSProperties }) {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 300], [from, to], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: V.void, ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`, transformOrigin: origin }} />
      <AbsoluteFill style={{ background: V.void, opacity: dark }} />
    </AbsoluteFill>
  );
}

export function Caps({ children, size = 22, color = V.orange, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: VF.mono, fontWeight: 500, fontSize: size, letterSpacing: "0.16em", textTransform: "uppercase", color, ...style }}>{children}</div>;
}

export function Head({ children, size = 96, color = V.paper, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.045em", color, ...style }}>{children}</div>;
}

export function Body({ children, size = 34, color = V.muted, italic, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: italic ? VF.serifItalic : VF.serif, fontSize: size, lineHeight: 1.4, color, ...style }}>{children}</div>;
}

export function Mono({ children, size = 24, color = V.paper, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: VF.mono, fontWeight: 500, fontSize: size, color, fontVariantNumeric: "tabular-nums", ...style }}>{children}</div>;
}

/** A journal caption: "Fig. n." in italic, then the line. */
export function Fig({ n, children, size = 24, style }: { n: string | number; children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: VF.serif, fontSize: size, lineHeight: 1.45, color: V.muted, ...style }}>
      <i style={{ fontFamily: VF.serifItalic, color: V.paper }}>Fig. {n}.</i> {children}
    </div>
  );
}

/** A flat black hole: horizon, photon ring, a tilted accretion disk passing in front and behind. */
export function Hole({ size = 400, spin = 0, glow = 1, style }: { size?: number; spin?: number; glow?: number; style?: CSSProperties }) {
  const id = `h${Math.round(size)}`;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`${id}g`} r="0.5">
          <stop offset="0.42" stopColor={V.orange} stopOpacity="0" />
          <stop offset="0.5" stopColor={V.glow} stopOpacity={0.9 * glow} />
          <stop offset="0.62" stopColor={V.orange} stopOpacity={0.35 * glow} />
          <stop offset="1" stopColor={V.orange} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}d`} x1="0" x2="1">
          <stop offset="0" stopColor={V.orangeDeep} stopOpacity="0.2" />
          <stop offset={0.5 + Math.sin(spin) * 0.2} stopColor="#fff1dc" />
          <stop offset="1" stopColor={V.orangeDeep} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle r="98" fill={`url(#${id}g)`} />
      {/* the far side of the disk, lensed over the top */}
      <ellipse rx="92" ry="20" fill="none" stroke={`url(#${id}d)`} strokeWidth="9" opacity="0.55" transform="rotate(-8)" />
      <circle r="44" fill="#000" />
      <circle r="46.5" fill="none" stroke="#fff1dc" strokeWidth="2.4" opacity={0.95 * glow} />
      {/* the near side, in front of the horizon */}
      <path d="M -92 0 A 92 20 0 0 0 92 0" fill="none" stroke={`url(#${id}d)`} strokeWidth="11" transform="rotate(-8)" />
    </svg>
  );
}

/** The site mark: a ringed hole in a hairline circle. */
export function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill={V.void} stroke={V.hair2} strokeWidth="1.5" />
      <ellipse cx="24" cy="25" rx="19" ry="5" fill="none" stroke={V.orange} strokeWidth="2.6" transform="rotate(-10 24 24)" />
      <circle cx="24" cy="24" r="8.5" fill="#000" stroke="#fff1dc" strokeWidth="1.4" />
      <path d="M 5.4 27.4 A 19 5 0 0 0 42.6 20.8" fill="none" stroke={V.orange} strokeWidth="2.6" transform="rotate(-10 24 24)" />
    </svg>
  );
}

/** The gravity well as a hairline funnel, seen from the side. */
export function Funnel({ width = 1600, depth = 1, style }: { width?: number; depth?: number; style?: CSSProperties }) {
  const rows = 16;
  const cols = 22;
  const h = width * 0.42;
  const y = (r: number) => (h * 0.92 * depth) / (1 + Math.pow(Math.abs(r) * 6, 1.4));
  const lines: string[] = [];
  for (let i = 1; i <= rows; i++) {
    const r = i / rows;
    const ry = width * 0.08 * r;
    lines.push(`M ${width / 2 - (width / 2) * r} ${y(r)} A ${(width / 2) * r} ${ry} 0 1 0 ${width / 2 + (width / 2) * r} ${y(r)} A ${(width / 2) * r} ${ry} 0 1 0 ${width / 2 - (width / 2) * r} ${y(r)}`);
  }
  for (let j = 0; j < cols; j++) {
    const a = (j / cols) * Math.PI * 2;
    let d = "";
    for (let i = 1; i <= 30; i++) {
      const r = i / 30;
      const px = width / 2 + Math.cos(a) * (width / 2) * r;
      const py = y(r) + Math.sin(a) * width * 0.08 * r;
      d += `${i === 1 ? "M" : "L"} ${px} ${py} `;
    }
    lines.push(d);
  }
  return (
    <svg width={width} height={h} viewBox={`0 -${width * 0.09} ${width} ${h + width * 0.09}`} style={{ overflow: "visible", ...style }}>
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={V.paper} strokeOpacity="0.16" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/** Where the Heirloom scenes spun a coin, Horizon turns a black hole. */
export function Coin({ size = 400, turn = 0 }: { size?: number; turn?: number; glow?: number; id?: string }) {
  return <Hole size={size} spin={turn} glow={0.85 + Math.sin(turn * 2) * 0.15} />;
}

export function Sig({ style }: { dark?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, ...style }}>
      <Mark size={48} />
      <div>
        <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 24, letterSpacing: "0.18em", color: V.paper }}>HORIZON</div>
        <div style={{ fontFamily: VF.mono, fontSize: 15, color: V.orange }}>{SITE}</div>
      </div>
    </div>
  );
}

/** A thin rule with a label, like the site's frame heads. */
export function Rule({ label, style }: { label?: string; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, ...style }}>
      {label ? <Caps size={18} color={V.muted}>{label}</Caps> : null}
      <div style={{ flex: 1, height: 1, background: V.hair2 }} />
    </div>
  );
}

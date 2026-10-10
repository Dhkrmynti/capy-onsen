/**
 * Hawking ($HAWK): a containment facility's signage. Safety yellow on black, hazard tape on the
 * diagonal, warning triangles, heavy condensed capitals (Barlow Condensed), body in Barlow, data in
 * JetBrains Mono. Same look as hawkings.fun. Exports the same names as HZTheme so the Horizon scenes
 * port over: `orange` is the accent (safety yellow here), `glow` is amber.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadCond } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadBarlow } from "@remotion/google-fonts/Barlow";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const SITE = "hawkings.fun";

export const V = {
  void: "#0b0b0c",
  raised: "#1b1d20",
  paper: "#f4f4f0",
  muted: "#a3a6ab",
  hair: "rgba(244, 244, 240, 0.2)",
  hair2: "rgba(244, 244, 240, 0.42)",
  orange: "#ffd100",
  orangeDeep: "#e6bc00",
  glow: "#ff9e1b",
  red: "#d52b1e",
  blue: "#0057b8",
  green: "#00843d",
};

export const VF = {
  display: loadCond("normal", { weights: ["600", "800", "900"], subsets: ["latin"] }).fontFamily,
  serif: loadBarlow("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily,
  serifItalic: loadBarlow("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily,
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

export const TAPE = `repeating-linear-gradient(-45deg, ${V.orange} 0 18px, #121212 18px 36px)`;

/* ───────── the shared scenes' token names, mapped onto the facility ───────── */
export const H = {
  v0: V.void,
  v1: V.raised,
  v2: "#24272b",
  gold: V.hair2,
  gold2: V.orange,
  goldPale: V.glow,
  goldDeep: V.orangeDeep,
  ivory: V.paper,
  paper: V.paper,
  ink: "#121212",
  ink2: "#3a3e44",
  deedBlue: "#3a3e44",
  text: V.paper,
  text2: V.muted,
  feeding: V.orange,
  keeper: V.paper,
  sink: V.red,
  wax: V.red,
  fire: V.glow,
};

export const HF = {
  display: VF.display,
  displayItalic: VF.display,
  serif: VF.serif,
  serifItalic: VF.serif,
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
  return <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: size, letterSpacing: "0.18em", textTransform: "uppercase", color, ...style }}>{children}</div>;
}

export function Head({ children, size = 96, color = V.paper, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.005em", textTransform: "uppercase", color, ...style }}>{children}</div>;
}

export function Body({ children, size = 34, color = V.muted, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: VF.serif, fontWeight: 500, fontSize: size, lineHeight: 1.38, color, ...style }}>{children}</div>;
}

export function Mono({ children, size = 24, color = V.paper, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: VF.mono, fontWeight: 500, fontSize: size, color, fontVariantNumeric: "tabular-nums", ...style }}>{children}</div>;
}

/** A placard caption: a small warning triangle, then the line. */
export function Fig({ n, children, size = 24, style }: { n?: string | number; children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", fontFamily: VF.serif, fontWeight: 500, fontSize: size, lineHeight: 1.4, color: V.muted, ...style }}>
      <Tri size={size * 1.1} style={{ flex: "none", marginTop: size * 0.12 }} />
      <span>{children}</span>
    </div>
  );
}

/** The ISO-style warning triangle with the black-hole pictogram: the site mark. */
export function Tri({ size = 56, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <path d="M60 6 L 115 108 H 5 Z" fill={V.orange} stroke="#121212" strokeWidth="9" strokeLinejoin="round" />
      <g transform="translate(30 46) scale(0.6)" fill="none" stroke="#121212" strokeWidth="6">
        <ellipse cx="50" cy="52" rx="34" ry="11" transform="rotate(-14 50 52)" />
        <circle cx="50" cy="50" r="14" fill="#121212" stroke="none" />
      </g>
    </svg>
  );
}
export const Mark = ({ size = 56 }: { size?: number }) => <Tri size={size} />;

/** A flat contained black hole: horizon, photon ring, an amber disk, and the striped containment ring. */
export function Hole({ size = 400, spin = 0, glow = 1, style }: { size?: number; spin?: number; glow?: number; style?: CSSProperties }) {
  const id = `k${Math.round(size)}`;
  const off = (spin * 40) % 24;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`${id}g`} r="0.5">
          <stop offset="0.42" stopColor={V.glow} stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffe9a8" stopOpacity={0.9 * glow} />
          <stop offset="0.62" stopColor={V.glow} stopOpacity={0.4 * glow} />
          <stop offset="1" stopColor={V.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}d`} x1="0" x2="1">
          <stop offset="0" stopColor={V.glow} stopOpacity="0.25" />
          <stop offset={0.5 + Math.sin(spin) * 0.2} stopColor="#fff4d0" />
          <stop offset="1" stopColor={V.glow} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <circle r="98" fill={`url(#${id}g)`} />
      <ellipse rx="92" ry="20" fill="none" stroke={`url(#${id}d)`} strokeWidth="9" opacity="0.55" transform="rotate(-8)" />
      <circle r="44" fill="#000" />
      <circle r="46.5" fill="none" stroke="#fff4d0" strokeWidth="2.4" opacity={0.95 * glow} />
      <path d="M -92 0 A 92 20 0 0 0 92 0" fill="none" stroke={`url(#${id}d)`} strokeWidth="11" transform="rotate(-8)" />
      {/* the containment ring: black, with yellow hazard stripes running round it */}
      <ellipse rx="99" ry="27" fill="none" stroke="#121212" strokeWidth="7" transform="rotate(-8)" />
      <ellipse rx="99" ry="27" fill="none" stroke={V.orange} strokeWidth="7" strokeDasharray="6 6" strokeDashoffset={off} transform="rotate(-8)" />
    </svg>
  );
}

/** A band of hazard tape with a word repeated along it, laid on the diagonal. */
export function Tape({ word, width = 2400, angle = -6, tone = "yellow", size = 40, style }: { word: string; width?: number; angle?: number; tone?: "yellow" | "red"; size?: number; style?: CSSProperties }) {
  const bg = tone === "red" ? V.red : V.orange;
  const ink = tone === "red" ? V.paper : "#121212";
  return (
    <div style={{ position: "absolute", width, padding: `${size * 0.22}px 0`, background: bg, transform: `rotate(${angle}deg)`, whiteSpace: "nowrap", overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,0.45)", ...style }}>
      <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: size, letterSpacing: "0.08em", textTransform: "uppercase", color: ink }}>
        {Array.from({ length: 14 }, () => `${word} ✕ `).join("")}
      </span>
    </div>
  );
}

/** Thin hazard stripes as a rule along an edge. */
export function Stripe({ h = 12, style }: { h?: number; style?: CSSProperties }) {
  return <div style={{ height: h, background: TAPE, ...style }} />;
}

/** Where Heirloom spun a coin, Hawking turns its contained black hole. */
export function Coin({ size = 400, turn = 0 }: { size?: number; turn?: number; glow?: number; id?: string }) {
  return <Hole size={size} spin={turn} glow={0.85 + Math.sin(turn * 2) * 0.15} />;
}

export function Sig({ style }: { dark?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, ...style }}>
      <Tri size={50} />
      <div>
        <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.06em", color: V.orange, lineHeight: 1 }}>HAWKING</div>
        <div style={{ fontFamily: VF.mono, fontSize: 15, color: V.paper, marginTop: 3 }}>{SITE}</div>
      </div>
    </div>
  );
}

/** A label, then a rule. */
export function Rule({ label, style }: { label?: string; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, ...style }}>
      {label ? <Caps size={18} color={V.muted}>{label}</Caps> : null}
      <div style={{ flex: 1, height: 2, background: V.hair2 }} />
    </div>
  );
}

/** The warning placard from the site: a black header with WARNING, a white body. */
export function Placard({ head = "WARNING", children, width = 640, tone = "yellow", style }: { head?: string; children: ReactNode; width?: number; tone?: "yellow" | "red"; style?: CSSProperties }) {
  return (
    <div style={{ width, background: "#121212", padding: 5, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
        <Tri size={34} />
        <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 32, letterSpacing: "0.14em", color: tone === "red" ? V.red : V.orange }}>{head}</span>
      </div>
      <div style={{ background: V.paper, color: "#121212", padding: "18px 20px" }}>{children}</div>
    </div>
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
        <path key={i} d={d} fill="none" stroke={V.paper} strokeOpacity="0.14" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

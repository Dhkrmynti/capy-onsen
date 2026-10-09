/**
 * Heirloom ($HEIR): the family vault. Same palette and type as heirlooms.fun:
 * midnight navy, gold leaf, ivory paper, Bodoni Moda over Libre Caslon, Cinzel for engraving.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadCaslon } from "@remotion/google-fonts/LibreCaslonText";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoNarrow";

export const H = {
  v0: "#0b1424",
  v1: "#13213a",
  v2: "#1d3256",
  gold: "#c9a45c",
  gold2: "#e8c16e",
  goldPale: "#f1d58e",
  goldDeep: "#8a6a2a",
  ivory: "#ece3cb",
  paper: "#f1e9d4",
  ink: "#1c1913",
  ink2: "#4a4536",
  deedBlue: "#24427a",
  text: "#efe7d2",
  text2: "#b9b3a2",
  feeding: "#e6cc8f",
  keeper: "#4f74b3",
  sink: "#a63e4a",
  wax: "#8c2430",
  fire: "#ff9a4a",
};

export const HF = {
  display: loadBodoni("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily,
  displayItalic: loadBodoni("italic", { weights: ["500"], subsets: ["latin"] }).fontFamily,
  serif: loadCaslon("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily,
  serifItalic: loadCaslon("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  caps: loadCinzel("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily,
  data: loadArchivo("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily,
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 over [a, b] frames, clamped. */
export const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** A 3D still from the site, slowly pushed in, darkened so type reads on it. */
export function Plate({ src, from = 1.04, to = 1.12, dark = 0.55, origin = "50% 50%", style }: { src: string; from?: number; to?: number; dark?: number; origin?: string; style?: CSSProperties }) {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 300], [from, to], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: H.v0, ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`, transformOrigin: origin }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(11,20,36,${dark * 0.6}) 0%, rgba(11,20,36,${dark}) 60%, rgba(11,20,36,${Math.min(1, dark + 0.3)}) 100%)` }} />
    </AbsoluteFill>
  );
}

/** The brass rule and the navy panel the site sets its words on. */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: "rgba(13,22,39,0.92)", borderTop: `3px solid ${H.gold}`, borderRadius: 8, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.9)", padding: "40px 48px", color: H.text, ...style }}>{children}</div>;
}

export function Caps({ children, size = 22, color = H.gold2, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: HF.caps, fontWeight: 600, fontSize: size, letterSpacing: "0.22em", textTransform: "uppercase", color, ...style }}>{children}</div>;
}

export function Head({ children, size = 96, color = H.text, italic = false, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: italic ? HF.displayItalic : HF.display, fontWeight: 500, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.015em", color, ...style }}>{children}</div>;
}

export function Body({ children, size = 34, color = H.text2, italic = false, style }: { children: ReactNode; size?: number; color?: string; italic?: boolean; style?: CSSProperties }) {
  return <div style={{ fontFamily: italic ? HF.serifItalic : HF.serif, fontSize: size, lineHeight: 1.4, color, ...style }}>{children}</div>;
}

/* ───────────────────────── the house coin ───────────────────────── */

const LEGEND_FRONT = "HEIRLOOM · THE FAMILY VAULT · EST. BLOCK ONE · ";
const LEGEND_BACK = "THE INHERITANCE · PAID TO THE TEN HEIRS · ";

/**
 * The struck gold piece. `turn` spins it on its edge (radians): the face narrows to the rim,
 * then the reverse comes round. Drawn in SVG so it stays sharp at any size.
 */
export function Coin({ size = 400, turn = 0, glow = 0.6, id = "c" }: { size?: number; turn?: number; glow?: number; id?: string }) {
  const c = Math.cos(turn);
  const w = Math.max(0.04, Math.abs(c));
  const back = c < 0;
  const edge = Math.sin(turn) * 9;
  const ticks = Array.from({ length: 140 }, (_, i) => (i / 140) * Math.PI * 2);
  return (
    <svg width={size} height={size} viewBox="-120 -120 240 240" style={{ overflow: "visible", filter: `drop-shadow(0 ${size * 0.05}px ${size * 0.08}px rgba(0,0,0,0.6)) drop-shadow(0 0 ${size * 0.12 * glow}px rgba(232,193,110,${0.45 * glow}))` }}>
      <defs>
        <radialGradient id={`${id}-rim`} cx="38%" cy="32%" r="80%">
          <stop offset="0" stopColor="#fbeab0" />
          <stop offset="0.4" stopColor="#dcb662" />
          <stop offset="0.8" stopColor="#9c7428" />
          <stop offset="1" stopColor="#6a4b15" />
        </radialGradient>
        <radialGradient id={`${id}-field`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#f6dc93" />
          <stop offset="0.55" stopColor="#d2a853" />
          <stop offset="1" stopColor="#a47a2e" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" x2="1">
          <stop offset="0" stopColor="#5e4212" />
          <stop offset="0.5" stopColor="#b48a3a" />
          <stop offset="1" stopColor="#5e4212" />
        </linearGradient>
        <path id={`${id}-arc`} d="M 0 -72 A 72 72 0 1 1 -0.01 -72" />
      </defs>
      {/* the milled edge, seen as the coin turns */}
      <ellipse cx={edge} cy={0} rx={100 * w} ry={100} fill={`url(#${id}-edge)`} />
      <g transform={`scale(${w},1)`}>
        <circle r={100} fill={`url(#${id}-rim)`} />
        {ticks.map((a, i) => (
          <line key={i} x1={Math.cos(a) * 93} y1={Math.sin(a) * 93} x2={Math.cos(a) * 99.5} y2={Math.sin(a) * 99.5} stroke="rgba(90,62,16,0.55)" strokeWidth={1.1} />
        ))}
        <circle r={89} fill="none" stroke="#7a5719" strokeWidth={2.4} />
        <circle r={86} fill={`url(#${id}-field)`} />
        <circle r={86} fill="none" stroke="rgba(255,240,200,0.5)" strokeWidth={0.8} />
        <text fontFamily={HF.caps} fontWeight={700} fontSize={12.5} letterSpacing={2.2} fill="#5d4210">
          <textPath href={`#${id}-arc`}>{back ? LEGEND_BACK : LEGEND_FRONT}</textPath>
        </text>
        <circle r={58} fill="none" stroke="#7a5719" strokeWidth={1.6} />
        <circle r={54} fill="none" stroke="rgba(122,87,25,0.6)" strokeWidth={0.7} />
        {back ? (
          <>
            <text y={-2} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={32} fill="#5d4210">$HEIR</text>
            <text y={24} textAnchor="middle" fontFamily={HF.caps} fontWeight={600} fontSize={11} letterSpacing={2} fill="#5d4210">NEVER SOLD</text>
          </>
        ) : (
          <>
            <text y={26} x={1.4} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={76} fill="rgba(70,46,8,0.75)">H</text>
            <text y={24.5} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={76} fill="#f3d687">H</text>
          </>
        )}
        {/* a broad highlight across the face */}
        <ellipse cx={-30} cy={-38} rx={60} ry={34} fill="rgba(255,250,230,0.22)" transform="rotate(-28)" />
      </g>
    </svg>
  );
}

/** The H monogram in a double ring, as on the site's plate and seals. */
export function Monogram({ size = 60, color = H.gold2 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke={color} strokeWidth="0.9" />
      <text x="32" y="42" textAnchor="middle" fontFamily={HF.caps} fontSize="27" fontWeight="700" fill={color}>H</text>
    </svg>
  );
}

/** A red wax seal, pressed. */
export function WaxSeal({ size = 160, label = "WRITTEN OUT", rot = -12 }: { size?: number; label?: string; rot?: number }) {
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ transform: `rotate(${rot}deg)`, overflow: "visible", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.55))" }}>
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#c8424f" />
          <stop offset="0.6" stopColor="#8c2430" />
          <stop offset="1" stopColor="#5a121b" />
        </radialGradient>
      </defs>
      <path d="M0,-56 C14,-58 22,-50 34,-46 C46,-40 54,-30 56,-14 C60,2 52,14 50,28 C44,44 30,52 14,56 C-2,60 -16,54 -30,50 C-44,42 -54,30 -56,14 C-60,-4 -52,-16 -48,-30 C-40,-46 -20,-54 0,-56Z" fill="url(#wax)" />
      <circle r={36} fill="none" stroke="rgba(40,4,8,0.45)" strokeWidth={2.5} />
      <circle r={36} fill="none" stroke="rgba(255,190,190,0.25)" strokeWidth={1} transform="translate(-1,-1)" />
      <text y={-2} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={28} fill="rgba(255,220,220,0.85)">H</text>
      <text y={18} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={8.5} letterSpacing={1.2} fill="rgba(255,220,220,0.85)">{label}</text>
    </svg>
  );
}

/** Small corner mark used on every frame: the house and the address. */
export function Sig({ dark = false, style }: { dark?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, ...style }}>
      <Monogram size={46} color={dark ? H.goldDeep : H.gold2} />
      <div>
        <div style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", color: dark ? H.ink : H.text }}>HEIRLOOM</div>
        <div style={{ fontFamily: HF.serifItalic, fontSize: 18, color: dark ? H.ink2 : H.text2 }}>heirlooms.fun</div>
      </div>
    </div>
  );
}

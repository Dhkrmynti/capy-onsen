import type { CSSProperties } from "react";
import { C } from "./theme";

interface Props {
  style?: CSSProperties;
  /** Lily pad under him. */
  pad?: boolean;
  /** 0 open, 1 shut. */
  blink?: number;
  /** Pupil shift in SVG units. */
  look?: number;
  /** 0 hidden, 1 fully out to the fly at (470, 150). */
  tongue?: number;
  viewBox?: string;
}

const INK = C.frogInk;

/** Sitwell, ported from src/components/Sitwell.tsx with frame-driven parts. Original frog, not Pepe. */
export function Sitwell({ style, pad = true, blink = 0, look = 0, tongue = 0, viewBox = "0 0 420 430" }: Props) {
  return (
    <svg viewBox={viewBox} style={{ overflow: "visible", ...style }}>
      {pad ? (
        <g>
          <path
            d="M210 330 C 330 330 404 352 404 378 C 404 404 320 424 210 424 C 100 424 16 404 16 378 C 16 356 70 338 150 333 L 196 372 Z"
            fill={C.pad}
            stroke={INK}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <g stroke={C.padVein} strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M196 372 L 74 394" />
            <path d="M196 372 L 150 414" />
            <path d="M196 372 L 262 418" />
            <path d="M196 372 L 352 400" />
            <path d="M196 372 L 360 356" />
          </g>
        </g>
      ) : null}

      <g stroke={INK} strokeWidth="6" strokeLinejoin="round">
        <path d="M118 300 C 70 300 52 340 70 362 C 86 382 140 380 168 366 L 160 318 Z" fill={C.frogShade} />
        <path d="M302 300 C 350 300 368 340 350 362 C 334 382 280 380 252 366 L 260 318 Z" fill={C.frogShade} />
      </g>
      <g fill={C.frog} stroke={INK} strokeWidth="5">
        <path d="M80 364 C 64 368 50 376 46 384" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="387" r="9" />
        <circle cx="66" cy="391" r="9" />
        <circle cx="88" cy="388" r="9" />
        <path d="M340 364 C 356 368 370 376 374 384" fill="none" strokeLinecap="round" />
        <circle cx="376" cy="387" r="9" />
        <circle cx="354" cy="391" r="9" />
        <circle cx="332" cy="388" r="9" />
      </g>

      <path
        d="M132 214 C 112 252 110 316 134 350 C 156 378 264 378 286 350 C 310 316 308 252 288 214 Z"
        fill={C.frog}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M160 262 C 150 300 160 344 210 350 C 260 344 270 300 260 262 C 240 248 180 248 160 262 Z" fill={C.frogBelly} />
      <g stroke={C.frogShade} strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <path d="M180 284 h60" />
        <path d="M176 304 h68" />
        <path d="M182 324 h56" />
      </g>

      <g stroke={INK} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M140 262 C 120 290 112 316 120 336" fill="none" />
        <path d="M280 262 C 300 290 308 316 300 336" fill="none" />
        <path d="M140 262 C 120 290 112 316 120 336" fill="none" stroke={C.frog} strokeWidth="12" />
        <path d="M280 262 C 300 290 308 316 300 336" fill="none" stroke={C.frog} strokeWidth="12" />
      </g>
      <g fill={C.frog} stroke={INK} strokeWidth="5">
        <circle cx="106" cy="342" r="10" />
        <circle cx="124" cy="350" r="10" />
        <circle cx="142" cy="344" r="10" />
        <circle cx="314" cy="342" r="10" />
        <circle cx="296" cy="350" r="10" />
        <circle cx="278" cy="344" r="10" />
      </g>

      <path
        d="M86 186 C 86 132 138 116 210 116 C 282 116 334 132 334 186 C 334 238 280 254 210 254 C 140 254 86 238 86 186 Z"
        fill={C.frog}
        stroke={INK}
        strokeWidth="6"
      />

      {tongue > 0 ? (
        <g style={{ transformOrigin: "210px 206px", transform: `scaleX(${tongue})` }}>
          <path d="M210 206 L 470 150" stroke="#f27a9b" strokeWidth="13" strokeLinecap="round" />
          <circle cx="470" cy="150" r="14" fill="#f27a9b" stroke={INK} strokeWidth="4" />
        </g>
      ) : null}

      <path d="M140 200 C 170 214 236 216 280 196" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M276 190 C 282 194 286 198 288 204" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="194" cy="166" r="4.5" fill={INK} />
      <circle cx="226" cy="166" r="4.5" fill={INK} />

      <g>
        <circle cx="96" cy="206" r="9" fill={C.frogShade} stroke={INK} strokeWidth="4" />
        <path d="M96 214 L 96 224" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M84 230 L 96 222 L 108 230 L 96 248 Z" fill="#dff4ff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M84 230 H 108 M 96 222 L 92 230 L 96 248 M 96 222 L 100 230 L 96 248" stroke="#8cc7e6" strokeWidth="2" fill="none" />
      </g>

      <g stroke={INK} strokeWidth="6">
        <circle cx="148" cy="118" r="50" fill={C.frog} />
        <circle cx="272" cy="118" r="50" fill={C.frog} />
      </g>
      <g fill="#ffffff" stroke={INK} strokeWidth="4">
        <circle cx="148" cy="116" r="36" />
        <circle cx="272" cy="116" r="36" />
      </g>
      <g fill={INK} transform={`translate(${look} 0)`}>
        <ellipse cx="152" cy="118" rx="19" ry="21" />
        <ellipse cx="268" cy="118" rx="19" ry="21" />
        <circle cx="160" cy="108" r="6" fill="#ffffff" />
        <circle cx="276" cy="108" r="6" fill="#ffffff" />
      </g>
      {blink > 0 ? (
        <g fill={C.frog} stroke={INK} strokeWidth="4">
          <ellipse cx="148" cy="116" rx="37" ry="37" style={{ transformOrigin: "148px 79px", transform: `scaleY(${blink})` }} />
          <ellipse cx="272" cy="116" rx="37" ry="37" style={{ transformOrigin: "272px 79px", transform: `scaleY(${blink})` }} />
        </g>
      ) : null}
    </svg>
  );
}

/** A fly: the creator fee in the lore. `flap` is the frame, for wing buzz. */
export function Fly({ size = 40, flap = 0, style }: { size?: number; flap?: number; style?: CSSProperties }) {
  const w = flap % 2 === 0 ? 1 : 0.55;
  return (
    <svg viewBox="0 0 40 30" width={size} height={size * 0.75} style={style}>
      <g style={{ transformOrigin: "20px 14px", transform: `scaleY(${w})` }}>
        <ellipse cx="13" cy="9" rx="10" ry="6" fill="#dbeef0" opacity="0.9" stroke={C.frogInk} strokeWidth="2" transform="rotate(-24 13 9)" />
        <ellipse cx="27" cy="9" rx="10" ry="6" fill="#dbeef0" opacity="0.9" stroke={C.frogInk} strokeWidth="2" transform="rotate(24 27 9)" />
      </g>
      <ellipse cx="20" cy="18" rx="8" ry="9" fill={C.frogInk} />
      <circle cx="20" cy="10" r="5" fill={C.frogInk} />
    </svg>
  );
}

/** Blink once every `every` frames, 6 frames long. */
export function blinkAt(frame: number, every = 75, offset = 30) {
  const t = (frame + every - offset) % every;
  if (t < 3) return t / 3;
  if (t < 6) return 1 - (t - 3) / 3;
  return 0;
}

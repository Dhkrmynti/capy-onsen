/** A signal flag as SVG, from the shared geometry in lib/flags. */
import { useId, type CSSProperties } from "react";
import { FLAGS, SIG, outline, type FlagCode, type FlagDef } from "../lib/flags";

export function Flag({ code, size = 36, className = "", style, title, stretch = false }: { code: FlagCode; size?: number; className?: string; style?: CSSProperties; title?: string; stretch?: boolean }) {
  const f: FlagDef = FLAGS[code];
  const W = 60;
  const H = W / f.ratio;
  const id = useId().replace(/:/g, "");
  const pts = (p: [number, number][]) => p.map(([u, v]) => `${(u * W).toFixed(2)},${(v * H).toFixed(2)}`).join(" ");
  const edge = pts(outline(f.shape));
  return (
    <svg
      className={`flag is-${f.shape} ${className}`}
      viewBox={`-1.5 -1.5 ${W + 3} ${H + 3}`}
      width={size}
      height={(size * (H + 3)) / (W + 3)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={style}
      preserveAspectRatio={stretch ? "none" : undefined}
    >
      <clipPath id={id}>
        <polygon points={edge} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {f.parts.map((part, i) =>
          "disc" in part ? (
            <circle key={i} cx={part.disc[0] * W} cy={part.disc[1] * H} r={part.disc[2] * H} fill={SIG[part.c]} />
          ) : (
            <polygon key={i} points={pts(part.p)} fill={SIG[part.c]} />
          ),
        )}
        {code === "J" ? <Skull x={W * 0.36} y={H * 0.5} s={H * 0.034} /> : null}
      </g>
      <polygon points={edge} fill="none" stroke={SIG.K} strokeWidth="2.4" strokeLinejoin="round" vectorEffect={stretch ? "non-scaling-stroke" : undefined} />
    </svg>
  );
}

/** Skull and crossbones, centred on x,y, in a 24-unit design scaled by s. */
function Skull({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-24 -24)`}>
      <path d="M10 36 L 38 12 M10 12 L 38 36" stroke={SIG.W} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 21 C 14 13, 18.5 9.5, 24 9.5 C 29.5 9.5, 34 13, 34 21 C 34 25.5, 31.8 27.6, 29.5 28.2 V 32 H 18.5 V 28.2 C 16.2 27.6, 14 25.5, 14 21 Z" fill={SIG.W} />
      <circle cx="20" cy="20.5" r="3.1" fill={SIG.K} />
      <circle cx="28" cy="20.5" r="3.1" fill={SIG.K} />
    </g>
  );
}

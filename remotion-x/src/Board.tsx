import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C, F, WALL_TILE } from "./theme";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:$";

function hash(a: number, b: number, c = 7) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return Math.abs(h ^ (h >>> 16));
}

export type Tone = "glyph" | "amber" | "stop" | "dim";
const TONE: Record<Tone, string> = { glyph: C.glyph, amber: C.amber, stop: C.stop, dim: C.glyphDim };

export interface Key {
  /** Frame at which the row starts flipping to `text`. */
  at: number;
  text: string;
  tone?: Tone;
}

function fit(text: string, cells: number) {
  return text.toUpperCase().slice(0, cells).padEnd(cells, " ");
}

/**
 * A row of split-flap units, driven by the frame. Each change spins every cell
 * through a few random glyphs before it lands, left to right, like the site board.
 */
export function Flaps({ keys, cells, size, row = 0 }: { keys: Key[]; cells: number; size: number; row?: number }) {
  const frame = useCurrentFrame();
  let k = -1;
  for (let i = 0; i < keys.length; i++) if (keys[i].at <= frame) k = i;
  const prev = k > 0 ? fit(keys[k - 1].text, cells) : " ".repeat(cells);
  const cur = k >= 0 ? fit(keys[k].text, cells) : " ".repeat(cells);
  const tone = TONE[(k >= 0 && keys[k].tone) || "glyph"];
  const w = size * 0.66;
  const h = size * 1.18;

  return (
    <div style={{ display: "inline-flex", gap: size * 0.06 }}>
      {Array.from({ length: cells }, (_, i) => {
        let ch = cur[i];
        let moving = false;
        if (k >= 0 && prev[i] !== cur[i]) {
          const local = frame - keys[k].at - i * 1.4;
          const steps = 3 + (hash(i, row, k) % 5);
          if (local < 0) ch = prev[i];
          else {
            const step = Math.floor(local / 2);
            if (step < steps) {
              ch = CHARSET[hash(i, step, row * 31 + k) % CHARSET.length];
              moving = local % 2 < 1;
            }
          }
        }
        return (
          <span key={i} style={{ position: "relative", width: w, height: h, borderRadius: 3, overflow: "hidden", flex: "none" }}>
            <span style={{ position: "absolute", inset: 0, background: `linear-gradient(${C.flapLit}, ${C.flap} 50%, ${C.flap} 50%, ${C.flap})` }} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.flap,
                fontWeight: 600,
                fontSize: size,
                lineHeight: 1,
                color: tone,
              }}
            >
              {ch === " " ? "" : ch}
            </span>
            {/* the falling top flap, one frame per glyph change */}
            {moving ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: h * 0.18,
                  height: h * 0.32,
                  background: `linear-gradient(${C.flapLit}, #1d201e)`,
                  boxShadow: "0 3px 4px rgba(0,0,0,.45)",
                }}
              />
            ) : null}
            <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: Math.max(1, size * 0.03), background: C.flapSplit }} />
          </span>
        );
      })}
    </div>
  );
}

export function Wall({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.wall,
        backgroundImage: WALL_TILE,
        backgroundSize: "96px 48px",
        color: C.wallInk,
        fontFamily: F.body,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The black departure board frame. */
export function BoardFrame({ children, style, title, pad = 24 }: { children: ReactNode; style?: CSSProperties; title?: string; pad?: number }) {
  return (
    <div
      style={{
        background: C.board,
        borderRadius: 8,
        padding: pad,
        boxShadow: `inset 0 0 0 6px ${C.boardFrame}, 0 18px 40px -22px rgba(4,22,14,.85), 0 2px 6px -2px rgba(4,22,14,.5)`,
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            fontFamily: F.sign,
            fontWeight: 800,
            textTransform: "uppercase",
            color: C.amber,
            fontSize: pad * 1.15,
            letterSpacing: "0.02em",
            paddingBottom: pad * 0.5,
            marginBottom: pad * 0.7,
            borderBottom: "2px solid #2b302d",
          }}
        >
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Cream enamel sign plate, like the nav logo on the site. */
export function Plate({ children, size = 32, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.4,
        background: C.enamel,
        color: C.enamelInk,
        borderRadius: 14 * (size / 32),
        padding: `${size * 0.32}px ${size * 0.6}px`,
        fontFamily: F.sign,
        fontWeight: 800,
        fontSize: size,
        textTransform: "uppercase",
        lineHeight: 1,
        boxShadow: `inset 0 0 0 ${size * 0.09}px ${C.enamelInk}, inset 0 0 0 ${size * 0.15}px ${C.enamel}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The two little eyes from the nav plate. */
export function Eyes({ size = 20 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: size * 0.15 }}>
      {[0, 1].map((i) => (
        <span
          key={i}
          style={{ width: size, height: size, borderRadius: "50%", background: "#fff", border: `${size * 0.14}px solid ${C.enamelInk}`, display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}
        >
          <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: C.enamelInk }} />
        </span>
      ))}
    </span>
  );
}

/** A coin: amber "P" for $PADS, pale blue "Ξ" for ETH. */
export function Coin({ size = 36, style, eth = false }: { size?: number; style?: CSSProperties; eth?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: eth ? "radial-gradient(circle at 35% 30%, #ffffff, #c9dcf5 60%, #8fa9d6)" : `radial-gradient(circle at 35% 30%, #ffd66b, ${C.amber} 60%, #c98a0a)`,
        border: `${Math.max(2, size * 0.08)}px solid ${C.frogInk}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.sign,
        fontWeight: 900,
        fontSize: size * 0.52,
        color: eth ? "#1d2c55" : C.amberInk,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {eth ? "Ξ" : "P"}
    </div>
  );
}

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BoardFrame, Coin, Eyes, Flaps, Plate, Wall } from "./Board";
import { Fly, Sitwell, blinkAt } from "./Sitwell";
import { C, F } from "./theme";

/** "How the loop works" for X, 4:5 portrait. The hook uses launch-day data (8 Oct 2026). */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1080;

function Big({ children, size = 120, color = C.wallInk, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: size, lineHeight: 0.92, color, ...style }}>{children}</div>;
}

function Note({ children, size = 36, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: F.body, fontSize: size, lineHeight: 1.35, color: C.wallInkSoft, ...style }}>{children}</div>;
}

/** Text that slams in: overshoots in scale, then settles. */
function Slam({ at, children }: { at: number; children: ReactNode }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 220 } });
  return <div style={{ transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`, transformOrigin: "0% 50%", opacity: Math.min(1, s * 2) }}>{children}</div>;
}

/** Quick cuts: fade only at the tail, so each scene opens on a full frame. */
function Cut({ len, children }: { len: number; children: ReactNode }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [len - 5, len], [1, 0], clamp) }}>{children}</AbsoluteFill>;
}

/* ───────── hook ───────── */

function Hook() {
  const f = useCurrentFrame();
  const stay = 5;
  const coin = spring({ frame: f - 62, fps: 30, config: { damping: 10 } });
  return (
    <Wall>
      <div style={{ position: "absolute", left: 70, top: 80, right: 70 }}>
        <Slam at={0}>
          <Big size={150}>11 frogs sold.</Big>
        </Slam>
        <Slam at={32}>
          <Big size={150} color={C.amber}>1 frog sat.</Big>
        </Slam>
        <Slam at={58}>
          <Note size={44} style={{ color: C.wallInk, marginTop: 18 }}>he got paid. in ETH. automatically.</Note>
        </Slam>
      </div>

      {/* twelve frogs on the pond; eleven jump off, one stays */}
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 70 + col * 240;
        const y = 600 + row * 230;
        if (i === stay) {
          const grow = interpolate(f, [48, 70], [1, 1.25], { ...clamp, easing: Easing.out(Easing.back(2)) });
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 220, height: 225, transform: `scale(${grow})`, zIndex: 2 }}>
              <Sitwell style={{ width: "100%", height: "100%" }} blink={blinkAt(f, 60, 40)} look={f > 50 ? -4 : 0} />
            </div>
          );
        }
        const at = 6 + ((i * 7) % 11) * 2.4;
        const t = interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const dir = col < 2 ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + dir * t * 500,
              top: y - Math.sin(Math.min(t * 1.8, 1) * Math.PI) * 220 + Math.max(0, t - 0.55) * 900,
              width: 220,
              height: 225,
              transform: `rotate(${dir * t * 50}deg)`,
              filter: t > 0 ? "grayscale(1) brightness(0.75)" : undefined,
              opacity: 1 - Math.max(0, t - 0.7) / 0.3,
            }}
          >
            <Sitwell style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}

      {f >= 62 ? (
        <div style={{ position: "absolute", left: 560, top: 560, display: "flex", alignItems: "center", gap: 18, transform: `scale(${coin})`, transformOrigin: "0% 50%", zIndex: 3 }}>
          <Coin eth size={110} />
          <span style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 84, color: C.amber, textShadow: `0 4px 0 ${C.wallShade}` }}>0.0137 ETH</span>
        </div>
      ) : null}
    </Wall>
  );
}

/* ───────── the loop, as a ring ───────── */

const STOPS = [
  { n: "1", name: "feeding", eth: "0.01 ETH", what: "top 10 holders", angle: -90, color: C.amber, ink: C.amberInk },
  { n: "2", name: "keeper", eth: "0.02 ETH", what: "treasury", angle: 30, color: C.enamel, ink: C.enamelInk },
  { n: "3", name: "sink", eth: "0.01 ETH", what: "buy + burn", angle: 150, color: C.stop, ink: C.wallInk },
];

function Ring() {
  const f = useCurrentFrame();
  const cx = W / 2;
  const cy = 760;
  const r = 330;
  const draw = interpolate(f, [4, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const a = ((-90 + f * 5) * Math.PI) / 180;
  return (
    <Wall>
      <div style={{ position: "absolute", left: 70, top: 80 }}>
        <Slam at={0}>
          <Big size={140}>here&rsquo;s the loop.</Big>
        </Slam>
        <Note style={{ marginTop: 16 }}>every trade drops fees. the engine runs them in a circle.</Note>
      </div>
      <svg width={W} height={1350} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.wallShade} strokeWidth={26} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.frog}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * draw} ${2 * Math.PI * r}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <Sitwell style={{ position: "absolute", left: cx - 120, top: cy - 130, width: 240, height: 246 }} blink={blinkAt(f, 50, 30)} />
      {draw > 0.3 ? <Fly size={56} flap={f} style={{ position: "absolute", left: cx + Math.cos(a) * r - 28, top: cy + Math.sin(a) * r - 21 }} /> : null}
      {STOPS.map((s, i) => {
        const t = interpolate(f, [14 + i * 10, 26 + i * 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
        const rad = (s.angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * r;
        const y = cy + Math.sin(rad) * r;
        return (
          <div
            key={s.n}
            style={{
              position: "absolute",
              left: x - 150,
              top: y - 70,
              width: 300,
              padding: "14px 18px",
              borderRadius: 16,
              background: s.color,
              color: s.ink,
              boxShadow: `inset 0 0 0 4px ${C.frogInk}, 0 18px 30px -18px rgba(0,0,0,.7)`,
              textAlign: "center",
              transform: `scale(${t})`,
            }}
          >
            <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 46, lineHeight: 1 }}>
              {s.n} · {s.name}
            </div>
            <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 28, marginTop: 4 }}>
              {s.eth} → {s.what}
            </div>
          </div>
        );
      })}
    </Wall>
  );
}

/* ───────── shared bits for the three steps ───────── */

function Steps({ active }: { active: number }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 60, display: "flex", gap: 14 }}>
      {STOPS.map((s, i) => (
        <div
          key={s.n}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 12,
            textAlign: "center",
            fontFamily: F.flap,
            fontWeight: 700,
            fontSize: 28,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: i === active ? s.color : C.wallShade,
            color: i === active ? s.ink : C.wallInkSoft,
            boxShadow: i === active ? `inset 0 0 0 3px ${C.frogInk}` : "none",
          }}
        >
          {s.n} · {s.name}
        </div>
      ))}
    </div>
  );
}

/** The escrow filling up to this step's size, as a row of flap tiles. */
function Meter({ size, fillTo }: { size: string; fillTo: number }) {
  const f = useCurrentFrame();
  const p = interpolate(f, [4, fillTo], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <BoardFrame title={`Escrow · fills to ${size}`} pad={18} style={{ position: "absolute", left: 70, right: 70, top: 150 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 60,
              borderRadius: 4,
              background: i < Math.round(p * 16) ? `linear-gradient(${C.amber}, #d99a0c)` : `linear-gradient(${C.flapLit}, ${C.flap})`,
              boxShadow: `inset 0 -3px 0 ${C.flapSplit}`,
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <Flaps cells={14} size={34} keys={[{ at: 0, text: "FILLING" }, { at: fillTo, text: "TONGUE SNAP", tone: "amber" }]} />
      </div>
    </BoardFrame>
  );
}

/* ───────── 1 · feeding ───────── */

const SEATS = ["9.4M", "6.6M", "4.8M", "3.1M", "2.4M", "1.7M", "1.2M", "0.8M", "0.6M", "0.4M"];

function Feed() {
  const f = useCurrentFrame();
  const snap = 40;
  const src = { x: W / 2 - 30, y: 470 };
  return (
    <Wall>
      <Steps active={0} />
      <Meter size="0.01 ETH" fillTo={snap} />
      {SEATS.map((bag, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 70 + col * 480;
        const y = 560 + row * 96;
        const at = snap + 6 + i * 4;
        const t = interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const landed = t >= 1;
        return (
          <div key={i}>
            {t > 0 && t < 1 ? <Coin eth size={46} style={{ position: "absolute", left: interpolate(t, [0, 1], [src.x, x + 380]), top: interpolate(t, [0, 1], [src.y, y + 20]) - Math.sin(t * Math.PI) * 120 }} /> : null}
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 460,
                height: 82,
                borderRadius: 12,
                background: C.enamel,
                color: C.enamelInk,
                boxShadow: `inset 0 0 0 3px ${C.enamelInk}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "0 18px",
                boxSizing: "border-box",
                fontFamily: F.flap,
                fontWeight: 700,
                fontSize: 30,
              }}
            >
              <span style={{ background: C.board, color: C.amber, borderRadius: 8, padding: "2px 10px", fontSize: 26 }}>#{i + 1}</span>
              <span style={{ flex: 1 }}>{bag} bag</span>
              <span style={{ opacity: landed ? 1 : 0.15 }}>+Ξ</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70 }}>
        <Big size={64} color={C.amber}>0.01 ETH → top 10 holders.</Big>
        <Note style={{ marginTop: 12 }}>paid in ETH, split by bag. bigger bag, bigger bite.</Note>
      </div>
    </Wall>
  );
}

/* ───────── 2 · keeper ───────── */

function Keeper() {
  const f = useCurrentFrame();
  const snap = 34;
  return (
    <Wall>
      <Steps active={1} />
      <Meter size="0.02 ETH" fillTo={snap} />
      {/* the treasury: an enamel safe */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 200,
          top: 600,
          width: 400,
          height: 360,
          borderRadius: 24,
          background: C.enamel,
          boxShadow: `inset 0 0 0 6px ${C.enamelInk}, 0 30px 50px -30px rgba(0,0,0,.8)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          color: C.enamelInk,
          transform: `scale(${interpolate(f, [snap + 24, snap + 28, snap + 36], [1, 1.06, 1], clamp)})`,
        }}
      >
        <div style={{ width: 130, height: 130, borderRadius: "50%", border: `10px solid ${C.enamelInk}`, boxSizing: "border-box", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", top: 8, width: 8, height: 46, marginLeft: -4, background: C.enamelInk, transformOrigin: "50% 47px", transform: `rotate(${f * 6}deg)` }} />
        </div>
        <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 56 }}>TREASURY</div>
      </div>
      {[0, 1].map((c) => {
        const t = interpolate(f, [snap + 4 + c * 6, snap + 24 + c * 6], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        if (t <= 0 || t >= 1) return null;
        return <Coin key={c} eth size={70} style={{ position: "absolute", left: W / 2 - 35 + (c ? 40 : -40), top: interpolate(t, [0, 1], [430, 700]) }} />;
      })}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70 }}>
        <Big size={64}>0.02 ETH → the keeper&rsquo;s cut.</Big>
        <Note style={{ marginTop: 12 }}>straight to the treasury. every transfer is listed on the site.</Note>
      </div>
    </Wall>
  );
}

/* ───────── 3 · sink ───────── */

function Sink() {
  const f = useCurrentFrame();
  const snap = 34;
  return (
    <Wall>
      <Steps active={2} />
      <Meter size="0.01 ETH" fillTo={snap} />
      <BoardFrame pad={16} style={{ position: "absolute", left: 70, top: 470, display: "flex", gap: 20 }}>
        <Flaps cells={9} size={40} keys={[{ at: snap, text: "BUY PADS" }]} />
        <Flaps cells={8} size={40} row={1} keys={[{ at: snap + 4, text: "BUYING", tone: "amber" }, { at: snap + 52, text: "BURNED", tone: "stop" }]} />
      </BoardFrame>
      <div style={{ position: "absolute", left: W / 2 - 300, top: 860, width: 600, height: 110, borderRadius: "50%", background: "#07140d", boxShadow: `inset 0 12px 26px #000, 0 0 0 10px ${C.wallShade}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center" }}>
        <Plate size={36}>0x…dEaD</Plate>
      </div>
      {Array.from({ length: 11 }, (_, i) => {
        const at = snap + 10 + i * 4;
        const t = interpolate(f, [at, at + 22], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        if (t <= 0 || t >= 1) return null;
        const x = W / 2 - 240 + ((i * 97) % 440);
        return <Coin key={i} size={64} style={{ position: "absolute", left: x, top: interpolate(t, [0, 1], [600, 890]), opacity: t > 0.85 ? (1 - t) / 0.15 : 1, transform: `rotate(${t * 220}deg)` }} />;
      })}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70 }}>
        <Big size={64} color={C.stop}>0.01 ETH → buy + burn.</Big>
        <Note style={{ marginTop: 12 }}>$PADS bought back and sent to the dead address. gone for good.</Note>
      </div>
    </Wall>
  );
}

/* ───────── the one rule ───────── */

function Rule() {
  const f = useCurrentFrame();
  const jump = interpolate(f, [16, 50], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <Wall>
      <div style={{ position: "absolute", left: 70, top: 90, right: 70 }}>
        <Slam at={0}>
          <Big size={130}>sell once?</Big>
        </Slam>
        <Slam at={20}>
          <Big size={130} color={C.stop}>hopped off. forever.</Big>
        </Slam>
        <Slam at={44}>
          <Note size={40} style={{ marginTop: 18 }}>no seat, no ETH, ever. wallet-to-wallet is fine.</Note>
        </Slam>
      </div>
      <Sitwell style={{ position: "absolute", left: 90, top: 700, width: 400, height: 410 }} blink={blinkAt(f, 60, 30)} look={interpolate(f, [18, 26], [0, 8], clamp)} />
      <svg viewBox="0 330 420 100" style={{ position: "absolute", left: 600, top: 1015, width: 400, height: 95 }}>
        <path d="M210 330 C 330 330 404 352 404 378 C 404 404 320 424 210 424 C 100 424 16 404 16 378 C 16 356 70 338 150 333 L 196 372 Z" fill={C.pad} stroke={C.frogInk} strokeWidth="6" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 600 + jump * 500,
          top: 700 - Math.sin(Math.min(jump * 1.6, 1) * Math.PI) * 240 + Math.max(0, jump - 0.6) * 1500,
          width: 400,
          height: 410,
          filter: "grayscale(1) brightness(0.75)",
          transform: `rotate(${jump * 40}deg)`,
        }}
      >
        <Sitwell pad={false} style={{ width: "100%", height: "100%" }} />
      </div>
    </Wall>
  );
}

/* ───────── call to action ───────── */

function Cta() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 6, fps, config: { damping: 12 } });
  return (
    <Wall>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 70 }}>
        <div style={{ transform: `scale(${pop})` }}>
          <Sitwell style={{ width: 360, height: 369 }} blink={blinkAt(f, 50, 30)} />
        </div>
        <Big size={110} style={{ marginTop: 24 }}>hold. never sell.</Big>
        <Big size={110} color={C.amber}>get fed.</Big>
        <div style={{ marginTop: 34 }}>
          <Plate size={52}>
            <Eyes size={36} /> pepads.fun
          </Plate>
        </div>
        <Note size={34} style={{ marginTop: 28 }}>$PADS · robinhood chain · @pepadsrh</Note>
        <Note size={22} style={{ marginTop: 26, opacity: 0.7 }}>memecoin, no promise of value. feedings depend on trading fees.</Note>
      </AbsoluteFill>
    </Wall>
  );
}

const SCENES: [() => ReactElement, number][] = [
  [Hook, 96],
  [Ring, 90],
  [Feed, 140],
  [Keeper, 100],
  [Sink, 116],
  [Rule, 90],
  [Cta, 100],
];
export const LOOP_LENGTH = SCENES.reduce((n, [, len]) => n + len, 0);

export function LoopVideo() {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.wall }}>
      {SCENES.map(([Comp, len], i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Cut len={len}>
              <Comp />
            </Cut>
          </Sequence>
        );
        from += len;
        return el;
      })}
    </AbsoluteFill>
  );
}

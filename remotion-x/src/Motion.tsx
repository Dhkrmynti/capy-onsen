import type { CSSProperties, ReactElement, ReactNode } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Flaps, Wall, BoardFrame, Plate, Eyes, Coin, type Key } from "./Board";
import { Sitwell, Fly, blinkAt } from "./Sitwell";
import { C, F } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Hover wiggle for a fly, periodic in `period` frames so loops close cleanly. */
function buzz(frame: number, seed = 0, amp = 14, period = 90) {
  const t = ((frame + seed * 13) / period) * Math.PI * 2;
  return { x: Math.sin(t * 3) * amp + Math.sin(t * 5 + seed) * amp * 0.4, y: Math.cos(t * 4 + seed) * amp * 0.7 };
}

/** Tongue extension for a snap that starts at `at`: out in 6 frames, back in 9. */
function snap(frame: number, at: number) {
  return interpolate(frame, [at, at + 6, at + 15], [0, 1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
}

function Heading({ n, children, size = 64 }: { n?: string; children: ReactNode; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35 }}>
      {n ? (
        <span
          style={{
            width: size * 1.05,
            height: size * 1.05,
            borderRadius: 10,
            background: C.amber,
            color: C.amberInk,
            fontFamily: F.sign,
            fontWeight: 900,
            fontSize: size * 0.8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </span>
      ) : null}
      <span style={{ fontFamily: F.sign, fontWeight: 800, fontSize: size, lineHeight: 1, color: C.wallInk }}>{children}</span>
    </div>
  );
}

function Body({ children, size = 34, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: F.body, fontSize: size, lineHeight: 1.4, color: C.wallInkSoft, ...style }}>{children}</div>;
}

/** Fades a scene in and out over its own length. */
function Scene({ children, len }: { children: ReactNode; len: number }) {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, len - 8, len], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
}

/* ─────────────────────────── GIF 1: tongue snap ─────────────────────────── */

export function GifSnap() {
  const f = useCurrentFrame();
  const S = 1.02;
  const ox = 60;
  const oy = 170;
  const tip = { x: ox + 470 * S, y: oy + 150 * S };
  const mouth = { x: ox + 210 * S, y: oy + 206 * S };
  const tongue = snap(f, 34);
  const b = buzz(f, 1);

  let fly: { x: number; y: number } | null = null;
  if (f < 34) fly = { x: tip.x + b.x, y: tip.y + b.y };
  else if (f < 49) {
    // caught: rides the tongue back in from the moment it lands
    const back = f < 40 ? 1 : tongue;
    fly = { x: mouth.x + (tip.x - mouth.x) * back, y: mouth.y + (tip.y - mouth.y) * back };
  } else if (f >= 64) {
    const p = interpolate(f, [64, 89], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
    fly = { x: interpolate(p, [0, 1], [780, tip.x + b.x]), y: interpolate(p, [0, 1], [90, tip.y + b.y]) };
  }
  const gulp = interpolate(f, [48, 52, 62], [1, 0.94, 1], clamp);
  const pop = interpolate(f, [50, 56, 76, 84], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", top: 44, left: 0, right: 0, textAlign: "center" }}>
          <Plate size={44}>fees = flies</Plate>
        </div>
        <div style={{ position: "absolute", left: ox, top: oy, width: 520 * S, height: 430 * S, transform: `scaleY(${gulp})`, transformOrigin: "50% 100%" }}>
          <Sitwell viewBox="0 0 520 430" style={{ width: "100%", height: "100%" }} tongue={tongue} look={f < 50 || f > 70 ? 6 : 0} blink={blinkAt(f, 90, 60)} />
        </div>
        {fly ? <Fly size={46} flap={f} style={{ position: "absolute", left: fly.x - 23, top: fly.y - 17 }} /> : null}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 250 - pop * 20,
            opacity: pop,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: F.sign,
            fontWeight: 800,
            fontSize: 40,
            color: C.amber,
          }}
        >
          <Coin size={44} eth /> 0.01 ETH
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center" }}>
          <Body size={27} style={{ color: C.wallInk, display: "inline-block", background: C.wallShade, borderRadius: 10, padding: "8px 20px" }}>tongue snap: fees get claimed, the loop runs</Body>
        </div>
      </Wall>
    </AbsoluteFill>
  );
}

/* ─────────────────────────── GIF 2: feeding board ─────────────────────────── */

const BOARD_ROWS: [string, string, Key["tone"]][] = [
  ["1 FEEDING", "TOP 10", "amber"],
  ["2 KEEPER", "TREASURY", "amber"],
  ["3 SINK", "BURN", "amber"],
  ["HOPPED OFF", "NOTHING", "stop"],
];

export function GifBoard() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", top: 54, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 96, lineHeight: 1 }}>the loop.</div>
          <Body size={28} style={{ marginTop: 10 }}>each tongue snap runs the next step, then again</Body>
        </div>
        <BoardFrame title="Departures" pad={20} style={{ position: "absolute", left: 40, right: 40, top: 236 }}>
          {BOARD_ROWS.map(([label, value, tone], r) => (
            <div key={label} style={{ display: "flex", gap: 22, marginBottom: r < 3 ? 12 : 0 }}>
              <Flaps cells={12} size={34} row={r * 2} keys={[{ at: 4 + r * 6, text: label }, { at: 104, text: "" }]} />
              <Flaps cells={9} size={34} row={r * 2 + 1} keys={[{ at: 10 + r * 6, text: value, tone }, { at: 106, text: "" }]} />
            </div>
          ))}
        </BoardFrame>
        <Sitwell style={{ position: "absolute", left: 270, top: 520, width: 180, height: 184 }} blink={blinkAt(f, 60, 40)} />
      </Wall>
    </AbsoluteFill>
  );
}

/* ─────────────────────────── Demo video ─────────────────────────── */

function Intro() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f - 8, fps, config: { damping: 11, stiffness: 120 } });
  const land = interpolate(f, [22, 26, 40], [1, 0.86, 1], clamp);
  const line = (d: number) => interpolate(f, [d, d + 14], [110, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const plate = interpolate(f, [56, 66], [0, 1], clamp);
  return (
    <Wall>
      <div style={{ position: "absolute", left: 150, top: 300 }}>
        {["never", "hop off."].map((w, i) => (
          <div key={w} style={{ overflow: "hidden", height: 210 }}>
            <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 230, lineHeight: 0.9, transform: `translateY(${line(26 + i * 8)}%)` }}>{w}</div>
          </div>
        ))}
        <div style={{ marginTop: 36, opacity: plate }}>
          <Plate size={44}>
            <Eyes size={32} /> Pepads
            <span style={{ background: C.enamelInk, color: C.enamel, borderRadius: 10, padding: "6px 14px", fontSize: 30 }}>$PADS</span>
          </Plate>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 140,
          bottom: 120,
          width: 640,
          height: 655,
          transform: `translateY(${(1 - drop) * -900}px) scaleY(${land})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Sitwell style={{ width: "100%", height: "100%" }} blink={blinkAt(f, 70, 60)} look={interpolate(f, [70, 80], [0, -6], clamp)} />
      </div>
    </Wall>
  );
}

function Flies() {
  const f = useCurrentFrame();
  const S = 1.15;
  const ox = 120;
  const oy = 300;
  const tip = { x: ox + 470 * S, y: oy + 150 * S };
  const mouth = { x: ox + 210 * S, y: oy + 206 * S };
  const snaps = [40, 66, 92];
  const homes = [
    { x: tip.x, y: tip.y },
    { x: tip.x + 60, y: tip.y - 90 },
    { x: tip.x - 40, y: tip.y - 150 },
  ];
  let tongue = 0;
  snaps.forEach((s) => (tongue = Math.max(tongue, snap(f, s))));
  const split = interpolate(f, [116, 136], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <Wall>
      <div style={{ position: "absolute", left: 120, top: 90 }}>
        <Heading>flies = creator fees</Heading>
        <Body style={{ marginTop: 18 }}>every $PADS trade drops fees into the escrow.</Body>
      </div>
      <div style={{ position: "absolute", left: ox, top: oy, width: 520 * S, height: 430 * S }}>
        <Sitwell viewBox="0 0 520 430" style={{ width: "100%", height: "100%" }} tongue={tongue} look={6} blink={blinkAt(f, 80, 20)} />
      </div>
      {homes.map((h, i) => {
        const s = snaps[i];
        // each fly is pulled to the tip just before its snap, then rides the tongue in
        if (f >= s + 15) return null;
        const b = buzz(f, i * 3, 16);
        let p = { x: h.x + b.x, y: h.y + b.y };
        if (f >= s - 8 && f < s + 6) p = { x: interpolate(f, [s - 8, s + 6], [p.x, tip.x], clamp), y: interpolate(f, [s - 8, s + 6], [p.y, tip.y], clamp) };
        if (f >= s + 6) {
          const t = snap(f, s);
          p = { x: mouth.x + (tip.x - mouth.x) * t, y: mouth.y + (tip.y - mouth.y) * t };
        }
        return <Fly key={i} size={52} flap={f + i} style={{ position: "absolute", left: p.x - 26, top: p.y - 19 }} />;
      })}

      <div style={{ position: "absolute", right: 120, top: 300, width: 860 }}>
        <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 32, letterSpacing: "0.06em", textTransform: "uppercase", color: C.wallInk, marginBottom: 20, opacity: split }}>
          tongue snap · each step fires when the escrow fills
        </div>
        {(
          [
            ["1", "feeding", "0.01 ETH", "ETH to the top 10 sitters", C.amber, C.amberInk],
            ["2", "keeper's cut", "0.02 ETH", "to the treasury, shown openly", C.enamel, C.enamelInk],
            ["3", "the sink", "0.01 ETH", "buys $PADS and burns it", C.stop, C.wallInk],
          ] as const
        ).map(([n, name, size, does, bg, ink], i) => {
          const t = interpolate(f, [116 + i * 8, 134 + i * 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                height: 104,
                marginBottom: 14,
                padding: "0 26px",
                borderRadius: 12,
                background: bg,
                color: ink,
                boxShadow: `inset 0 0 0 4px ${C.frogInk}`,
                opacity: t,
                transform: `translateX(${(1 - t) * 60}px)`,
              }}
            >
              <span style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 64, width: 46 }}>{n}</span>
              <span style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 44, width: 300 }}>{name}</span>
              <span style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 36, width: 160 }}>{size}</span>
              <span style={{ fontFamily: F.body, fontSize: 26, flex: 1 }}>{does}</span>
            </div>
          );
        })}
      </div>
    </Wall>
  );
}

const TOP = [
  ["0x7a3…e31", "9.4M", "0.0026"],
  ["0x11c…09d", "6.6M", "0.0018"],
  ["0xb84…f2a", "4.8M", "0.0013"],
  ["0x5e0…7c4", "3.1M", "0.0009"],
  ["0xd29…a18", "2.4M", "0.0007"],
];

function Feeding() {
  const f = useCurrentFrame();
  const from = { x: 330, y: 560 };
  return (
    <Wall>
      <div style={{ position: "absolute", left: 120, top: 80 }}>
        <Heading n="1">feeding · ETH to the top 10</Heading>
        <Body style={{ marginTop: 18, maxWidth: 900 }}>every 0.01 ETH of fees goes straight to the 10 biggest wallets that never sold. split by balance, paid in ETH.</Body>
      </div>

      <div style={{ position: "absolute", left: 150, top: 430, width: 360, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 260, height: 260, borderRadius: "50%", background: C.wallDeep, boxShadow: `inset 0 0 0 6px ${C.wallShade}` }}>
          <Coin eth size={170} style={{ transform: `scale(${interpolate(f, [36, 46], [1, 0.9], clamp)})` }} />
        </div>
        <div style={{ marginTop: 26 }}>
          <Plate size={34}>0.01 ETH</Plate>
        </div>
      </div>

      {TOP.map(([a, bal, got], i) => {
        const y = 290 + i * 128;
        const at = 44 + i * 9;
        const landed = f > at + 20;
        return (
          <div key={a}>
            {[0, 1].map((c) => {
              const t = interpolate(f, [at + c * 4, at + c * 4 + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
              if (t <= 0 || t >= 1) return null;
              return <Coin key={c} eth size={42} style={{ position: "absolute", left: interpolate(t, [0, 1], [from.x, 1150]), top: interpolate(t, [0, 1], [from.y, y + 30]) - Math.sin(t * Math.PI) * 140 }} />;
            })}
            <div
              style={{
                position: "absolute",
                left: 1140,
                top: y,
                width: 660,
                height: 104,
                borderRadius: 14,
                background: C.enamel,
                color: C.enamelInk,
                boxShadow: `inset 0 0 0 3px ${C.enamelInk}`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 24px",
                boxSizing: "border-box",
                fontFamily: F.flap,
                fontWeight: 700,
                fontSize: 34,
              }}
            >
              <span style={{ width: 52, color: C.amber, background: C.board, borderRadius: 8, textAlign: "center", fontSize: 30, padding: "4px 0" }}>#{i + 1}</span>
              <span style={{ flex: 1 }}>{a}</span>
              <span style={{ fontSize: 28, opacity: 0.7, width: 90 }}>{bal}</span>
              <span style={{ width: 170, textAlign: "right", opacity: landed ? 1 : 0.15 }}>+{got} Ξ</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1160, top: 290 + 5 * 128 - 6, fontFamily: F.flap, fontWeight: 600, fontSize: 28, color: C.wallInkSoft }}>… down to seat #10</div>

      <div style={{ position: "absolute", left: 120, bottom: 70, width: 900 }}>
        <Body size={32} style={{ color: C.wallInk }}>to get a seat:</Body>
        <Body size={32}>never sold · ≥ 100,000 $PADS · 1h on the pad</Body>
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 40, fontFamily: F.flap, fontSize: 22, letterSpacing: "0.1em", color: C.wallInkSoft, textTransform: "uppercase" }}>
        illustration · not real wallets
      </div>
    </Wall>
  );
}

function KeeperSink() {
  const f = useCurrentFrame();
  return (
    <Wall>
      <div style={{ position: "absolute", left: 120, top: 80 }}>
        <Heading n="2">keeper&rsquo;s cut, then</Heading>
        <div style={{ marginTop: 18 }}>
          <Heading n="3">the sink</Heading>
        </div>
        <Body style={{ marginTop: 22, maxWidth: 820 }}>0.02 ETH goes to the treasury, every transfer on the site. then 0.01 ETH buys $PADS back and burns it for good.</Body>
      </div>

      <BoardFrame title="Departures" pad={20} style={{ position: "absolute", left: 120, top: 560, width: 820 }}>
        <div style={{ display: "flex", gap: 22, marginBottom: 12 }}>
          <Flaps cells={7} size={40} keys={[{ at: 6, text: "KEEPER" }]} />
          <Flaps cells={9} size={40} row={1} keys={[{ at: 10, text: "0.02 ETH", tone: "amber" }]} />
          <Flaps cells={8} size={40} row={2} keys={[{ at: 14, text: "TREASURY", tone: "amber" }]} />
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          <Flaps cells={7} size={40} row={3} keys={[{ at: 40, text: "SINK" }]} />
          <Flaps cells={9} size={40} row={4} keys={[{ at: 44, text: "0.01 ETH", tone: "amber" }]} />
          <Flaps cells={8} size={40} row={5} keys={[{ at: 48, text: "BUYING", tone: "amber" }, { at: 96, text: "BURNED", tone: "stop" }]} />
        </div>
      </BoardFrame>

      {/* the drain: bought $PADS fall into 0x…dEaD */}
      <div style={{ position: "absolute", left: 1220, top: 790, width: 500, height: 90, borderRadius: "50%", background: "#07140d", boxShadow: `inset 0 10px 24px #000, 0 0 0 8px ${C.wallShade}` }} />
      {Array.from({ length: 9 }, (_, i) => {
        const start = 60 + i * 6;
        const t = interpolate(f, [start, start + 22], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        if (t <= 0 || t >= 1) return null;
        const x = 1290 + ((i * 53) % 330);
        return <Coin key={i} size={56} style={{ position: "absolute", left: x, top: interpolate(t, [0, 1], [300, 820]), opacity: t > 0.85 ? (1 - t) / 0.15 : 1, transform: `rotate(${t * 200}deg)` }} />;
      })}
      <div style={{ position: "absolute", left: 1220, top: 910, width: 500, textAlign: "center" }}>
        <Plate size={32}>0x…dEaD</Plate>
      </div>
    </Wall>
  );
}

function Hopped() {
  const f = useCurrentFrame();
  const jump = interpolate(f, [30, 70], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const x = jump * 900;
  const y = -Math.sin(Math.min(jump * 1.6, 1) * Math.PI) * 260 + Math.max(0, jump - 0.6) * 1400;
  return (
    <Wall>
      <div style={{ position: "absolute", left: 120, top: 80 }}>
        <Heading n="4">sell once = hopped off. forever.</Heading>
        <Body style={{ marginTop: 18, maxWidth: 1100 }}>sending $PADS to the curve or a dex marks the wallet for good. wallet-to-wallet is fine.</Body>
      </div>

      {/* left: the one who stays */}
      <Sitwell style={{ position: "absolute", left: 160, top: 420, width: 440, height: 450 }} blink={blinkAt(f, 70, 20)} look={interpolate(f, [34, 44], [0, 8], clamp)} />

      {/* right: an empty pad, and the one who left */}
      <svg viewBox="0 330 420 100" style={{ position: "absolute", left: 820, top: 760, width: 440, height: 105 }}>
        <path d="M210 330 C 330 330 404 352 404 378 C 404 404 320 424 210 424 C 100 424 16 404 16 378 C 16 356 70 338 150 333 L 196 372 Z" fill={C.pad} stroke={C.frogInk} strokeWidth="6" />
      </svg>
      <div style={{ position: "absolute", left: 820 + x, top: 420 + y, width: 440, height: 450, filter: "grayscale(1) brightness(0.8)", transform: `rotate(${jump * 40}deg)` }}>
        <Sitwell pad={false} style={{ width: "100%", height: "100%" }} />
      </div>

      <BoardFrame pad={16} style={{ position: "absolute", right: 120, top: 330, display: "flex", gap: 24 }}>
        <Flaps cells={10} size={40} keys={[{ at: 8, text: "0X9F2…C07" }]} />
        <Flaps cells={10} size={40} row={1} keys={[{ at: 14, text: "SITTING", tone: "amber" }, { at: 62, text: "HOPPED OFF", tone: "stop" }]} />
      </BoardFrame>
    </Wall>
  );
}

function Outro() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shot = spring({ frame: f, fps, config: { damping: 16 } });
  const card = interpolate(f, [62, 74], [0, 1], clamp);
  return (
    <Wall>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card }}>
        <div
          style={{
            position: "absolute",
            left: 260,
            top: 110,
            width: 1400,
            borderRadius: 14,
            overflow: "hidden",
            background: C.board,
            boxShadow: `0 40px 80px -30px rgba(4,22,14,.9), inset 0 0 0 3px ${C.boardFrame}`,
            transform: `translateY(${(1 - shot) * 200}px) scale(${0.92 + shot * 0.08})`,
          }}
        >
          <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
            {[C.stop, C.amber, C.frog].map((c) => (
              <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ marginLeft: 20, background: C.flap, borderRadius: 8, padding: "6px 18px", fontFamily: F.body, fontSize: 22, color: C.glyph }}>pepads.fun</span>
          </div>
          <Img src={staticFile("site.png")} style={{ display: "block", width: "100%" }} />
        </div>
      </div>
      <AbsoluteFill style={{ opacity: card, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Sitwell style={{ width: 300, height: 307 }} blink={blinkAt(f, 60, 40)} />
        <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 170, lineHeight: 0.95, marginTop: 20 }}>never hop off.</div>
        <div style={{ marginTop: 26 }}>
          <Plate size={46}>
            <Eyes size={32} /> pepads.fun
          </Plate>
        </div>
        <Body size={30} style={{ marginTop: 26 }}>$PADS · robinhood chain · launched on pons · @pepadsrh</Body>
        <Body size={22} style={{ marginTop: 30, opacity: 0.7 }}>memecoin, no promise of value. feedings depend on trading fees.</Body>
      </AbsoluteFill>
    </Wall>
  );
}

export const DEMO_SCENES: [() => ReactElement, number][] = [
  [Intro, 120],
  [Flies, 180],
  [Feeding, 170],
  [KeeperSink, 160],
  [Hopped, 150],
  [Outro, 150],
];
export const DEMO_LENGTH = DEMO_SCENES.reduce((n, [, len]) => n + len, 0);

export function Demo() {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.wall }}>
      {DEMO_SCENES.map(([Comp, len], i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Scene len={len}>
              <Comp />
            </Scene>
          </Sequence>
        );
        from += len;
        return el;
      })}
    </AbsoluteFill>
  );
}

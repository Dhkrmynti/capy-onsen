/**
 * "How Hawking works": the ten biggest holders sit nearest the core, every trade charges the
 * escrow, and the engine runs four steps (The Emission 0.02 to the ten in two zones, Containment
 * Fund 0.025, Evaporation 0.01, Containment Fund 0.025). One sale and you are spaghettified.
 * Scenes cross-dissolve; the black hole is the site's own render.
 */
import type React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Body, Caps, Fig, Funnel, Head, Hole, Mono, Plate, Rule, SITE, V, VF, back, ease, easeInOut, ramp } from "./HKTheme";
import { Gauge } from "./HKGauge";

const XF = 14;

function In({ at, dur = 16, y = 26, children, style }: { at: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const f = useCurrentFrame();
  const t = ease(ramp(f, at, at + dur));
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)`, ...style }}>{children}</div>;
}

/* 1. the black hole, the name */
function Intro() {
  return (
    <AbsoluteFill>
      <Plate src="hk/plate-hero.png" dark={0.05} from={1.0} to={1.12} origin="69% 50%" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #0b0b0c 0%, rgba(11,11,12,0.85) 30%, rgba(11,11,12,0) 60%)" }} />
      <div style={{ position: "absolute", left: 130, top: 300 }}>
        <In at={10}>
          <Caps size={26}>Hawking · $HAWK</Caps>
        </In>
        <In at={20}>
          <Head size={190} style={{ marginTop: 20 }}>
            Hold
            <br />
            <span style={{ color: V.orange }}>closer.</span>
          </Head>
        </In>
        <In at={40}>
          <Body size={42} color={V.paper} style={{ marginTop: 30 }}>
            The ten biggest holders sit nearest the core.
          </Body>
        </In>
      </div>
    </AbsoluteFill>
  );
}

/* 2. the closer orbit goes to whoever holds more */
const RACE: [string, number][] = [
  ["@corewhale", 9.4],
  ["0x2f8c…6a9f", 7.1],
  ["trustfundtony", 4.8],
  ["0xc0ff…e6f3", 3.1],
  ["@margaux_ashford", 2.4],
];
function TheOrbit() {
  const f = useCurrentFrame();
  const g = easeInOut(ramp(f, 40, 120));
  const bal = RACE.map(([, b], i) => (i === 1 ? b + g * 3.6 : b));
  const order = bal.map((b, i) => [b, i] as const).sort((a, b) => b[0] - a[0]);
  const S = 860;
  const c = S / 2;
  const ringR = (rank: number) => 110 + rank * 62;
  const r = useSmoothRanks(bal);
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <div style={{ position: "absolute", left: 120, top: 150, width: 760 }}>
        <In at={0}>
          <Head size={110}>
            Hold more,
            <br />
            <span style={{ color: V.orange }}>get closer.</span>
          </Head>
        </In>
        <In at={14}>
          <Body size={38} color={V.paper} style={{ marginTop: 34 }}>
            Ranked by balance, live. Hold more than No. 1 and you take the core on the spot.
          </Body>
        </In>
        <In at={26}>
          <Fig n={2} size={28} style={{ marginTop: 40 }}>
            The red zone: No. 1-5. No. 1 sits at the core.
          </Fig>
        </In>
      </div>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", right: 90, top: 110 }}>
        {[0, 1, 2, 3, 4].map((k) => (
          <circle key={k} cx={c} cy={c} r={ringR(k)} fill="none" stroke={V.red} strokeOpacity={k === 0 ? 0.95 : 0.6} strokeWidth="2" />
        ))}
        <circle cx={c} cy={c} r={70} fill="#000" stroke="#fff1dc" strokeWidth="2.4" />
        <text x={c} y={c + 9} textAnchor="middle" fontFamily={VF.serifItalic} fontSize={30} fill={V.muted}>
          CORE
        </text>
        {RACE.map(([name], i) => {
          const rr = ringR(r[i]);
          const a = -Math.PI / 2 + i * 1.25 + f * 0.012 * (1.4 - r[i] * 0.2);
          const x = c + Math.cos(a) * rr;
          const y = c + Math.sin(a) * rr;
          const one = order[0][1] === i;
          return (
            <g key={name}>
              <circle cx={x} cy={y} r={one ? 13 : 9} fill={one ? V.orange : V.paper} />
              <text x={x + 20} y={y + 7} fontFamily={VF.mono} fontSize={21} fill={one ? V.orange : V.paper}>
                {name} · {bal[i].toFixed(1)}M
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}
/** Each body's rank, eased so a change of orbit glides rather than jumps. */
function useSmoothRanks(bal: number[]) {
  const f = useCurrentFrame();
  const before = [0, 1, 2, 3, 4];
  const after = bal.map((b, i) => [b, i] as const).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
  const rankOf = (list: number[], i: number) => list.indexOf(i);
  const k = easeInOut(ramp(f, 118, 150));
  const swapped = after[0] !== 0;
  return bal.map((_, i) => (swapped ? rankOf(before, i) + (rankOf(after, i) - rankOf(before, i)) * k : rankOf(before, i)));
}

/* 3. the site */
function Shot() {
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <Img src={staticFile("hk/s-_ladder_0.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-end", padding: 50 }}>
        <Mono size={20} color={V.muted}>
          illustration · the exposure board on {SITE}
        </Mono>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* 4. fees feed the escrow */
function Escrow() {
  const f = useCurrentFrame();
  const fill = easeInOut(ramp(f, 20, 130));
  const chips = ["buy 0.42 ETH", "sell 0.10 ETH", "buy 1.05 ETH", "buy 0.21 ETH", "buy 0.66 ETH"];
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <div style={{ position: "absolute", left: -200, bottom: -260, opacity: 0.7 }}>
        <Funnel width={1500} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 170, width: 860 }}>
        <In at={0}>
          <Head size={104}>
            Every trade
            <br />
            <span style={{ color: V.orange }}>charges the core.</span>
          </Head>
        </In>
        <In at={16}>
          <Body size={38} color={V.paper} style={{ marginTop: 34 }}>
            Each trade's creator fee builds up in the Pons escrow. When it reaches the next step's level, the engine claims it and pays it out. Then it fills again.
          </Body>
        </In>
      </div>
      <div style={{ position: "absolute", right: 170, top: 230 }}>
        <Gauge fill={fill} target={0.02} size={560} label="RADIATION LEVEL" />
      </div>
      {chips.map((c, i) => {
        const t0 = 20 + i * 20;
        const t = ramp(f, t0, t0 + 34);
        if (t <= 0 || t >= 1) return null;
        return (
          <div key={c} style={{ position: "absolute", left: interpolate(t, [0, 1], [1920, 1450]), top: interpolate(t, [0, 1], [180 + i * 140, 500]), opacity: 1 - t * t, transform: `scale(${1 - t * 0.5})` }}>
            <div style={{ padding: "8px 16px", border: `1px solid ${V.orange}`, background: "rgba(11,11,12,0.8)" }}>
              <Mono size={24} color={V.orange}>
                {c}
              </Mono>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* 5. the four steps */
function Orbits({ k }: { k: number }) {
  const S = 520;
  const c = S / 2;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      {Array.from({ length: 10 }, (_, i) => {
        const r = 60 + i * 19;
        const a = -Math.PI / 2 + i * 0.63 + k * (2 - i * 0.1);
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={i < 5 ? V.red : V.glow} strokeOpacity={0.8} strokeWidth="1.6" />
            <circle cx={c + Math.cos(a) * r} cy={c + Math.sin(a) * r} r={i < 5 ? 7 : 5} fill={i < 5 ? V.orange : V.paper} stroke="#121212" strokeWidth="1.5" />
          </g>
        );
      })}
      <circle cx={c} cy={c} r={40} fill="#000" stroke="#fff1dc" strokeWidth="2" />
    </svg>
  );
}
function Vault() {
  return (
    <svg width={420} height={420} viewBox="0 0 200 200">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={100} cy={100} r={30 + i * 12} fill="none" stroke={V.paper} strokeOpacity={0.12 + i * 0.06} strokeWidth="0.8" strokeDasharray="2 4" />
      ))}
      <rect x={62} y={70} width={76} height={60} fill="none" stroke={V.paper} strokeWidth="1.4" />
      <circle cx={100} cy={100} r={14} fill="none" stroke={V.orange} strokeWidth="1.6" />
      <text x={100} y={160} textAnchor="middle" fontFamily={VF.mono} fontSize={9} letterSpacing={2} fill={V.muted}>
        TREASURY WALLET
      </text>
    </svg>
  );
}
const MOVES: { n: number; name: string; eth: string; line: string; art: (k: number) => React.ReactNode }[] = [
  { n: 1, name: "The Emission", eth: "0.02 ETH", line: "Straight to the ten nearest the core. Red zone No. 1-5 share 0.014, amber zone No. 6-10 share 0.006, by balance.", art: (k) => <Orbits k={k} /> },
  { n: 2, name: "Containment Fund", eth: "0.025 ETH", line: "To the treasury wallet. Every transfer is in the incident log.", art: () => <Vault /> },
  { n: 3, name: "Evaporation", eth: "0.01 ETH", line: "Buys $HAWK back on Pons, then burns exactly what it bought.", art: (k) => <Hole size={460} spin={k * 6} /> },
  { n: 4, name: "Containment Fund", eth: "0.025 ETH", line: "Treasury again. Then the cycle starts over from step one.", art: () => <Vault /> },
];
function Moves() {
  const f = useCurrentFrame();
  const len = 110;
  const i = Math.min(3, Math.floor(f / len));
  const local = f - i * len;
  const slide = ease(ramp(local, 0, 18));
  const m = MOVES[i];
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        {MOVES.map((x, k) => (
          <div key={k} style={{ padding: "10px 18px", border: `1px solid ${k === i ? V.orange : V.hair2}`, background: k === i ? V.orange : "transparent", color: k === i ? V.void : V.paper, opacity: k === i ? 1 : k < i ? 0.7 : 0.45, fontFamily: VF.mono, fontSize: 22 }}>
            ({x.n}) {x.name} · {x.eth}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, top: 250, transform: `translateX(${(1 - slide) * 120}px)`, opacity: slide }}>
        <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, letterSpacing: "0.18em", color: V.muted }}>STEP {m.n}</div>
        <Head size={130} style={{ marginTop: 8 }}>
          {m.name}
        </Head>
        <Mono size={56} color={V.orange} style={{ marginTop: 16 }}>
          {m.eth}
        </Mono>
        <Body size={38} color={V.paper} style={{ marginTop: 28, maxWidth: 800 }}>
          {m.line}
        </Body>
      </div>
      <div style={{ position: "absolute", right: 150, top: 300, transform: `translateY(${(1 - back(ramp(local, 6, 26))) * 60}px)`, opacity: ramp(local, 6, 16) }}>{m.art(local / 60)}</div>
    </AbsoluteFill>
  );
}

/* 6. the cycle, in shares */
function Round() {
  const parts: [string, number, string, string][] = [
    ["The Emission", 25, V.orange, "#121212"],
    ["Containment Fund", 62.5, V.paper, "#121212"],
    ["Evaporation", 12.5, V.red, V.paper],
  ];
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <div style={{ position: "absolute", left: 140, top: 220, right: 140 }}>
        <In at={0}>
          <Head size={116}>
            Cycle after cycle,
            <br />
            <span style={{ color: V.orange }}>for as long as people trade.</span>
          </Head>
        </In>
        <div style={{ display: "flex", height: 120, marginTop: 80, border: `1px solid ${V.hair2}` }}>
          {parts.map(([name, pct, bg, ink], i) => (
            <div key={name} style={{ flexGrow: pct * ease(ramp(f, 20 + i * 10, 50 + i * 10)) + 0.001, background: bg, color: ink, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", overflow: "hidden", whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: VF.mono, fontSize: 36 }}>{pct}%</span>
              <span style={{ fontFamily: VF.display, fontWeight: 800, fontSize: 30 }}>{name}</span>
            </div>
          ))}
        </div>
        <In at={60}>
          <Fig n={3} size={28} style={{ marginTop: 30 }}>
            One full cycle: 0.02 to the ten nearest, 0.05 to the containment fund, 0.01 bought back and burned.
          </Fig>
        </In>
      </div>
    </AbsoluteFill>
  );
}

/* 7. one sale and you're spaghettified */
function Spaghetti() {
  const f = useCurrentFrame();
  const k = easeInOut(ramp(f, 40, 110));
  // the body stretches along the fall line and thins to a thread
  const len = 40 + k * 620;
  const thick = 40 * (1 - k * 0.9);
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <div style={{ position: "absolute", right: -40, top: 160 }}>
        <Hole size={760} spin={f * 0.04} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 210, width: 860 }}>
        <In at={0}>
          <Head size={124}>
            One sale and you're <span style={{ color: V.orange }}>spaghettified.</span>
          </Head>
        </In>
        <In at={16}>
          <Body size={38} color={V.paper} style={{ marginTop: 34 }}>
            For good. Moving between your own wallets is not a sale. Your spot goes to the next holder in line.
          </Body>
        </In>
      </div>
      <div style={{ position: "absolute", left: 1500 - len, top: 540 - thick / 2, width: len, height: thick, borderRadius: thick, background: `linear-gradient(90deg, rgba(243,243,239,${1 - k * 0.6}), ${V.orange})`, opacity: 1 - ramp(f, 120, 150), transform: `rotate(${-6 + k * 4}deg)`, transformOrigin: "100% 50%" }} />
    </AbsoluteFill>
  );
}

/* 8. the close */
function End() {
  return (
    <AbsoluteFill>
      <Plate src="hk/plate-hero.png" dark={0.25} from={1.08} to={1.16} origin="69% 50%" />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, #0b0b0c 0%, rgba(11,11,12,0.6) 40%, rgba(11,11,12,0) 70%)" }} />
      <div style={{ position: "absolute", left: 130, bottom: 120 }}>
        <In at={6}>
          <Head size={190}>Hold <span style={{ color: V.orange }}>closer.</span></Head>
        </In>
        <In at={18}>
          <div style={{ display: "flex", gap: 40, alignItems: "baseline", marginTop: 24 }}>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 60, color: V.paper }}>$HAWK</span>
            <Mono size={42} color={V.orange}>
              {SITE}
            </Mono>
            <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 36, color: V.paper }}>Robinhood Chain · on Pons</span>
          </div>
        </In>
        <Rule style={{ marginTop: 28, width: 1200 }} />
      </div>
    </AbsoluteFill>
  );
}

const CUT: [number, () => React.ReactElement][] = [
  [150, Intro],
  [200, TheOrbit],
  [120, Shot],
  [170, Escrow],
  [440, Moves],
  [160, Round],
  [190, Spaghetti],
  [160, End],
];
export const HK_EXPLAINER_LENGTH = CUT.reduce((t, [n]) => t + n, 0) - XF * (CUT.length - 1);

function Fade({ children, first }: { children: React.ReactNode; first: boolean }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: first ? 1 : Math.min(1, f / XF) }}>{children}</AbsoluteFill>;
}

export function HKExplainer() {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: V.void }}>
      {CUT.map(([len, Scene], i) => {
        const from = at;
        at += len - XF;
        return (
          <Sequence key={i} from={from} durationInFrames={len} premountFor={30}>
            <Fade first={i === 0}>
              <Scene />
            </Fade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

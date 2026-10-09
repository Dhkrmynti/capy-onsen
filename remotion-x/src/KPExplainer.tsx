/**
 * "How Kingpins works": the crown goes to the biggest holder, every trade's fee fills the escrow,
 * and the engine plays four moves (Tribute 0.02 to the top 10 in two tiers, War Chest 0.025,
 * Burn 0.01, War Chest 0.025). One sale and you're captured. Scenes cross-dissolve.
 */
import type React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BoardField, Body, Crown, Head, K, KF, Mono, Piece, Sig, Token, back, ease, easeInOut, ramp, type PieceKind } from "./KPTheme";
import { Gauge } from "./KPGauge";

const XF = 14;

function In({ at, dur = 16, y = 26, children, style }: { at: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const f = useCurrentFrame();
  const t = ease(ramp(f, at, at + dur));
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)`, ...style }}>{children}</div>;
}

function Field({ color, children }: { color: string; children: React.ReactNode }) {
  return <AbsoluteFill style={{ background: color, overflow: "hidden" }}>{children}</AbsoluteFill>;
}

/* 1. the crown drops onto the King */
function Intro() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f - 10, fps, config: { damping: 9, mass: 1.2 } });
  return (
    <Field color={K.violet}>
      <div style={{ position: "absolute", left: "50%", bottom: -380, transform: "translateX(-50%) perspective(900px) rotateX(58deg)", transformOrigin: "50% 100%" }}>
        <BoardField cell={150} />
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ transform: `translateY(${(1 - drop) * -520}px) rotate(${(1 - drop) * -20}deg)`, zIndex: 2, marginBottom: -50 }}>
          <Crown size={300} />
        </div>
        <Piece kind="king" size={300} fill={K.crown} />
        <In at={34}>
          <Head size={150} style={{ marginTop: 20 }}>
            KINGPINS
          </Head>
        </In>
        <In at={46}>
          <Body size={44} color={K.lime} style={{ textAlign: "center" }}>
            The biggest holder wears the crown.
          </Body>
        </In>
      </AbsoluteFill>
    </Field>
  );
}

/* 2. the crown moves when someone out-holds the King */
const RACE: [string, number][] = [
  ["@kingwhale", 9.4],
  ["0x2f8c…6a9f", 7.1],
  ["trustfundtony", 4.8],
  ["0xc0ff…e6f3", 3.1],
  ["@margaux_ashford", 2.4],
];
function TheCrown() {
  const f = useCurrentFrame();
  const g = easeInOut(ramp(f, 40, 120));
  const bal = RACE.map(([, b], i) => (i === 1 ? b + g * 3.6 : b));
  const order = bal.map((b, i) => [b, i] as const).sort((a, b) => b[0] - a[0]);
  const kingIdx = order[0][1];
  const hop = ramp(f, 118, 150);
  return (
    <Field color={K.grape0}>
      <div style={{ position: "absolute", left: 120, top: 120, width: 760 }}>
        <In at={0}>
          <Head size={104}>
            Most $KING
            <br />
            <span style={{ color: K.lime }}>wears the crown.</span>
          </Head>
        </In>
        <In at={14}>
          <Body size={36} style={{ marginTop: 30 }}>
            The board is live. Buy enough to pass No. 1 and the crown is yours, on the spot. Updated every few seconds.
          </Body>
        </In>
      </div>
      <div style={{ position: "absolute", right: 110, bottom: 120, display: "flex", gap: 22, alignItems: "flex-end" }}>
        {RACE.map(([name], i) => {
          const rank = order.findIndex(([, k]) => k === i);
          const king = i === kingIdx;
          return (
            <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, order: rank }}>
              {king ? (
                <div style={{ marginBottom: -10, transform: `translateY(${i === 1 ? (1 - back(hop)) * -160 : 0}px)` }}>
                  <Crown size={120} />
                </div>
              ) : null}
              <Token bg={king ? K.crown : rank % 2 ? K.violet : K.lime} color={king || rank % 2 === 0 ? K.ink : K.cream} style={{ width: 150, height: 60 + bal[i] * 42, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12 }}>
                <Mono size={24} color={king || rank % 2 === 0 ? K.ink : K.cream}>
                  {bal[i].toFixed(1)}M
                </Mono>
              </Token>
              <Mono size={18} color={K.cream2}>
                No. {rank + 1}
              </Mono>
              <Body size={20} color={K.cream}>
                {name}
              </Body>
            </div>
          );
        })}
      </div>
    </Field>
  );
}

/* 3. fees fill the escrow */
function Escrow() {
  const f = useCurrentFrame();
  const fill = easeInOut(ramp(f, 20, 130));
  const chips = ["buy 0.42 ETH", "sell 0.10 ETH", "buy 1.05 ETH", "buy 0.21 ETH", "buy 0.66 ETH"];
  return (
    <Field color={K.violet}>
      <div style={{ position: "absolute", left: 120, top: 170, width: 860 }}>
        <In at={0}>
          <Head size={100}>Every trade drops a fee in the escrow.</Head>
        </In>
        <In at={16}>
          <Body size={36} color={K.cream} style={{ marginTop: 30 }}>
            When it reaches the next move's size, the engine claims it and plays the move. Then it fills again.
          </Body>
        </In>
      </div>
      <div style={{ position: "absolute", right: 170, top: 250 }}>
        <Token bg={K.grape0} style={{ padding: 30, borderRadius: 34 }}>
          <Gauge fill={fill} target={0.02} size={460} label="ESCROW" />
        </Token>
      </div>
      {chips.map((c, i) => {
        const t0 = 20 + i * 20;
        const t = ramp(f, t0, t0 + 34);
        if (t <= 0 || t >= 1) return null;
        return (
          <div key={c} style={{ position: "absolute", left: interpolate(t, [0, 1], [1920, 1420]), top: interpolate(t, [0, 1], [200 + i * 140, 520]), opacity: 1 - t * t }}>
            <Token bg={K.lime} style={{ padding: "8px 16px", borderRadius: 999 }}>
              <Mono size={24} color={K.ink}>
                {c}
              </Mono>
            </Token>
          </div>
        );
      })}
    </Field>
  );
}

/* 4. the four moves */
const MOVES: { n: number; name: string; eth: string; line: string; bg: string; ink: string; art: React.ReactNode }[] = [
  {
    n: 1,
    name: "The Tribute",
    eth: "0.02 ETH",
    line: "Straight to the top 10. No. 1–5 split 0.014, No. 6–10 split 0.006, by balance.",
    bg: K.lime,
    ink: K.ink,
    art: (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        {(["king", "queen", "rook", "bishop", "knight", "pawn", "pawn", "pawn", "pawn", "pawn"] as PieceKind[]).map((k, i) => (
          <Piece key={i} kind={k} size={i < 5 ? 110 : 76} fill={i === 0 ? K.crown : K.cream} />
        ))}
      </div>
    ),
  },
  { n: 2, name: "The War Chest", eth: "0.025 ETH", line: "To the treasury wallet. Every transfer is on the Record.", bg: K.violet, ink: K.cream, art: <Chest /> },
  { n: 3, name: "The Burn", eth: "0.01 ETH", line: "Buys $KING back on the market, then burns exactly what it bought.", bg: K.crown, ink: K.ink, art: <Flame /> },
  { n: 4, name: "The War Chest", eth: "0.025 ETH", line: "Treasury again. Then the round starts over from move one.", bg: K.violetDeep, ink: K.cream, art: <Chest /> },
];
function Chest() {
  return (
    <svg width={260} height={200} viewBox="0 0 130 100" style={{ filter: `drop-shadow(0 8px 0 ${K.ink})` }}>
      <rect x="8" y="34" width="114" height="60" rx="8" fill={K.lime} stroke={K.ink} strokeWidth="5" />
      <path d="M8 40 C 8 14, 122 14, 122 40 Z" fill={K.lime} stroke={K.ink} strokeWidth="5" strokeLinejoin="round" />
      <rect x="54" y="40" width="22" height="26" rx="4" fill={K.cream} stroke={K.ink} strokeWidth="4" />
    </svg>
  );
}
function Flame() {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f * 0.5) * 0.05;
  return (
    <svg width={220} height={240} viewBox="0 0 110 120" style={{ transform: `scale(${k})`, filter: `drop-shadow(0 8px 0 ${K.ink})` }}>
      <path d="M55 6 C 74 34 98 46 92 78 C 88 102 72 114 55 114 C 38 114 22 102 18 78 C 12 46 36 34 55 6 Z" fill={K.cream} stroke={K.ink} strokeWidth="5" />
      <path d="M55 52 C 64 66 74 72 70 88 C 68 98 62 104 55 104 C 48 104 42 98 40 88 C 36 72 46 66 55 52 Z" fill={K.exile} stroke={K.ink} strokeWidth="4" />
    </svg>
  );
}
function Moves() {
  const f = useCurrentFrame();
  const len = 110;
  const i = Math.min(3, Math.floor(f / len));
  const local = f - i * len;
  const slide = ease(ramp(local, 0, 18));
  const m = MOVES[i];
  return (
    <Field color={m.bg}>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14 }}>
        {MOVES.map((x, k) => (
          <Token key={k} bg={k === i ? K.ink : "transparent"} color={k === i ? K.lime : m.ink} style={{ padding: "10px 18px", borderRadius: 999, boxShadow: "none", borderColor: k === i ? K.ink : m.ink, opacity: k === i ? 1 : 0.55 }}>
            <span style={{ fontFamily: KF.body, fontWeight: 800, fontSize: 22 }}>
              {x.n}. {x.name.replace("The ", "")} · {x.eth}
            </span>
          </Token>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, top: 230, transform: `translateX(${(1 - slide) * 120}px)`, opacity: slide }}>
        <div style={{ fontFamily: KF.display, fontSize: 130, color: m.ink, opacity: 0.35, lineHeight: 1 }}>{m.n}.</div>
        <Head size={120} color={m.ink} style={{ textShadow: "none" }}>
          {m.name}
        </Head>
        <Mono size={52} color={m.ink} style={{ marginTop: 10 }}>
          {m.eth}
        </Mono>
        <Body size={36} color={m.ink} style={{ marginTop: 26, maxWidth: 780 }}>
          {m.line}
        </Body>
      </div>
      <div style={{ position: "absolute", right: 140, top: 380, transform: `translateY(${(1 - back(ramp(local, 6, 26))) * 60}px)`, opacity: ramp(local, 6, 16) }}>{m.art}</div>
    </Field>
  );
}

/* 5. the round, in shares */
function Round() {
  const parts: [string, number, string, string][] = [
    ["Tribute", 25, K.lime, K.ink],
    ["War Chest", 63, K.violet, K.cream],
    ["Burn", 12, K.crown, K.ink],
  ];
  const f = useCurrentFrame();
  return (
    <Field color={K.grape0}>
      <div style={{ position: "absolute", left: 140, top: 210, right: 140 }}>
        <In at={0}>
          <Head size={110}>
            Round after round,
            <br />
            <span style={{ color: K.lime }}>for as long as people trade.</span>
          </Head>
        </In>
        <div style={{ display: "flex", height: 120, marginTop: 70, border: `6px solid ${K.ink}`, borderRadius: 22, overflow: "hidden", boxShadow: `0 12px 0 #07030f` }}>
          {parts.map(([name, pct, bg, ink], i) => (
            <div key={name} style={{ flexGrow: pct * ease(ramp(f, 20 + i * 10, 50 + i * 10)) + 0.001, background: bg, color: ink, display: "flex", alignItems: "center", gap: 14, padding: "0 26px", overflow: "hidden", whiteSpace: "nowrap" }}>
              <Mono size={36} color={ink}>
                {pct}%
              </Mono>
              <span style={{ fontFamily: KF.body, fontWeight: 800, fontSize: 30 }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </Field>
  );
}

/* 6. one sale and you're captured */
function Captured() {
  const f = useCurrentFrame();
  const fall = easeInOut(ramp(f, 40, 70));
  return (
    <Field color={K.lime}>
      <div style={{ position: "absolute", left: 140, top: 200, width: 900 }}>
        <In at={0}>
          <Head size={120} color={K.ink} style={{ textShadow: "none" }}>
            One sale and you're <span style={{ color: K.exile }}>captured.</span>
          </Head>
        </In>
        <In at={16}>
          <Body size={38} color={K.ink} style={{ marginTop: 30 }}>
            For good. Moving between your own wallets is not a sale. Your square goes to the next holder in line.
          </Body>
        </In>
      </div>
      <div style={{ position: "absolute", right: 260, top: 330, transform: `rotate(${fall * 90}deg) translateY(${fall * 40}px)`, transformOrigin: "50% 100%" }}>
        <Piece kind="pawn" size={300} fill={K.cream} />
      </div>
      <div style={{ position: "absolute", right: 200, top: 260, opacity: ramp(f, 66, 74), transform: `scale(${0.6 + back(ramp(f, 66, 80)) * 0.4}) rotate(-10deg)` }}>
        <Token bg={K.exile} color={K.cream} style={{ padding: "12px 26px" }}>
          <span style={{ fontFamily: KF.display, fontSize: 62 }}>CAPTURED</span>
        </Token>
      </div>
    </Field>
  );
}

/* 7. the close */
function End() {
  const f = useCurrentFrame();
  return (
    <Field color={K.crown}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
        <div style={{ marginBottom: -40, zIndex: 2, transform: `translateY(${Math.sin(f * 0.12) * 8}px)` }}>
          <Crown size={240} />
        </div>
        <Piece kind="king" size={240} fill={K.cream} />
        <In at={6}>
          <Head size={140} color={K.ink} style={{ textShadow: "none" }}>
            Take the crown.
          </Head>
        </In>
        <In at={18}>
          <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
            <span style={{ fontFamily: KF.display, fontSize: 52, color: K.ink }}>$KING</span>
            <Mono size={40} color={K.ink}>
              kingpins.fun
            </Mono>
            <span style={{ fontFamily: KF.body, fontWeight: 800, fontSize: 32, color: K.ink }}>Robinhood Chain · on Pons</span>
          </div>
        </In>
      </AbsoluteFill>
    </Field>
  );
}

function Shot() {
  return (
    <AbsoluteFill style={{ background: K.grape0 }}>
      <Img src={staticFile("kp/s-_ladder_0.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-end", padding: 50 }}>
        <Mono size={20} color={K.cream2}>
          illustration · the Ladder on kingpins.fun
        </Mono>
      </AbsoluteFill>
      <Sig style={{ left: 50, bottom: 40 }} />
    </AbsoluteFill>
  );
}

const CUT: [number, () => React.ReactElement][] = [
  [140, Intro],
  [200, TheCrown],
  [120, Shot],
  [170, Escrow],
  [440, Moves],
  [150, Round],
  [190, Captured],
  [150, End],
];
export const KP_EXPLAINER_LENGTH = CUT.reduce((t, [n]) => t + n, 0) - XF * (CUT.length - 1);

function Fade({ children, first }: { children: React.ReactNode; first: boolean }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: first ? 1 : Math.min(1, f / XF) }}>{children}</AbsoluteFill>;
}

export function KPExplainer() {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: K.grape0 }}>
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

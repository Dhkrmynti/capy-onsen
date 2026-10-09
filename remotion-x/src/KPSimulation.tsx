/**
 * "Watch the fees move": a simulation of the engine. The escrow fills from 0 with each trade's
 * fee; at the turn's size it is claimed, paid out, and back to 0. Inheritance 0.02 ETH to the
 * Ten Heirs (0.014 to No. 1–5, 0.006 to No. 6–10), upkeep 0.025 ETH to the house wallet,
 * the hearth 0.01 ETH bought back and burned, upkeep again, then the round loops (faster).
 * Every figure is illustrative.
 */
import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Body, Caps, Coin, H, HF, Head, Plate, clamp, ease, easeInOut, ramp } from "./KPCompat";
import { Gauge } from "./KPGauge";

type Kind = "feeding" | "keeper" | "sink";
const TURNS: { kind: Kind; n: string; name: string; eth: number; to: string; color: string }[] = [
  { kind: "feeding", n: "I", name: "The Tribute", eth: 0.02, to: "the top 10", color: H.feeding },
  { kind: "keeper", n: "II", name: "The War Chest", eth: 0.025, to: "the treasury wallet", color: "#a9c1e8" },
  { kind: "sink", n: "III", name: "The Burn", eth: 0.01, to: "buyback & burn", color: "#e7a3ab" },
  { kind: "keeper", n: "IV", name: "The War Chest", eth: 0.025, to: "the treasury wallet", color: "#a9c1e8" },
];

const INTRO = 75;
const FILL = 130;
const PAY = 95;
const ROUNDS = [1, 0.5]; // round 2 runs at twice the speed
const OUTRO = 150;

interface Phase {
  round: number;
  turn: number;
  start: number;
  fill: number;
  pay: number;
}

const PHASES: Phase[] = (() => {
  const out: Phase[] = [];
  let at = INTRO;
  ROUNDS.forEach((sp, round) =>
    TURNS.forEach((_, turn) => {
      const fill = Math.round(FILL * sp);
      const pay = Math.round(PAY * sp);
      out.push({ round, turn, start: at, fill, pay });
      at += fill + pay;
    }),
  );
  return out;
})();
const END = PHASES[PHASES.length - 1].start + PHASES[PHASES.length - 1].fill + PHASES[PHASES.length - 1].pay;
export const KP_SIM_LENGTH = END + OUTRO;

/** Deterministic "random" for the trade fees. */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** The fees that fill one turn: a handful of trades, sizes that add up exactly to the turn. */
function fees(seed: number, target: number) {
  const n = 6 + Math.floor(rnd(seed) * 3);
  const w = Array.from({ length: n }, (_, i) => 0.4 + rnd(seed * 7 + i));
  const sum = w.reduce((a, b) => a + b, 0);
  const at = w.map((_, i) => (i + 0.4 + rnd(seed * 13 + i) * 0.5) / (n + 0.4));
  return w.map((x, i) => ({ amt: (x / sum) * target, at: Math.min(0.97, at[i]) }));
}

const HEIRS = [9.4, 6.6, 4.8, 3.1, 2.4, 1.7, 1.2, 0.82, 0.56, 0.4];
const split = (i: number) => {
  const tier = i < 5 ? 0 : 1;
  const pot = tier ? 0.006 : 0.014;
  const sum = HEIRS.slice(tier * 5, tier * 5 + 5).reduce((a, b) => a + b, 0);
  return (pot * HEIRS[i]) / sum;
};

/** Where the film is: which turn, how full the escrow is, and what has been paid so far. */
function stateAt(f: number) {
  let cur: Phase | null = null;
  for (const p of PHASES) if (f >= p.start) cur = p;
  const totals = { heirs: 0, house: 0, burnedTokens: 0, burnedEth: 0, rounds: 0 };
  const lines: { kind: Kind; text: string; eth: number; at: number }[] = [];
  let n = 0;
  for (const p of PHASES) {
    const t = TURNS[p.turn];
    const payEnd = p.start + p.fill + p.pay;
    const payK = ramp(f, p.start + p.fill + 8, payEnd - 14);
    if (f < p.start + p.fill + 8) break;
    n++;
    if (t.kind === "feeding") totals.heirs += t.eth * payK;
    if (t.kind === "keeper") totals.house += t.eth * payK;
    if (t.kind === "sink") {
      totals.burnedEth += t.eth * payK;
      totals.burnedTokens += 520000 * (1 - p.round * 0.06) * ramp(f, p.start + p.fill + p.pay * 0.55, payEnd - 10);
    }
    if (payK >= 1) {
      lines.unshift({
        kind: t.kind,
        eth: t.eth,
        at: payEnd,
        text: t.kind === "feeding" ? "Paid to the top 10" : t.kind === "keeper" ? "Transferred to the treasury" : `${Math.round(520000 * (1 - p.round * 0.06)).toLocaleString("en-US")} $KING bought and burned`,
      });
      if (p.turn === 3) totals.rounds++;
    }
  }
  return { cur, totals, lines: lines.slice(0, 4), n };
}

/* ───────────── pieces ───────────── */

function Tracker({ turn, round }: { turn: number; round: number }) {
  return (
    <div style={{ position: "absolute", top: 46, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
      <div style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 20, letterSpacing: "0.18em", color: H.gold2, marginRight: 18 }}>ROUND {round + 1}</div>
      {TURNS.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: "10px 18px", borderRadius: 6, border: `2px solid ${i === turn ? H.gold2 : "rgba(201,164,92,0.3)"}`, background: i === turn ? "rgba(232,193,110,0.18)" : i < turn ? "rgba(201,164,92,0.08)" : "rgba(11,20,36,0.6)", display: "flex", alignItems: "baseline", gap: 10, opacity: i === turn ? 1 : i < turn ? 0.75 : 0.45, boxShadow: i === turn ? "0 0 26px rgba(232,193,110,0.35)" : "none" }}>
            <span style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 17, color: H.gold2 }}>{i < turn ? "✓" : t.n}</span>
            <span style={{ fontFamily: HF.display, fontSize: 25, color: t.color }}>{t.name}</span>
            <span style={{ fontFamily: HF.data, fontWeight: 600, fontSize: 19, color: H.gold2 }}>{t.eth}</span>
          </div>
          <span style={{ fontFamily: HF.display, fontSize: 28, color: H.gold }}>{i < TURNS.length - 1 ? "→" : "↺"}</span>
        </div>
      ))}
    </div>
  );
}

function Dest({ title, sub, value, active, color, children }: { title: string; sub: string; value: string; active: boolean; color: string; children?: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 10, padding: "20px 26px", background: "rgba(13,22,39,0.92)", borderTop: `3px solid ${active ? H.gold2 : "rgba(201,164,92,0.4)"}`, boxShadow: active ? `0 0 0 2px ${H.gold}, 0 0 40px rgba(232,193,110,0.35)` : "0 30px 60px -30px rgba(0,0,0,0.9)", transform: `scale(${active ? 1.02 : 1})`, transition: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontFamily: HF.display, fontSize: 34, color }}>{title}</div>
          <div style={{ fontFamily: HF.serifItalic, fontSize: 20, color: H.text2 }}>{sub}</div>
        </div>
        <div style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 34, color: H.text }}>{value}</div>
      </div>
      {children}
    </div>
  );
}

/* ───────────── the film ───────────── */

export function KPSimulation() {
  const f = useCurrentFrame();
  const { cur, totals, lines } = stateAt(f);
  const p = cur ?? PHASES[0];
  const t = TURNS[p.turn];
  const local = f - p.start;
  // escrow: fees arrive during the fill; drained to 0 during the pay
  const list = fees(p.round * 10 + p.turn + 1, t.eth);
  const filled = list.reduce((s, x) => s + x.amt * ease(ramp(local, x.at * p.fill, x.at * p.fill + 6)), 0);
  const drain = easeInOut(ramp(local, p.fill + 8, p.fill + p.pay - 14));
  const escrow = f < INTRO ? 0 : Math.max(0, filled * (1 - drain));
  const claim = ramp(local, p.fill - 4, p.fill + 4) * (1 - ramp(local, p.fill + 22, p.fill + 32));
  const paying = local >= p.fill + 8 && local < p.fill + p.pay - 6;
  const intro = ease(ramp(f, 0, 30));
  const outro = ramp(f, END, END + 24);

  // where the coins fly to
  const target = t.kind === "feeding" ? [1440, 330] : t.kind === "keeper" ? [1440, 620] : [1440, 820];
  const coins = paying ? Array.from({ length: 7 }, (_, i) => i) : [];

  const sinkBuy = t.kind === "sink" ? ramp(local, p.fill + 8, p.fill + p.pay * 0.5) : 0;
  const sinkBurn = t.kind === "sink" ? ramp(local, p.fill + p.pay * 0.5, p.fill + p.pay - 10) : 0;
  const flick = (k: number) => 0.85 + Math.sin(f * 0.9 + k) * 0.08 + Math.sin(f * 2.3 + k * 2) * 0.05;

  return (
    <AbsoluteFill style={{ background: H.v0 }}>
      <Plate src="kp/plate-hero.png" dark={0.84} />
      <div style={{ opacity: intro * (1 - outro) }}>
        <Tracker turn={f < INTRO ? -1 : p.turn} round={p.round} />

        {/* the escrow */}
        <div style={{ position: "absolute", left: 110, top: 170, width: 760 }}>
          <Caps size={20}>Simulation · the escrow</Caps>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 10 }}>
            <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 104, color: H.text, letterSpacing: "-0.02em" }}>{escrow.toFixed(4)}</span>
            <span style={{ fontFamily: HF.data, fontWeight: 600, fontSize: 40, color: H.text2 }}>/ {t.eth} ETH</span>
          </div>
          <Body size={28} style={{ marginTop: 4 }}>
            {f < INTRO ? "Every trade pays a small fee into the escrow." : paying || drain > 0 ? <>Claimed. Paying <b style={{ color: t.color }}>{t.eth} ETH</b> to {t.to}…</> : <>Filling for <b style={{ color: t.color }}>{t.name}</b> → {t.to}</>}
          </Body>
          <div style={{ position: "relative", marginTop: 30, marginLeft: 90 }}>
            <Gauge fill={escrow / t.eth} target={t.eth} size={460} />
            <div style={{ position: "absolute", left: -40, top: -40, width: 540, height: 540, borderRadius: "50%", background: `radial-gradient(circle, rgba(232,193,110,0) 52%, rgba(232,193,110,${0.55 * claim}) 62%, rgba(232,193,110,0) 74%)`, pointerEvents: "none" }} />
            {claim > 0.05 ? (
              <div style={{ position: "absolute", left: 500, top: 190, textAlign: "left", fontFamily: HF.caps, fontWeight: 700, fontSize: 44, letterSpacing: "0.2em", color: H.gold2, opacity: claim, transform: `scale(${0.9 + claim * 0.2})`, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>
                CLAIM
              </div>
            ) : null}
          </div>
        </div>

        {/* fees arriving */}
        {f >= INTRO &&
          list.map((x, i) => {
            const a = x.at * p.fill;
            const k = ramp(local, a - 22, a);
            if (k <= 0 || k >= 1) return null;
            const kk = easeInOut(k);
            return (
              <div key={i} style={{ position: "absolute", left: interpolate(kk, [0, 1], [-40, 470]), top: interpolate(kk, [0, 1], [460 + (i % 3) * 120, 640]), opacity: 1 - kk * 0.6, fontFamily: HF.data, fontWeight: 700, fontSize: 26, color: H.v0, background: H.gold2, padding: "6px 14px", borderRadius: 4, whiteSpace: "nowrap" }}>
                trade fee +{x.amt.toFixed(4)}
              </div>
            );
          })}

        {/* coins flying to where the turn pays */}
        {coins.map((i) => {
          const span = (p.pay - 20) / 7;
          const a = p.fill + 8 + i * span * 0.7;
          const k = ramp(local, a, a + 26);
          if (k <= 0 || k >= 1) return null;
          const kk = easeInOut(k);
          const x = interpolate(kk, [0, 1], [430, target[0] - 220]);
          const y = interpolate(kk, [0, 1], [700, target[1]]) - Math.sin(kk * Math.PI) * 160;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y }}>
              <Coin size={58} turn={k * 9} glow={0.3} id={`sc${i}`} />
            </div>
          );
        })}

        {/* where it goes */}
        <div style={{ position: "absolute", right: 90, top: 150, width: 820, display: "flex", flexDirection: "column", gap: 20 }}>
          <Dest title="The Top 10" sub="No. 1–5 share 0.014 · No. 6–10 share 0.006" value={`${totals.heirs.toFixed(3)} ETH`} active={t.kind === "feeding" && f >= INTRO} color={H.feeding}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6, marginTop: 14, alignItems: "end", height: 74 }}>
              {HEIRS.map((_, i) => {
                const got = (totals.heirs / 0.02) * split(i);
                const h = 10 + (split(i) / split(0)) * 50;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", height: h, borderRadius: 3, background: i < 5 ? H.gold2 : "rgba(232,193,110,0.45)", opacity: got > 0 ? 1 : 0.35 }} />
                    <span style={{ fontFamily: HF.data, fontWeight: 600, fontSize: 13, color: i < 5 ? H.gold2 : H.text2 }}>#{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </Dest>
          <Dest title="The War Chest" sub="to the treasury, twice a round" value={`${totals.house.toFixed(3)} ETH`} active={t.kind === "keeper" && f >= INTRO} color="#a9c1e8" />
          <Dest title="The Burn" sub="buys $KING back, then burns it" value={`${Math.round(totals.burnedTokens).toLocaleString("en-US")} $KING`} active={t.kind === "sink" && f >= INTRO} color="#e7a3ab">
            {t.kind === "sink" && (sinkBuy > 0 || sinkBurn > 0) && sinkBurn < 1 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}>
                <div style={{ position: "relative", width: 120, height: 70 }}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{ position: "absolute", left: 20 + (k - 1) * 22, bottom: 10, width: 70, height: 70 * flick(k) * (0.4 + sinkBurn), borderRadius: "50% 50% 40% 40%", background: "radial-gradient(ellipse at 50% 80%, rgba(255,230,160,0.95), rgba(255,140,60,0.75) 45%, rgba(166,62,74,0) 75%)", filter: "blur(4px)" }} />
                  ))}
                  <div style={{ position: "absolute", left: 10, right: 10, bottom: 0, height: 18, borderRadius: "0 0 60px 60px", background: "linear-gradient(180deg, #e8c16e, #8a6a2a)" }} />
                </div>
                <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 24, color: H.gold2 }}>{sinkBurn > 0 ? "burning → 0x…dEaD" : "buying $KING on the market…"}</span>
              </div>
            ) : null}
          </Dest>
          {/* the statement */}
          <div style={{ borderRadius: 10, background: H.paper, color: H.ink, padding: "14px 22px", minHeight: 196 }}>
            <div style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 16, letterSpacing: "0.18em", color: H.deedBlue, marginBottom: 6 }}>THE STATEMENT · NEWEST FIRST</div>
            {lines.map((l, i) => (
              <div key={`${l.at}`} style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: 12, padding: "6px 0", borderTop: "1px dotted rgba(28,25,19,0.3)", opacity: i === 0 ? ramp(f, l.at - 14, l.at) : 1 - i * 0.12, fontSize: 21 }}>
                <span style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 15, letterSpacing: "0.14em", color: l.kind === "feeding" ? "#8a5d12" : l.kind === "keeper" ? H.deedBlue : H.wax, alignSelf: "center" }}>{l.kind === "feeding" ? "TRIBUTE" : l.kind === "keeper" ? "WAR CHEST" : "BURN"}</span>
                <span style={{ fontFamily: HF.serif }}>{l.text}</span>
                <span style={{ fontFamily: HF.data, fontWeight: 700 }}>{l.eth.toFixed(4)} ETH</span>
              </div>
            ))}
          </div>
        </div>

        <Body size={20} italic style={{ position: "absolute", left: 110, bottom: 40 }}>
          Simulation: trades, amounts and holders are illustrative. Real payments appear on kingpins.fun with their transactions.
        </Body>
        {p.round === 1 && f < END ? (
          <div style={{ position: "absolute", left: 110, bottom: 84, fontFamily: HF.caps, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", color: H.gold2, opacity: ramp(f, PHASES[4].start, PHASES[4].start + 12) }}>
            ↺ AND AGAIN · 2× SPEED
          </div>
        ) : null}
      </div>

      {/* the close */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, opacity: outro }}>
        <Coin size={260} turn={f * 0.07} id="simend" />
        <Head size={100} style={{ textAlign: "center" }}>
          Round after round, <span style={{ fontFamily: HF.displayItalic, color: H.gold2 }}>for as long as people trade.</span>
        </Head>
        <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
          <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 32, color: H.feeding }}>{totals.heirs.toFixed(3)} ETH to the top 10</span>
          <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 32, color: "#a9c1e8" }}>{totals.house.toFixed(3)} ETH to the treasury</span>
          <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 32, color: "#e7a3ab" }}>{Math.round(totals.burnedTokens).toLocaleString("en-US")} $KING burned</span>
        </div>
        <div style={{ fontFamily: HF.serif, fontSize: 42, color: H.text }}>kingpins.fun</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export { clamp };

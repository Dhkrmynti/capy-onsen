/**
 * "How Heirloom works": the escrow, the three turns of the cycle (inheritance 0.02 ETH to the
 * ten largest holders, upkeep 0.025 ETH to the house wallet, the hearth 0.01 ETH bought back and
 * burned), the will, and the door. Figures marked as an illustration where they are made up.
 */
import type React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Body, Caps, Coin, H, HF, Head, Panel, Plate, Sig, WaxSeal, clamp, ease, easeInOut, ramp } from "./HLTheme";

const STEPS = [
  { k: "feeding", n: "I", name: "The Inheritance", eth: 0.02, where: "split by balance between the ten largest holders", color: H.feeding },
  { k: "keeper", n: "II", name: "The Upkeep", eth: 0.025, where: "to the house wallet, every transfer on the statement", color: "#a9c1e8" },
  { k: "sink", n: "III", name: "The Hearth", eth: 0.01, where: "buys $HEIR back, then burns it", color: "#e7a3ab" },
] as const;
// One round: inheritance → upkeep → hearth → upkeep. The upkeep comes round twice.
const ROUND = [
  { n: "I", step: 0 },
  { n: "II", step: 1 },
  { n: "III", step: 2 },
  { n: "IV", step: 1 },
] as const;
const TOTAL = 0.02 + 0.025 * 2 + 0.01;
const twice = (k: string) => (k === "keeper" ? 2 : 1);

/* ───────────── pieces ───────────── */

/** The escrow gauge from the vault door: a dial and a needle, filling to the turn's size. */
function Gauge({ fill, target, size = 420, label = "ESCROW" }: { fill: number; target: number; size?: number; label?: string }) {
  const a = -120 + Math.min(1, fill) * 240;
  const ticks = Array.from({ length: 25 }, (_, i) => -120 + i * 10);
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox="-110 -110 220 220">
        <defs>
          <radialGradient id="gface" cx="45%" cy="40%" r="70%">
            <stop offset="0" stopColor="#f3ecd8" />
            <stop offset="1" stopColor="#cfc4a6" />
          </radialGradient>
          <linearGradient id="gbezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1d58e" />
            <stop offset="0.5" stopColor="#9c7428" />
            <stop offset="1" stopColor="#e2bd6c" />
          </linearGradient>
        </defs>
        <circle r={104} fill="url(#gbezel)" />
        <circle r={94} fill="url(#gface)" />
        <path d={arc(78, -120, -120 + 240 * Math.min(1, fill))} fill="none" stroke={H.wax} strokeWidth={8} strokeLinecap="round" />
        {ticks.map((t, i) => {
          const r = (t - 90) * (Math.PI / 180);
          const long = i % 6 === 0;
          return <line key={t} x1={Math.cos(r) * 88} y1={Math.sin(r) * 88} x2={Math.cos(r) * (long ? 72 : 80)} y2={Math.sin(r) * (long ? 72 : 80)} stroke={H.ink} strokeWidth={long ? 2.4 : 1.1} />;
        })}
        <text y={40} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={14} letterSpacing={2} fill={H.ink}>{label}</text>
        <text y={60} textAnchor="middle" fontFamily={HF.data} fontWeight={600} fontSize={15} fill={H.ink2}>{(Math.min(1, fill) * target).toFixed(target < 0.02 ? 4 : 3)} / {target} ETH</text>
        <g transform={`rotate(${a})`}>
          <path d="M -3 10 L 0 -84 L 3 10 Z" fill={H.wax} />
        </g>
        <circle r={9} fill="#3a2a0e" />
        <circle r={4} fill="#d9b25e" />
      </svg>
    </div>
  );
}

function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => [Math.cos(((a - 90) * Math.PI) / 180) * r, Math.sin(((a - 90) * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/** The four turns of a round along the top; the current one lit. */
function Turns({ active }: { active: number | number[] }) {
  const on = (i: number) => (Array.isArray(active) ? active.includes(i) : active === i);
  return (
    <div style={{ position: "absolute", top: 54, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 }}>
      {ROUND.map((t, i) => {
        const s = STEPS[t.step];
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: "10px 18px", borderRadius: 6, border: `2px solid ${on(i) ? H.gold2 : "rgba(201,164,92,0.35)"}`, background: on(i) ? "rgba(232,193,110,0.16)" : "rgba(11,20,36,0.6)", display: "flex", alignItems: "baseline", gap: 10, opacity: on(i) ? 1 : 0.55 }}>
              <span style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 18, color: H.gold2 }}>{t.n}</span>
              <span style={{ fontFamily: HF.display, fontSize: 26, color: s.color }}>{s.name}</span>
              <span style={{ fontFamily: HF.data, fontWeight: 600, fontSize: 20, color: H.gold2 }}>{s.eth}</span>
            </div>
            {i < ROUND.length - 1 ? <span style={{ fontFamily: HF.display, fontSize: 30, color: H.gold }}>→</span> : <span style={{ fontFamily: HF.display, fontSize: 30, color: H.gold }}>↺</span>}
          </div>
        );
      })}
    </div>
  );
}

function FadeIn({ at, dur = 18, y = 24, children }: { at: number; dur?: number; y?: number; children: React.ReactNode }) {
  const f = useCurrentFrame();
  const t = ease(ramp(f, at, at + dur));
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)` }}>{children}</div>;
}

// The next scene dissolves in on top, so a scene never fades itself out.
const out = (_f: number, _len: number) => 1;

/* ───────────── scenes ───────────── */

function Intro({ len }: { len: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f - 6, fps, config: { damping: 13, mass: 1.1 } });
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-door.png" dark={0.62} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div style={{ transform: `translateY(${(1 - drop) * -260}px)` }}>
          <Coin size={380} turn={f * 0.06} id="intro" />
        </div>
        <FadeIn at={26}>
          <Head size={150} style={{ textAlign: "center" }}>Heirloom</Head>
        </FadeIn>
        <FadeIn at={40}>
          <Body size={44} italic color={H.gold2} style={{ textAlign: "center" }}>
            Every trade pays the family. In ETH.
          </Body>
        </FadeIn>
      </AbsoluteFill>
      <Sig style={{ left: 60, bottom: 50 }} />
    </AbsoluteFill>
  );
}

function Escrow({ len }: { len: number }) {
  const f = useCurrentFrame();
  const fill = easeInOut(ramp(f, 30, 140));
  const chips = ["buy 0.42 ETH", "sell 0.10 ETH", "buy 1.05 ETH", "buy 0.21 ETH", "sell 0.33 ETH", "buy 0.66 ETH"];
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-door.png" dark={0.78} origin="70% 50%" />
      <div style={{ position: "absolute", left: 140, top: 230, width: 820 }}>
        <FadeIn at={0}>
          <Caps>Where it starts</Caps>
        </FadeIn>
        <FadeIn at={8}>
          <Head size={96} style={{ marginTop: 18 }}>
            Every trade pays a fee into the escrow.
          </Head>
        </FadeIn>
        <FadeIn at={24}>
          <Body size={38} style={{ marginTop: 28 }}>
            Each time the escrow reaches the size of the next turn, the engine claims it and pays all of it out. Then the next turn begins.
          </Body>
        </FadeIn>
      </div>
      <div style={{ position: "absolute", right: 200, top: 280 }}>
        <Gauge fill={fill} target={0.02} size={520} />
      </div>
      {chips.map((c, i) => {
        const t0 = 24 + i * 18;
        const t = ramp(f, t0, t0 + 36);
        if (t <= 0 || t >= 1) return null;
        const x = interpolate(t, [0, 1], [1920, 1460 - 0]);
        const y = 220 + ((i * 137) % 520);
        return (
          <div key={c} style={{ position: "absolute", left: x, top: interpolate(t, [0, 1], [y, 540]), opacity: 1 - t * t, fontFamily: HF.data, fontWeight: 600, fontSize: 26, color: H.v0, background: H.gold2, padding: "8px 16px", borderRadius: 4 }}>
            {c}
          </div>
        );
      })}
      <Sig style={{ left: 60, bottom: 50 }} />
    </AbsoluteFill>
  );
}

const HEIRS = [
  ["Sterling Whitmore", 9.4],
  ["@heirloomwhale", 6.6],
  ["trustfundtony", 4.8],
  ["Thaddeus Lockhart", 3.1],
  ["@margaux_ashford", 2.4],
  ["Lady Penelope", 1.7],
  ["Penelope Ashcombe", 1.2],
  ["Wilhelmina Rothwell", 0.82],
  ["Margaux Radcliffe", 0.56],
  ["Edmund Stanhope", 0.4],
] as const;
// The engine's split: No. 1–5 share 0.014 ETH, No. 6–10 share 0.006 ETH, by balance within each.
const TIER_POT = [0.014, 0.006];
const tierSum = (k: number) => HEIRS.slice(k * 5, k * 5 + 5).reduce((t, [, b]) => t + b, 0);
const shareOf = (i: number) => (TIER_POT[i < 5 ? 0 : 1] * HEIRS[i][1]) / tierSum(i < 5 ? 0 : 1);

function Inheritance({ len }: { len: number }) {
  const f = useCurrentFrame();
  const fill = 1 - easeInOut(ramp(f, 70, 200));
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-wall.png" dark={0.8} />
      <Turns active={0} />
      <div style={{ position: "absolute", left: 120, top: 200, width: 640 }}>
        <FadeIn at={0}>
          <Caps>Turn I · 0.02 ETH</Caps>
        </FadeIn>
        <FadeIn at={6}>
          <Head size={104} color={H.feeding} style={{ marginTop: 16 }}>
            The Inheritance.
          </Head>
        </FadeIn>
        <FadeIn at={18}>
          <Body size={36} style={{ marginTop: 22 }}>
            <b style={{ color: H.text }}>No. 1–5 share 0.014 ETH</b>, <b style={{ color: H.text }}>No. 6–10 share 0.006 ETH</b>, by balance within each, sent <b style={{ color: H.text }}>straight to their wallets</b>. No claiming, no staking.
          </Body>
        </FadeIn>
        <div style={{ marginTop: 40 }}>
          <Gauge fill={fill} target={0.02} size={330} label="ESCROW" />
        </div>
      </div>
      <Panel style={{ position: "absolute", right: 110, top: 190, width: 900, padding: "26px 34px" }}>
        <Caps size={18} style={{ marginBottom: 6 }}>◆ The inheritance zone</Caps>
        {HEIRS.map(([name, bal], i) => {
          const share = shareOf(i);
          const t0 = 70 + i * 10;
          const t = ease(ramp(f, t0, t0 + 30));
          return (
            <div key={name}>
            {i === 0 || i === 5 ? (
              <div style={{ marginTop: i ? 10 : 4, padding: "4px 10px", borderRadius: 4, background: i ? "rgba(232,193,110,0.18)" : H.gold, color: i ? H.gold2 : H.v0, fontFamily: HF.data, fontWeight: 700, fontSize: 18, letterSpacing: "0.1em" }}>
                {i ? "II · NO. 6–10 · 0.006 ETH" : "I · NO. 1–5 · 0.014 ETH"}
              </div>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 120px 150px", alignItems: "center", gap: 14, height: 52, borderBottom: "1px solid rgba(201,164,92,0.22)" }}>
              <span style={{ fontFamily: HF.displayItalic, fontSize: 28, color: i < 5 ? H.v0 : H.gold2, textAlign: "center", width: 38, height: 38, lineHeight: "38px", borderRadius: "50%", background: i < 5 ? H.gold2 : "none", border: i < 5 ? "none" : `1.5px solid ${H.gold}` }}>{i + 1}</span>
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: HF.display, fontSize: 30, color: H.text }}>{name}</div>
                <div style={{ position: "absolute", left: 0, bottom: -10, height: 5, width: `${(bal / HEIRS[0][1]) * 100 * t}%`, background: H.feeding, borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: HF.data, fontWeight: 600, fontSize: 24, color: H.text2, textAlign: "right" }}>{bal}M</span>
              <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 26, color: H.feeding, textAlign: "right", opacity: t }}>+{share.toFixed(4)} ETH</span>
            </div>
            </div>
          );
        })}
        <Body size={22} italic style={{ marginTop: 14 }}>Illustration: names and balances are made up.</Body>
      </Panel>
      {/* coins flying from the gauge to each heir */}
      {HEIRS.map((_, i) => {
        const t0 = 64 + i * 10;
        const t = ramp(f, t0, t0 + 22);
        if (t <= 0 || t >= 1) return null;
        const k = easeInOut(t);
        const x = interpolate(k, [0, 1], [290, 1500]);
        const y = interpolate(k, [0, 1], [760, 290 + i * 52 + (i >= 5 ? 44 : 0)]) - Math.sin(k * Math.PI) * 120;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y }}>
            <Coin size={54} turn={t * 8} glow={0.3} id={`fly${i}`} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function Upkeep({ len }: { len: number }) {
  const f = useCurrentFrame();
  const fill = easeInOut(ramp(f, 10, 80));
  const go = ease(ramp(f, 90, 130));
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-desk.png" dark={0.78} />
      <Turns active={[1, 3]} />
      <div style={{ position: "absolute", left: 140, top: 230, width: 820 }}>
        <FadeIn at={0}>
          <Caps>Turns II and IV · 0.025 ETH each</Caps>
        </FadeIn>
        <FadeIn at={6}>
          <Head size={104} color="#a9c1e8" style={{ marginTop: 16 }}>
            The Upkeep.
          </Head>
        </FadeIn>
        <FadeIn at={18}>
          <Body size={36} style={{ marginTop: 22 }}>
            Twice a round, after the inheritance and after the hearth, the escrow goes to the house wallet that keeps the vault running. Every transfer is on the public statement with its transaction.
          </Body>
        </FadeIn>
      </div>
      <div style={{ position: "absolute", right: 190, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Gauge fill={fill} target={0.025} size={360} />
        <div style={{ fontFamily: HF.display, fontSize: 60, color: H.gold, transform: `translateY(${go * 10}px)` }}>↓</div>
        <Panel style={{ width: 640, padding: "22px 28px", background: H.paper, color: H.ink, borderTopColor: H.deedBlue, opacity: go, transform: `translateY(${(1 - go) * 30}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 18, letterSpacing: "0.18em", color: H.deedBlue }}>UPKEEP</span>
            <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 26 }}>0.0250 ETH</span>
          </div>
          <div style={{ fontFamily: HF.serif, fontSize: 28, marginTop: 6 }}>Transferred to the house wallet</div>
          <div style={{ fontFamily: "monospace", fontSize: 20, color: H.ink2, marginTop: 8, textDecoration: "underline" }}>0x01c4a2… ↗</div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
}

function Hearth({ len }: { len: number }) {
  const f = useCurrentFrame();
  const fill = easeInOut(ramp(f, 10, 70));
  const bought = ease(ramp(f, 70, 120));
  const burn = ease(ramp(f, 130, 200));
  const flick = (k: number) => 0.85 + Math.sin(f * 0.9 + k) * 0.08 + Math.sin(f * 2.3 + k * 2) * 0.05;
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-pedestals.png" dark={0.74} origin="75% 40%" />
      <Turns active={2} />
      <div style={{ position: "absolute", left: 140, top: 230, width: 800 }}>
        <FadeIn at={0}>
          <Caps>Turn III · 0.01 ETH</Caps>
        </FadeIn>
        <FadeIn at={6}>
          <Head size={104} color="#e7a3ab" style={{ marginTop: 16 }}>
            The Hearth.
          </Head>
        </FadeIn>
        <FadeIn at={18}>
          <Body size={36} style={{ marginTop: 22 }}>
            The third escrow buys $HEIR on the market. Exactly what it bought is sent to the dead address and burned, for good. Fewer $HEIR for everyone left in the family.
          </Body>
        </FadeIn>
      </div>
      <div style={{ position: "absolute", right: 190, top: 240, width: 620, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Gauge fill={fill} target={0.01} size={300} />
        <div style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 54, color: H.gold2, opacity: bought, transform: `scale(${1 - burn * 0.6})`, filter: `blur(${burn * 6}px)` }}>
          {Math.round(bought * 520000).toLocaleString("en-US")} $HEIR
        </div>
        <div style={{ position: "relative", width: 300, height: 220, opacity: ramp(f, 110, 130) }}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{ position: "absolute", left: 150 - 60 + (k - 2) * 26, bottom: 40, width: 120, height: 170 * flick(k), borderRadius: "50% 50% 40% 40%", background: `radial-gradient(ellipse at 50% 80%, rgba(255,230,160,0.95), rgba(255,140,60,0.75) 45%, rgba(166,62,74,0) 75%)`, filter: "blur(6px)", mixBlendMode: "screen" }} />
          ))}
          <div style={{ position: "absolute", left: 40, right: 40, bottom: 0, height: 56, borderRadius: "0 0 120px 120px", background: "linear-gradient(180deg, #e8c16e, #8a6a2a)" }} />
        </div>
        <Caps size={20} color="#e7a3ab" style={{ opacity: burn }}>sent to 0x…dEaD · burned</Caps>
        <Body size={20} italic style={{ opacity: bought }}>Illustration: the amount bought depends on the price.</Body>
      </div>
    </AbsoluteFill>
  );
}

function Loop({ len }: { len: number }) {
  const f = useCurrentFrame();
  const spin = f * 0.6;
  let at = -90;
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-closing.png" dark={0.82} />
      <div style={{ position: "absolute", left: 160, top: 300, width: 780 }}>
        <FadeIn at={0}>
          <Head size={110}>Then the round begins again.</Head>
        </FadeIn>
        <FadeIn at={16}>
          <Body size={38} style={{ marginTop: 28 }}>
            Inheritance, upkeep, hearth, upkeep, and back to the inheritance. Day and night, for as long as people trade.
          </Body>
        </FadeIn>
      </div>
      <svg width={760} height={760} viewBox="-130 -130 260 260" style={{ position: "absolute", right: 140, top: 170 }}>
        <g transform={`rotate(${spin})`}>
          {STEPS.map((s) => {
            const sweep = ((s.eth * twice(s.k)) / TOTAL) * 360;
            const d = arc(100, at + 2, at + sweep - 2);
            const mid = at + sweep / 2;
            at += sweep;
            const r = ((mid - 90) * Math.PI) / 180;
            return (
              <g key={s.k}>
                <path d={d} fill="none" stroke={s.k === "feeding" ? H.feeding : s.k === "keeper" ? H.keeper : H.sink} strokeWidth={26} />
                <text x={Math.cos(r) * 100} y={Math.sin(r) * 100 + 5} textAnchor="middle" fontFamily={HF.data} fontWeight={700} fontSize={14} fill={H.v0} transform={`rotate(${-spin} ${Math.cos(r) * 100} ${Math.sin(r) * 100})`}>
                  {Math.round(((s.eth * twice(s.k)) / TOTAL) * 1000) / 10}%
                </text>
              </g>
            );
          })}
        </g>
        <foreignObject x={-70} y={-70} width={140} height={140}>
          <div style={{ width: 140, height: 140, display: "grid", placeItems: "center" }}>
            <Coin size={130} turn={f * 0.05} id="loop" glow={0.4} />
          </div>
        </foreignObject>
      </svg>
      <div style={{ position: "absolute", right: 170, bottom: 70, display: "flex", gap: 30 }}>
        {STEPS.map((s) => (
          <span key={s.k} style={{ fontFamily: HF.display, fontSize: 30, color: s.color }}>
            {s.name} <span style={{ fontFamily: HF.data, fontWeight: 600, fontSize: 24, color: H.gold2 }}>{s.eth}{twice(s.k) > 1 ? " ×2" : ""}</span>
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

const WILL = [
  ["100,000 $HEIR", "names you in the will"],
  ["No. 1–5 · 6–10", "share 70% · 30% of every inheritance"],
  ["1 hour", "a holding must age before it is paid"],
  ["One sale", "writes you out, for good"],
  ["Your own wallets", "transfers between them are not sales"],
];

function Will({ len }: { len: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const deed = ease(ramp(f, 0, 24));
  const stamp = spring({ frame: f - 150, fps, config: { damping: 9, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ opacity: out(f, len) }}>
      <Plate src="hl/plate-will.png" dark={0.9} origin="70% 50%" />
      <div style={{ position: "absolute", left: 150, top: 120, width: 880, background: H.paper, color: H.ink, borderRadius: 8, padding: "44px 54px", boxShadow: "0 40px 80px -30px rgba(0,0,0,0.9)", transform: `translateY(${(1 - deed) * 80}px)`, opacity: deed }}>
        <div style={{ position: "absolute", inset: 14, border: "1.5px solid rgba(36,66,122,0.45)", borderRadius: 4 }} />
        <Head size={78} color={H.ink}>The will</Head>
        {WILL.map(([k, v], i) => {
          const t = ease(ramp(f, 24 + i * 16, 40 + i * 16));
          const struck = i === 3 ? ramp(f, 150, 166) : 0;
          return (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: 20, padding: "18px 0", borderTop: "1px solid rgba(28,25,19,0.16)", opacity: t, transform: `translateX(${(1 - t) * -20}px)`, position: "relative" }}>
              <span style={{ fontFamily: HF.display, fontWeight: 600, fontSize: 38, color: i === 3 ? H.wax : H.deedBlue }}>{k}</span>
              <span style={{ fontFamily: HF.serif, fontSize: 32, color: H.ink2 }}>{v}</span>
              {i === 3 ? <div style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${struck * 100}%`, background: H.wax }} /> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 930, top: 400, opacity: stamp > 0.02 ? 1 : 0, transform: `scale(${2.2 - stamp * 1.2})` }}>
        <WaxSeal size={230} />
      </div>
      <div style={{ position: "absolute", right: 110, bottom: 150, width: 640 }}>
        <FadeIn at={150}>
          <Head size={70} italic color={H.gold2}>
            Sell once, and you are written out of the will.
          </Head>
        </FadeIn>
        <FadeIn at={170}>
          <Body size={30} style={{ marginTop: 18 }}>
            The next holder in line moves up into the inheritance zone.
          </Body>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

function End() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Plate src="hl/plate-closing.png" dark={0.7} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26 }}>
        <Coin size={300} turn={f * 0.07} id="end" />
        <FadeIn at={6}>
          <Head size={140} style={{ textAlign: "center" }}>
            An heirloom <span style={{ fontFamily: HF.displayItalic, color: H.gold2 }}>is never sold.</span>
          </Head>
        </FadeIn>
        <FadeIn at={20}>
          <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
            <span style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 40, letterSpacing: "0.16em", color: H.gold2 }}>$HEIR</span>
            <span style={{ fontFamily: HF.serif, fontSize: 40, color: H.text }}>heirlooms.fun</span>
            <span style={{ fontFamily: HF.serifItalic, fontSize: 32, color: H.text2 }}>Robinhood Chain · on Pons</span>
          </div>
        </FadeIn>
        <FadeIn at={34}>
          <Body size={22} italic style={{ textAlign: "center", marginTop: 20 }}>
            A memecoin with no promise of value. &ldquo;Inheritance&rdquo; is this site&rsquo;s name for trading fees passed to the ten largest holders.
          </Body>
        </FadeIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ───────────── the cut ───────────── */

const CUT: [number, (p: { len: number }) => React.ReactElement][] = [
  [150, Intro],
  [180, Escrow],
  [330, Inheritance],
  [210, Upkeep],
  [240, Hearth],
  [180, Loop],
  [270, Will],
  [180, End as (p: { len: number }) => React.ReactElement],
];
// Scenes overlap by XF frames and cross-dissolve, so there is never a dip to black between them.
const XF = 14;
export const HL_EXPLAINER_LENGTH = CUT.reduce((t, [n]) => t + n, 0) - XF * (CUT.length - 1);

/** Fades a scene in over its first XF frames (its own fade-out covers the end). */
function FadeScene({ children, first }: { children: React.ReactNode; first: boolean }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: first ? 1 : Math.min(1, f / XF) }}>{children}</AbsoluteFill>;
}

export function HLExplainer() {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: H.v0 }}>
      {CUT.map(([len, Scene], i) => {
        const from = at;
        at += len - XF;
        return (
          <Sequence key={i} from={from} durationInFrames={len} premountFor={30}>
            <FadeScene first={i === 0}>
              <Scene len={len} />
            </FadeScene>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export { clamp };

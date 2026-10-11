/**
 * Hawking news video for X: a press briefing parody. An astronaut at the podium says
 * "Hello everyone", green candles climb, then a news desk reads the top ten holders.
 * Holders and the emission come in as props, read from hawkings.fun at render time
 * (see render-hawking-news.sh). The candles are a drawn illustration and say so.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SITE, Tri, V, VF, clamp, ease, ramp } from "./HKTheme";
import { Mascot } from "./HKMascot";

export type NewsRow = { rank: number; addr: string; balance: number; received: number; name?: string };
export type NewsProps = {
  ca: string;
  rows: NewsRow[];
  emissionN: number;
  emissionETH: number;
  recipients: number;
  holders: number;
  out: number;
  treasuryETH: number;
  next: string;
  at: string;
};

export const HK_NEWS_DEFAULTS: NewsProps = {
  ca: "0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca",
  rows: Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, addr: `0x${(i + 10).toString(16)}a3…${(i * 7 + 11).toString(16)}f2`, balance: 32e6 - i * 2e6, received: i < 6 ? 0.009 - i * 0.001 : 0 })),
  emissionN: 1,
  emissionETH: 0.048,
  recipients: 10,
  holders: 32,
  out: 55,
  treasuryETH: 0,
  next: "Containment Fund 0.025 ETH",
  at: "",
};

export const HK_NEWS_LENGTH = 960;

const NAVY = "#0a1426";
const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);
const mil = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : `${Math.round(n / 1e3)}K`);

/* ───────────────────────── pieces ───────────────────────── */

/** The subtitle a press feed burns in: white on a black box, bottom centre. */
function Sub({ children, from, to }: { children: ReactNode; from: number; to: number }) {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const o = Math.min(ramp(f, from, from + 6), 1 - ramp(f, to - 6, to));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 168, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(0,0,0,0.82)", padding: "12px 26px", fontFamily: VF.serif, fontWeight: 600, fontSize: 44, color: "#fff", maxWidth: 1500, textAlign: "center" }}>{children}</div>
    </div>
  );
}

/** Broadcast lower third and the ticker crawl along the bottom. */
function Chyron({ title, sub, ticker, live = true }: { title: string; sub: string; ticker: string[]; live?: boolean }) {
  const f = useCurrentFrame();
  const x = -((f * 4) % 2400);
  const line = ticker.join("   ✕   ") + "   ✕   ";
  return (
    <>
      <div style={{ position: "absolute", left: 80, bottom: 84, display: "flex", alignItems: "stretch", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        {live ? <div style={{ background: V.red, color: "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.1em", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>● LIVE</div> : null}
        <div style={{ background: V.orange, color: "#121212", padding: "8px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 34, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.05 }}>{title}</div>
        </div>
        <div style={{ background: "#121212", color: V.paper, padding: "8px 22px", display: "flex", alignItems: "center", fontFamily: VF.mono, fontWeight: 700, fontSize: 22 }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: "#121212", borderTop: `4px solid ${V.orange}`, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div style={{ background: V.orange, color: "#121212", height: "100%", padding: "0 20px", display: "flex", alignItems: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.08em", zIndex: 2 }}>$HAWK NEWS</div>
        <div style={{ position: "absolute", left: 190 + x, whiteSpace: "nowrap", fontFamily: VF.mono, fontWeight: 700, fontSize: 24, color: V.paper }}>
          {line}
          {line}
          {line}
        </div>
      </div>
    </>
  );
}

/** Camera flashes from the press pit. */
function Flashes({ at }: { at: number[] }) {
  const f = useCurrentFrame();
  const o = Math.max(0, ...at.map((a) => (f >= a && f < a + 5 ? 1 - (f - a) / 5 : 0)));
  return o ? <AbsoluteFill style={{ background: "#fff", opacity: o * 0.55, pointerEvents: "none" }} /> : null;
}

/** The press room: curtain, a step-and-repeat of the mark, the podium, the astronaut. */
function Room({ talk, zoom = 1 }: { talk: number; zoom?: number }) {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * 4;
  const wall: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse at 50% 35%, #1d3460 0%, ${NAVY} 60%, #050a14 100%)`,
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}>
      <div style={wall} />
      {/* curtain folds */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 40px, rgba(0,0,0,0.12) 40px 80px)" }} />
      {/* step-and-repeat of the mark */}
      <div style={{ position: "absolute", left: 260, right: 260, top: 70, height: 560, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 30, opacity: 0.16 }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <Tri size={70} />
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", color: V.paper }}>HAWKING</div>
          </div>
        ))}
      </div>
      {/* flags either side */}
      {[300, 1620].map((x) => (
        <div key={x} style={{ position: "absolute", left: x - 70, top: 120, width: 140, height: 560 }}>
          <div style={{ position: "absolute", left: 66, top: 0, width: 8, height: 560, background: "#b9a46a" }} />
          <div style={{ position: "absolute", left: 0, top: 20, width: 140, height: 300, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 22px, #121212 22px 44px)`, transform: `skewY(${Math.sin(f / 20 + x) * 3}deg)`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }} />
        </div>
      ))}
      {/* the astronaut */}
      <div style={{ position: "absolute", left: 960 - 330, top: 120 + bob }}>
        <Mascot size={660} bare talk={talk} />
      </div>
      {/* microphones */}
      {[905, 1015].map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x, top: 640, width: 6, height: 120, background: "#2a2d33", transform: `rotate(${i ? 14 : -14}deg)`, transformOrigin: "50% 100%" }}>
          <div style={{ position: "absolute", left: -10, top: -26, width: 26, height: 40, borderRadius: 13, background: "#1a1c20", border: "2px solid #444" }} />
        </div>
      ))}
      {/* podium */}
      <div style={{ position: "absolute", left: 960 - 300, top: 740, width: 600, height: 400, background: "linear-gradient(180deg, #2a2117, #15110c)", clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)", boxShadow: "0 -10px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: "#3a2e20" }} />
        <div style={{ position: "absolute", left: 300 - 95, top: 40, width: 190, height: 190, borderRadius: "50%", background: "#121212", border: `6px solid ${V.orange}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <Tri size={96} />
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 16, letterSpacing: "0.18em", color: V.orange, marginTop: 4 }}>MISSION CONTROL</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** How open the beak is for a stretch of speech: a quick, uneven flap. */
function talkAt(f: number, spans: [number, number][]) {
  const on = spans.some(([a, b]) => f >= a && f <= b);
  if (!on) return 0;
  return Math.max(0, Math.sin(f * 1.3) * 0.6 + Math.sin(f * 0.55) * 0.4);
}

/* ───────────────────────── the chart ───────────────────────── */

const CANDLES = (() => {
  // a drawn climb: mostly green, two small red pauses, accelerating at the end
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = 100;
  for (let i = 0; i < 24; i++) {
    const red = i === 6 || i === 15;
    const step = red ? -4 - (i % 3) : 4 + i * 0.9 + ((i * 37) % 5);
    const o = p;
    const c = p + step;
    out.push({ o, c, h: Math.max(o, c) + 2 + (i % 4), l: Math.min(o, c) - 2 - (i % 3) });
    p = c;
  }
  return out;
})();

function Chart({ start }: { start: number }) {
  const f = useCurrentFrame() - start;
  const W = 1400;
  const H = 620;
  const lo = Math.min(...CANDLES.map((c) => c.l));
  const hi = Math.max(...CANDLES.map((c) => c.h));
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * (H - 40) - 20;
  const cw = W / CANDLES.length;
  const shown = Math.min(CANDLES.length, Math.floor(f / 4.5) + 1);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0.2, 0.4, 0.6, 0.8].map((g) => (
        <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(244,244,240,0.08)" strokeWidth={2} />
      ))}
      {CANDLES.slice(0, shown).map((c, i) => {
        const grow = ease(Math.min(1, (f - i * 4.5) / 6));
        const up = c.c >= c.o;
        const col = up ? "#16c784" : "#ea3943";
        const top = y(Math.max(c.o, c.c));
        const bot = y(Math.min(c.o, c.c));
        const x = i * cw + cw / 2;
        const bodyBot = bot;
        const bodyTop = bot - (bot - top) * grow;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={4} opacity={grow} />
            <rect x={x - cw * 0.32} y={up ? bodyTop : top} width={cw * 0.64} height={Math.max(4, up ? bodyBot - bodyTop : (bot - top) * grow)} fill={col} rx={3} />
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────────────────── the news desk ───────────────────────── */

function Desk({ rows, start, emissionN }: { rows: NewsRow[]; start: number; emissionN: number }) {
  const f = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 210 }}>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 300px 330px", padding: "0 26px 12px", fontFamily: VF.display, fontWeight: 800, fontSize: 24, letterSpacing: "0.14em", color: V.muted, textTransform: "uppercase" }}>
        <span>No.</span>
        <span>Wallet</span>
        <span style={{ textAlign: "right" }}>Holding</span>
        <span style={{ textAlign: "right" }}>From emission #{emissionN}</span>
      </div>
      {rows.slice(0, 10).map((r, i) => {
        const s = spring({ frame: f - 8 - i * 6, fps, config: { damping: 16, stiffness: 140 } });
        const red = r.rank <= 5;
        return (
          <div key={r.rank} style={{ display: "grid", gridTemplateColumns: "110px 1fr 300px 330px", alignItems: "center", height: 58, marginBottom: 6, padding: "0 26px", background: i === 0 ? V.orange : "rgba(18,18,18,0.92)", color: i === 0 ? "#121212" : V.paper, borderLeft: `8px solid ${red ? V.red : V.glow}`, transform: `translateX(${(1 - s) * -80}px)`, opacity: s }}>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 38 }}>{String(r.rank).padStart(2, "0")}</span>
            <span style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30 }}>{r.name || short(r.addr)}</span>
            <span style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, textAlign: "right" }}>{mil(r.balance)} $HAWK</span>
            <span style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, textAlign: "right", color: i === 0 ? "#121212" : r.received > 0 ? "#16c784" : V.muted }}>{r.received > 0 ? `+${r.received.toFixed(4)} ETH` : "next one"}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── the video ───────────────────────── */

export function HKNews({ ca, rows, emissionN, emissionETH, recipients, holders, out, treasuryETH, next, at }: NewsProps) {
  const f = useCurrentFrame();
  const speech: [number, number][] = [
    [34, 92],
    [118, 190],
    [208, 282],
    [776, 860],
  ];
  const talk = talkAt(f, speech);
  const eth = emissionETH.toFixed(3);
  const ticker = [`EMISSION #${emissionN} COMPLETE`, `${eth} ETH PAID TO ${recipients} WALLETS NEAREST THE CORE`, ...(treasuryETH > 0 ? [`CONTAINMENT FUND: ${treasuryETH.toFixed(3)} ETH TO THE TREASURY`] : []), `NEXT: ${next.toUpperCase()}`, "SELL ONCE AND YOU'RE SPAGHETTIFIED", "HOLD 100,000 $HAWK TO ENTER THE SITE", SITE.toUpperCase()];
  // scene windows
  const room1 = f < 300;
  const chart = f >= 300 && f < 480;
  const desk = f >= 480 && f < 760;
  const room2 = f >= 760 && f < 880;
  const end = f >= 880;
  const zoom = interpolate(f, [0, 300], [1, 1.12], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {room1 || room2 ? <Room talk={talk} zoom={room2 ? 1.18 : zoom} /> : null}
      {room1 ? (
        <>
          <Flashes at={[12, 40, 47, 130, 215, 238]} />
          <Chyron ticker={ticker} title="Mission Control briefing" sub="Hawking ($HAWK) · Robinhood Chain" />
          <Sub from={34} to={100}>"Hello everyone."</Sub>
          <Sub from={112} to={196}>"Today, the first emission went out."</Sub>
          <Sub from={204} to={292}>"{eth} ETH, paid to the {recipients} holders nearest the core."</Sub>
        </>
      ) : null}

      {chart ? (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #0f2a1e, #050806 70%)` }}>
          <div style={{ position: "absolute", left: 120, top: 70 }}>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.14em", color: "#16c784" }}>$HAWK · ON PONS</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 110, lineHeight: 1, color: V.paper, textTransform: "uppercase" }}>
              Green on the <span style={{ color: "#16c784" }}>board.</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 260, top: 290 }}>
            <Chart start={300} />
          </div>
          <div style={{ position: "absolute", right: 120, top: 98, fontFamily: VF.mono, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", color: V.muted, border: `2px solid ${V.muted}`, padding: "6px 12px" }}>ILLUSTRATION · NOT A PRICE FEED</div>
          {/* the astronaut in a corner box, still talking over the chart */}
          <div style={{ position: "absolute", right: 90, bottom: 110, width: 300, height: 220, overflow: "hidden", background: NAVY, border: `4px solid ${V.orange}` }}>
            <div style={{ position: "absolute", left: -10, top: -20 }}>
              <Mascot size={320} bare talk={talkAt(f, [[310, 460]])} />
            </div>
          </div>
          <Sub from={312} to={392}>"Every trade charges the radiation level."</Sub>
          <Sub from={398} to={476}>"Hold, and you sit closer to the core."</Sub>
          <Chyron ticker={ticker} title="Markets" sub={`${holders} on site · ${out} spaghettified`} />
        </AbsoluteFill>
      ) : null}

      {desk ? (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NAVY}, #050a14)` }}>
          <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)" }} />
          <div style={{ position: "absolute", left: 120, top: 64, display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ background: V.red, color: "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 40, letterSpacing: "0.1em", padding: "6px 18px", opacity: Math.floor(f / 15) % 2 ? 1 : 0.75 }}>BREAKING</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 92, lineHeight: 1, color: V.paper, textTransform: "uppercase" }}>
              The top ten <span style={{ color: V.orange }}>holders</span>
            </div>
          </div>
          <Desk rows={rows} start={480} emissionN={emissionN} />
          <Chyron ticker={ticker} title={`Emission #${emissionN} · ${eth} ETH`} sub={at ? `Live from ${SITE} · ${at}` : `Live from ${SITE}`} />
        </AbsoluteFill>
      ) : null}

      {room2 ? (
        <>
          <Flashes at={[770, 800, 806]} />
          <Chyron ticker={ticker} title="Mission Control briefing" sub="Hawking ($HAWK) · Robinhood Chain" />
          <Sub from={772} to={868}>"Sell once, and you're spaghettified. Thank you."</Sub>
        </>
      ) : null}

      {end ? (
        <AbsoluteFill style={{ background: V.void, alignItems: "center", justifyContent: "center", opacity: ramp(f, 880, 890) }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 22px, #121212 22px 44px)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 26, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 22px, #121212 22px 44px)` }} />
          <Mascot size={300} ring />
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.orange, marginTop: 20, letterSpacing: "0.04em" }}>{SITE.toUpperCase()}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, color: V.paper, marginTop: 20 }}>CA {ca.toLowerCase()}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

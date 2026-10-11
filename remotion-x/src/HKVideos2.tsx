/**
 * Two videos for X: the Connect X feature (steps, the booth, a board row turning from 0x into
 * @you), and a "good afternoon" briefing for a red market, with the engine's real totals as
 * props (read from hawkings.fun at render time by render-hawking-videos2.sh).
 */
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SITE, Tri, V, VF, clamp, ease, ramp } from "./HKTheme";
import { Mascot } from "./HKMascot";
import { Chart, Chyron, Flashes, NAVY, Room, Sub, talkAt } from "./HKNews";

const XMark = ({ size = 40, color = V.paper }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill={color} d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8L18.9 2Zm-1.1 18.1h1.7L6.3 3.8H4.5l13.3 16.3Z" />
  </svg>
);

const Tape = ({ top }: { top: boolean }) => <div style={{ position: "absolute", left: 0, right: 0, [top ? "top" : "bottom"]: 0, height: 22, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 22px, #121212 22px 44px)` }} />;

/* ───────────────────────── 1. Connect X ───────────────────────── */

export const HK_XVIDEO_LENGTH = 570;

export function HKXVideo() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 120 } });
  const out1 = 1 - ramp(f, 84, 96);
  const steps = [
    ["Connect the wallet that holds $HAWK", 110],
    ["Your dosimeter → “Set your name, astronaut or connect X”", 170],
    ["Tab Connect X → Sign & connect X → Authorize", 230],
  ] as const;
  // the booth slides in with the steps, the button pulses on step 3
  const booth = spring({ frame: f - 104, fps, config: { damping: 16, stiffness: 110 } });
  const press = f > 240 && f < 300 ? 1 + Math.sin((f - 240) / 4) * 0.03 : 1;
  const sceneB = f >= 96 && f < 320;
  const sceneC = f >= 320 && f < 480;
  const morph = ease(ramp(f, 370, 400));
  const end = f >= 480;
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <Tape top />
      {/* A: the title */}
      {f < 96 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out1 }}>
          <div style={{ transform: `scale(${pop})`, width: 220, height: 220, borderRadius: 48, background: "#000", border: `6px solid ${V.orange}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 80px rgba(255,209,0,0.35)" }}>
            <XMark size={130} />
          </div>
          <div style={{ marginTop: 40, fontFamily: VF.display, fontWeight: 900, fontSize: 34, letterSpacing: "0.2em", color: V.orange, opacity: ramp(f, 20, 34) }}>NEW ON {SITE.toUpperCase()}</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 150, lineHeight: 1, color: V.paper, textTransform: "uppercase", opacity: ramp(f, 26, 40), transform: `translateY(${(1 - ease(ramp(f, 26, 44))) * 30}px)` }}>
            Connect <span style={{ color: V.orange }}>X.</span>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* B: three steps and the booth */}
      {sceneB ? (
        <AbsoluteFill style={{ opacity: Math.min(ramp(f, 96, 106), 1 - ramp(f, 310, 320)) }}>
          <div style={{ position: "absolute", left: 110, top: 120, width: 820 }}>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.16em", color: V.orange }}>HOW IT WORKS</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 96, lineHeight: 1, color: V.paper, textTransform: "uppercase", marginTop: 8 }}>Three clicks.</div>
            <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 26 }}>
              {steps.map(([t, at], i) => {
                const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 140 } });
                const on = f >= at && (i === 2 || f < steps[i + 1][1]);
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 24, opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
                    <span style={{ width: 76, height: 76, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: on ? V.orange : "#121212", border: `4px solid ${V.orange}`, fontFamily: VF.display, fontWeight: 900, fontSize: 44, color: on ? "#121212" : V.orange }}>{i + 1}</span>
                    <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 36, color: on ? V.paper : V.muted }}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position: "absolute", right: 110, top: 250, width: 800, transform: `translateX(${(1 - booth) * 300}px) scale(${press})`, opacity: booth, transformOrigin: "30% 70%" }}>
            <div style={{ border: `5px solid ${V.orange}`, background: "#121212", boxShadow: "0 50px 90px rgba(0,0,0,0.7)" }}>
              <Img src={staticFile("hk/booth-x.png")} style={{ display: "block", width: 790 }} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* C: the board row turns into you */}
      {sceneC ? (
        <AbsoluteFill style={{ opacity: Math.min(ramp(f, 320, 330), 1 - ramp(f, 470, 480)), alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 88, lineHeight: 1, color: V.paper, textTransform: "uppercase", textAlign: "center" }}>
            Your handle, <span style={{ color: V.orange }}>next to your rank.</span>
          </div>
          <div style={{ marginTop: 70, width: 1300, display: "flex", flexDirection: "column", gap: 14 }}>
            {[0, 1, 2].map((i) => {
              const me = i === 1;
              const bg = me ? interpolate(morph, [0, 1], [0, 1], clamp) : 0;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 120px 1fr auto", alignItems: "center", height: 120, padding: "0 30px", background: me ? `rgba(255,209,0,${bg})` : "#1b1d20", borderLeft: `12px solid ${V.red}`, transform: me ? `scale(${1 + morph * 0.04})` : "none", boxShadow: me ? `0 30px 60px rgba(255,209,0,${0.3 * morph})` : "none" }}>
                  <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 56, color: me && morph > 0.5 ? "#121212" : V.muted }}>{String(i + 3).padStart(2, "0")}</span>
                  <span style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", background: "#2c2f33", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {me && morph > 0.5 ? <Mascot size={84} ring={false} /> : <span style={{ fontFamily: VF.mono, fontSize: 30, color: V.muted }}>?</span>}
                  </span>
                  <span style={{ position: "relative", height: 70 }}>
                    <span style={{ position: "absolute", left: 0, top: 10, fontFamily: VF.mono, fontWeight: 700, fontSize: 44, color: V.muted, opacity: me ? 1 - morph : 1 }}>{["0x5e6f…7a8b", "0x1a2b…3c4d", "0x9c0d…1e2f"][i]}</span>
                    {me ? (
                      <span style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 18, fontFamily: VF.display, fontWeight: 900, fontSize: 64, color: "#121212", opacity: morph, transform: `translateY(${(1 - morph) * 20}px)` }}>
                        <XMark size={52} color="#121212" /> @you
                      </span>
                    ) : null}
                  </span>
                  {me ? <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.12em", color: "#121212", opacity: morph }}>THAT'S YOU</span> : null}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* D: the end card */}
      {end ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: ramp(f, 480, 492) }}>
          <Mascot size={280} ring />
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.orange, marginTop: 24 }}>{SITE.toUpperCase()}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, color: V.paper, marginTop: 18 }}>READ-ONLY · WE NEVER POST OR SEE YOUR DMS · FREE TO SIGN</div>
        </AbsoluteFill>
      ) : null}
      <Tape top={false} />
    </AbsoluteFill>
  );
}

/* ───────────────────────── 2. Good afternoon, red market ───────────────────────── */

export type BearProps = { fedETH: number; burned: number; treasuryETH: number; rounds: number; out: number; onSite: number; at: string };
export const BEAR_DEFAULTS: BearProps = { fedETH: 0.0685, burned: 4119979, treasuryETH: 0.0856, rounds: 7, out: 118, onSite: 43, at: "" };
export const HK_BEAR_LENGTH = 960;
const mil = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : `${Math.round(n / 1e3)}K`);

export function HKBearNews({ fedETH, burned, treasuryETH, rounds, out, onSite, at }: BearProps) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const talk = talkAt(f, [
    [34, 92],
    [112, 186],
    [204, 282],
    [776, 860],
  ]);
  const ticker = ["MARKETS RED · THE ENGINE KEEPS RUNNING", "EVERY TRADE, UP OR DOWN, PAYS A FEE", `${fedETH.toFixed(4)} ETH PAID TO THE TEN NEAREST THE CORE SO FAR`, `${mil(burned)} $HAWK BURNED`, "SELL ONCE AND YOU'RE SPAGHETTIFIED", SITE.toUpperCase()];
  const room1 = f < 300;
  const chart = f >= 300 && f < 480;
  const desk = f >= 480 && f < 760;
  const room2 = f >= 760 && f < 880;
  const end = f >= 880;
  const zoom = interpolate(f, [0, 300], [1, 1.12], clamp);
  const stats: [string, string, string][] = [
    [`${fedETH.toFixed(4)} ETH`, "paid to the ten nearest the core", V.orange],
    [`${mil(burned)} $HAWK`, "bought back and burned", V.red],
    [`${treasuryETH.toFixed(4)} ETH`, "into the Containment Fund", V.paper],
    [String(rounds), "rounds run by the engine, on its own", V.paper],
  ];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {room1 || room2 ? <Room talk={talk} zoom={room2 ? 1.18 : zoom} /> : null}
      {room1 ? (
        <>
          <Flashes at={[14, 44, 140]} />
          <Chyron ticker={ticker} title="Afternoon briefing" sub="Hawking ($HAWK) · Robinhood Chain" />
          <Sub from={34} to={100}>"Good afternoon, everyone."</Sub>
          <Sub from={108} to={194}>"Yes, the market is red today."</Sub>
          <Sub from={200} to={292}>"The engine doesn't read charts. It reads trades."</Sub>
        </>
      ) : null}

      {chart ? (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #2a0f0f, #080505 70%)" }}>
          <div style={{ position: "absolute", left: 120, top: 70 }}>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.14em", color: "#ea3943" }}>MARKETS · RED DAY</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 104, lineHeight: 1, color: V.paper, textTransform: "uppercase" }}>
              Red candles. <span style={{ color: V.orange }}>Same rules.</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 260, top: 290 }}>
            <Chart start={300} bear />
          </div>
          <div style={{ position: "absolute", right: 120, top: 98, fontFamily: VF.mono, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", color: V.muted, border: `2px solid ${V.muted}`, padding: "6px 12px" }}>ILLUSTRATION · NOT A PRICE FEED</div>
          <div style={{ position: "absolute", right: 90, bottom: 110, width: 300, height: 220, overflow: "hidden", background: NAVY, border: `4px solid ${V.orange}` }}>
            <div style={{ position: "absolute", left: -10, top: -20 }}>
              <Mascot size={320} bare talk={talkAt(f, [[310, 460]])} />
            </div>
          </div>
          <Sub from={312} to={392}>"Every trade, up or down, still pays a fee into the escrow."</Sub>
          <Sub from={398} to={476}>"Rewards, treasury, buyback and burn keep running."</Sub>
          <Chyron ticker={ticker} title="Markets" sub={`${onSite} on site · ${out} spaghettified`} />
        </AbsoluteFill>
      ) : null}

      {desk ? (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NAVY}, #050a14)` }}>
          <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)" }} />
          <div style={{ position: "absolute", left: 120, top: 64, display: "flex", alignItems: "center", gap: 22 }}>
            <Tri size={70} />
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 88, lineHeight: 1, color: V.paper, textTransform: "uppercase" }}>
              What the engine <span style={{ color: V.orange }}>did anyway</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 120, right: 120, top: 220, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {stats.map(([v, l, c], i) => {
              const s = spring({ frame: f - 490 - i * 12, fps, config: { damping: 15, stiffness: 130 } });
              return (
                <div key={l} style={{ background: "rgba(18,18,18,0.92)", borderLeft: `10px solid ${c}`, padding: "30px 34px", opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
                  <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 92, lineHeight: 1, color: c }}>{v}</div>
                  <div style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 32, color: V.paper, marginTop: 8 }}>{l}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 120, right: 120, top: 760, fontFamily: VF.serif, fontWeight: 600, fontSize: 30, color: V.muted, opacity: ramp(f, 560, 580) }}>
            Paid out by the engine on chain, step by step. No promise on price, only on the rules.
          </div>
          <Chyron ticker={ticker} title="Engine report" sub={at ? `Live from ${SITE} · ${at}` : `Live from ${SITE}`} />
        </AbsoluteFill>
      ) : null}

      {room2 ? (
        <>
          <Flashes at={[770, 806]} />
          <Chyron ticker={ticker} title="Afternoon briefing" sub="Hawking ($HAWK) · Robinhood Chain" />
          <Sub from={772} to={868}>"Sellers get spaghettified. Holders stay near the core. Good afternoon."</Sub>
        </>
      ) : null}

      {end ? (
        <AbsoluteFill style={{ background: V.void, alignItems: "center", justifyContent: "center", opacity: ramp(f, 880, 890) }}>
          <Tape top />
          <Tape top={false} />
          <Mascot size={300} ring />
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.orange, marginTop: 20 }}>{SITE.toUpperCase()}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, color: V.paper, marginTop: 18 }}>RED DAY OR GREEN DAY, THE CYCLE RUNS</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

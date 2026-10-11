/**
 * Two red-day videos for X. A hook: the chart is red, the hawk takes a spoon to the red candles
 * ("scoop. scoop. scoop.") and drops them in a $HAWK bag. A gimmick: the same red candle, two
 * astronauts; one sells and is spaghettified, one scoops and stays on the board. Both drawn, no
 * price feed, no promise on price.
 */
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Hole, SITE, Tri, V, VF, clamp, ease, ramp } from "./HKTheme";
import { Mascot } from "./HKMascot";
import { Chart, talkAt } from "./HKNews";

const RED = "#ea3943";
const GREEN = "#16c784";

const Tape = ({ top }: { top: boolean }) => <div style={{ position: "absolute", left: 0, right: 0, [top ? "top" : "bottom"]: 0, height: 22, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 22px, #121212 22px 44px)` }} />;

const Fine = ({ children }: { children: string }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, textAlign: "center", fontFamily: VF.mono, fontWeight: 700, fontSize: 22, letterSpacing: "0.1em", color: V.muted }}>{children}</div>
);

const Candle = ({ h = 180, w = 64 }: { h?: number; w?: number }) => (
  <svg width={w} height={h + 60} viewBox={`0 0 ${w} ${h + 60}`} style={{ overflow: "visible" }}>
    <line x1={w / 2} x2={w / 2} y1={0} y2={h + 60} stroke={RED} strokeWidth={6} />
    <rect x={0} y={30} width={w} height={h} rx={6} fill={RED} />
  </svg>
);

const Spoon = ({ size = 300, angle = 0 }: { size?: number; angle?: number }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 100" style={{ transform: `rotate(${angle}deg)`, overflow: "visible" }}>
    <rect x={92} y={42} width={108} height={16} rx={8} fill="#c9ccd1" stroke="#121212" strokeWidth={4} />
    <ellipse cx={52} cy={50} rx={50} ry={34} fill="#e4e6ea" stroke="#121212" strokeWidth={5} />
    <ellipse cx={46} cy={44} rx={30} ry={16} fill="#ffffff" opacity={0.55} />
  </svg>
);

/* ───────────────────────── 1. hook: scoop scoop scoop ───────────────────────── */

export const HK_SCOOP_LENGTH = 480;

export function HKScoop() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = f < 100;
  const scoop = f >= 100 && f < 330;
  const rules = f >= 330 && f < 410;
  const end = f >= 410;

  // three scoops: candle k is lifted at S[k], arcs over and lands in the bag 40 frames later
  const S = [120, 185, 250];
  const CX = [1420, 1560, 1700];
  const CY = 470;
  const BX = 1010;
  const BY = 560;
  const cur = S.findIndex((s) => f < s + 40);
  const k = cur === -1 ? 2 : cur;
  const t = ease(ramp(f, S[k], S[k] + 40));
  const sx = interpolate(t, [0, 1], [CX[k] - 120, BX]);
  const sy = interpolate(t, [0, 1], [CY - 40, BY - 60]) - Math.sin(Math.PI * t) * 260;
  const tilt = f >= S[k] + 34 ? -40 * ramp(f, S[k] + 34, S[k] + 40) : 0;
  const landed = S.filter((s) => f >= s + 40).length;
  const fill = S.reduce((a, s) => a + ease(ramp(f, s + 40, s + 52)), 0) / 3;

  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <Tape top />

      {/* A: the red chart */}
      {intro ? (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #2a0f0f, #080505 70%)", opacity: 1 - ramp(f, 90, 100) }}>
          <div style={{ position: "absolute", left: 260, top: 430, opacity: 0.7 }}>
            <Chart start={0} bear />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center" }}>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 34, letterSpacing: "0.2em", color: RED, opacity: ramp(f, 4, 14) }}>MISSION CONTROL · MARKET CHECK</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 170, lineHeight: 1, color: V.paper, textTransform: "uppercase", opacity: ramp(f, 10, 22), transform: `scale(${0.9 + 0.1 * ease(ramp(f, 10, 26))})` }}>
              The chart is <span style={{ color: RED }}>red.</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 80, color: V.orange, textTransform: "uppercase", opacity: ramp(f, 52, 62), transform: `translateY(${(1 - ease(ramp(f, 52, 66))) * 30}px)` }}>
            Mission Control's plan:
          </div>
          <div style={{ position: "absolute", right: 120, top: 40, fontFamily: VF.mono, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", color: V.muted, border: `2px solid ${V.muted}`, padding: "6px 12px" }}>ILLUSTRATION · NOT A PRICE FEED</div>
        </AbsoluteFill>
      ) : null}

      {/* B: the scoops */}
      {scoop ? (
        <AbsoluteFill style={{ opacity: Math.min(ramp(f, 100, 110), 1 - ramp(f, 320, 330)) }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 60%, #24140a, #0b0b0c 70%)" }} />
          {/* the words */}
          <div style={{ position: "absolute", left: 640, top: 70, display: "flex", gap: 34 }}>
            {S.map((s, i) => {
              const p = spring({ frame: f - s - 34, fps, config: { damping: 9, stiffness: 160 } });
              return (
                <span key={i} style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 140, lineHeight: 1, color: i === 2 ? V.orange : V.paper, textTransform: "uppercase", opacity: Math.min(1, p * 1.4), transform: `scale(${p}) rotate(${(i - 1) * 4}deg)`, display: "inline-block" }}>
                  Scoop.
                </span>
              );
            })}
          </div>
          {/* the hawk */}
          <div style={{ position: "absolute", left: 40, top: 300, transform: `translateY(${Math.sin(f / 8) * 6}px)` }}>
            <Mascot size={600} bare talk={talkAt(f, S.map((s) => [s + 34, s + 52] as [number, number]))} />
          </div>
          {/* the red candles waiting on the right */}
          {CX.map((x, i) => {
            const lifted = f >= S[i];
            if (lifted) return null;
            return (
              <div key={i} style={{ position: "absolute", left: x - 32, top: CY - 30 + i * 30 }}>
                <Candle h={200 - i * 30} />
              </div>
            );
          })}
          {/* the bag */}
          <div style={{ position: "absolute", left: BX - 170, top: BY + 40, width: 340, height: 330 }}>
            <div style={{ position: "absolute", inset: 0, background: "#3b2f1d", border: "6px solid #121212", borderRadius: "30px 30px 60px 60px", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${fill * 82}%`, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 18px, ${V.orangeDeep} 18px 36px)` }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 64, color: "#121212", zIndex: 2 }}>
              <span style={{ background: V.paper, padding: "0 14px", border: "4px solid #121212" }}>$HAWK</span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: -64, textAlign: "center", fontFamily: VF.mono, fontWeight: 700, fontSize: 30, color: V.orange }}>{landed} / 3 scooped</div>
          </div>
          {/* the spoon, carrying the current candle */}
          {f < S[2] + 46 ? (
            <div style={{ position: "absolute", left: sx - 60, top: sy }}>
              {f >= S[k] && f < S[k] + 38 ? (
                <div style={{ position: "absolute", left: 18, top: -150, transform: `scale(0.6) rotate(${tilt * 0.6}deg)`, transformOrigin: "50% 100%" }}>
                  <Candle h={200 - k * 30} />
                </div>
              ) : null}
              <Spoon size={300} angle={tilt} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* C: the rules */}
      {rules ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(ramp(f, 330, 340), 1 - ramp(f, 400, 410)) }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 96, lineHeight: 1, color: V.paper, textTransform: "uppercase", textAlign: "center" }}>
            Scooped? <span style={{ color: V.orange }}>Now hold.</span>
          </div>
          <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 18, width: 1300 }}>
            {(
              [
                ["100,000+ $HAWK", "you're on the exposure board", V.orange],
                ["Top 10 nearest the core", "share every 0.02 ETH reward", V.paper],
                ["Sell once", "spaghettified, for good", V.red],
              ] as const
            ).map(([a, b, c], i) => {
              const s = spring({ frame: f - 340 - i * 10, fps, config: { damping: 15, stiffness: 140 } });
              return (
                <div key={a} style={{ display: "flex", alignItems: "baseline", gap: 28, background: "#121212", borderLeft: `12px solid ${c}`, padding: "20px 30px", opacity: s, transform: `translateX(${(1 - s) * -80}px)` }}>
                  <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 58, color: c, minWidth: 560 }}>{a}</span>
                  <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 38, color: V.paper }}>{b}</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* D: end card */}
      {end ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: ramp(f, 410, 420) }}>
          <Mascot size={260} ring />
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 70, letterSpacing: "0.04em", color: V.paper, textTransform: "uppercase", marginTop: 18 }}>
            Red day = <span style={{ color: V.orange }}>scoop day</span>
          </div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.orange, marginTop: 6 }}>{SITE.toUpperCase()}</div>
          <Fine>MEMECOIN · NO PROMISE ON PRICE · NOT FINANCIAL ADVICE</Fine>
        </AbsoluteFill>
      ) : null}
      <Tape top={false} />
    </AbsoluteFill>
  );
}

/* ───────────────────────── 2. gimmick: same candle, two astronauts ───────────────────────── */

export const HK_TWO_LENGTH = 510;

function Button({ label, color, press }: { label: string; color: string; press: number }) {
  return (
    <div style={{ display: "inline-block", background: color, color: color === V.orange ? "#121212" : "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 54, letterSpacing: "0.08em", padding: "10px 46px", border: "5px solid #121212", boxShadow: `0 ${10 - press * 8}px 0 #121212`, transform: `translateY(${press * 8}px)` }}>{label}</div>
  );
}

export function HKTwoHands() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = f < 100;
  const split = f >= 100 && f < 380;
  const ask = f >= 380 && f < 450;
  const end = f >= 450;

  // left: presses SELL at 170, then is pulled into the hole and stretched
  const pressL = f >= 168 && f < 178 ? 1 : 0;
  const spag = Math.pow(ramp(f, 186, 270), 2.2);
  // right: presses BUY at 200, the scoop lands, the rank card climbs into the ten
  const pressR = f >= 198 && f < 208 ? 1 : 0;
  const climb = ease(ramp(f, 230, 290));
  const rank = Math.round(interpolate(climb, [0, 1], [14, 8]));
  const inTen = rank <= 10;
  const badge = spring({ frame: f - 292, fps, config: { damping: 10, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <Tape top />

      {/* A: one red candle */}
      {intro ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 50%, #2a0f0f, #080505 70%)", opacity: 1 - ramp(f, 90, 100) }}>
          <div style={{ transform: `scaleY(${ease(ramp(f, 0, 24))})`, transformOrigin: "50% 0%" }}>
            <Candle h={320} w={110} />
          </div>
          <div style={{ marginTop: 40, fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.paper, textTransform: "uppercase", opacity: ramp(f, 24, 36) }}>
            Same red candle.
          </div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.orange, textTransform: "uppercase", opacity: ramp(f, 48, 60) }}>
            Two astronauts.
          </div>
        </AbsoluteFill>
      ) : null}

      {/* B: the split */}
      {split ? (
        <AbsoluteFill style={{ opacity: Math.min(ramp(f, 100, 110), 1 - ramp(f, 370, 380)) }}>
          {/* left half */}
          <div style={{ position: "absolute", left: 0, top: 22, width: 958, bottom: 22, background: "radial-gradient(ellipse at 50% 70%, #2a0d0d, #0b0b0c 70%)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 72, color: RED, letterSpacing: "0.06em" }}>PAPER HANDS</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: VF.serif, fontWeight: 600, fontSize: 34, color: V.muted }}>"It's red, I'm out."</div>
            <div style={{ position: "absolute", left: 479 - 170, top: 640, opacity: ramp(f, 186, 200) }}>
              <Hole size={340} spin={f / 30} />
            </div>
            {/* clipped at the hole's centre: the hawk stretches and slides down into it */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 790, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 479 - 200, top: 230, width: 400, height: 400, transformOrigin: "50% 0%", transform: `translateY(${spag * 640}px) scale(${1 - spag * 0.75}, ${1 + spag * 1.6})` }}>
                <Mascot size={400} bare talk={talkAt(f, [[120, 160]])} />
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", opacity: 1 - ramp(f, 176, 186) }}>
              <Button label="SELL" color={V.red} press={pressL} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 64, color: V.paper, textTransform: "uppercase", opacity: ramp(f, 276, 290) }}>
              Spaghettified. <span style={{ color: RED }}>Forever.</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 958, top: 22, width: 4, bottom: 22, background: V.orange }} />
          {/* right half */}
          <div style={{ position: "absolute", left: 962, top: 22, right: 0, bottom: 22, background: "radial-gradient(ellipse at 50% 70%, #24200a, #0b0b0c 70%)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 72, color: V.orange, letterSpacing: "0.06em" }}>SCOOPER</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: VF.serif, fontWeight: 600, fontSize: 34, color: V.muted }}>"It's red. Scoop."</div>
            <div style={{ position: "absolute", left: 40, top: 230, transform: `translateY(${Math.sin(f / 8) * 5}px)` }}>
              <Mascot size={400} bare talk={talkAt(f, [[130, 170], [300, 340]])} />
            </div>
            {/* the spoon arrives after BUY */}
            <div style={{ position: "absolute", left: 300, top: interpolate(ease(ramp(f, 206, 226)), [0, 1], [-200, 330]), opacity: ramp(f, 206, 210) * (1 - ramp(f, 236, 246)) }}>
              <Spoon size={240} angle={-20} />
            </div>
            {/* the rank card */}
            <div style={{ position: "absolute", right: 60, top: 280, width: 400, background: inTen ? V.orange : "#121212", border: `5px solid ${V.orange}`, padding: "20px 26px", color: inTen ? "#121212" : V.paper }}>
              <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.14em" }}>EXPOSURE BOARD</div>
              <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 150, lineHeight: 1 }}>#{String(rank).padStart(2, "0")}</div>
              <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 24 }}>{inTen ? "IN THE TEN · NEXT REWARD" : "OUTSIDE THE TEN"}</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", opacity: 1 - ramp(f, 214, 224) }}>
              <Button label="BUY" color={GREEN} press={pressR} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: VF.display, fontWeight: 900, fontSize: 58, color: V.paper, textTransform: "uppercase", opacity: Math.min(1, badge * 1.3), transform: `scale(${0.8 + 0.2 * badge})` }}>
              Closer to <span style={{ color: V.orange }}>the core.</span>
            </div>
            <div style={{ position: "absolute", right: 40, bottom: 20, fontFamily: VF.mono, fontWeight: 700, fontSize: 16, letterSpacing: "0.1em", color: V.muted }}>ILLUSTRATION · RANK BY BALANCE</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* C: the question */}
      {ask ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(ramp(f, 380, 390), 1 - ramp(f, 440, 450)) }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 140, lineHeight: 1, color: V.paper, textTransform: "uppercase", textAlign: "center" }}>
            Which astronaut
            <br />
            <span style={{ color: V.orange }}>are you?</span>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* D: end card */}
      {end ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: ramp(f, 450, 460) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Tri size={90} />
            <Mascot size={240} ring />
          </div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1, color: V.orange, marginTop: 20 }}>{SITE.toUpperCase()}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, color: V.paper, marginTop: 18 }}>HOLD 100,000+ · TOP 10 SHARE EVERY REWARD · SELL ONCE, OUT FOR GOOD</div>
          <Fine>MEMECOIN · NO PROMISE ON PRICE · NOT FINANCIAL ADVICE</Fine>
        </AbsoluteFill>
      ) : null}
      <Tape top={false} />
    </AbsoluteFill>
  );
}

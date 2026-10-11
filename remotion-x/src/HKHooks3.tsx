/**
 * Three more posts for X: a news card on the latest reward (props, read from hawkings.fun at
 * render time by render-hawking-hooks2.sh), and two gimmicks: a boarding pass to the core and
 * the weather report from the core.
 */
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Body, Caps, Head, Mono, SITE, Tri, V, VF } from "./HKTheme";
import { Mascot } from "./HKMascot";
import { Render } from "./HKStills";

export type RewardProps = {
  n: number; // which reward this is (1st, 2nd, …)
  paidETH: number;
  wallets: number;
  totalETH: number;
  rounds: number;
  burned: number;
  topAddr: string;
  topETH: number;
  onSite: number;
  next: string;
  escrow: number;
  nextETH: string;
  at: string;
};

export const REWARD_DEFAULTS: RewardProps = { n: 2, paidETH: 0.0205, wallets: 10, totalETH: 0.0685, rounds: 5, burned: 2167347, topAddr: "0xec9c25bd1db76bd8ddcaaebb101ea8e6b1b532ab", topETH: 0.0128, onSite: 43, next: "Treasury", escrow: 0.0087, nextETH: "0.025", at: "" };

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const mil = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : `${Math.round(n / 1e3)}K`);
const nth = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

/* ───────── 1. news: the latest reward ───────── */

export function HKRewardNews({ n, paidETH, wallets, totalETH, rounds, burned, topAddr, topETH, onSite, next, escrow, nextETH, at }: RewardProps) {
  const stats: [string, string, string][] = [
    [`${totalETH.toFixed(4)} ETH`, `paid to holders over ${n} rewards`, V.orange],
    [String(rounds), "rounds run by the engine, no hands", V.paper],
    [`${mil(burned)}`, "$HAWK bought back and burned", V.red],
  ];
  return (
    <AbsoluteFill style={{ background: "#0a1426", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, background: "#121212", borderBottom: `5px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 80px", gap: 20 }}>
        <Tri size={54} />
        <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 40, letterSpacing: "0.1em", color: V.orange }}>MISSION CONTROL BULLETIN</span>
        <span style={{ marginLeft: "auto", background: V.red, color: "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 28, letterSpacing: "0.12em", padding: "6px 16px" }}>● LIVE</span>
      </div>
      <div style={{ position: "absolute", left: 80, top: 136, width: 1000 }}>
        <Caps size={24}>Just in</Caps>
        <Head size={118} style={{ marginTop: 6 }}>
          The {nth(n)} reward <span style={{ color: V.orange }}>landed.</span>
        </Head>
        <Body size={32} color={V.paper} style={{ marginTop: 12 }}>
          <b style={{ color: V.orange }}>{paidETH.toFixed(4)} ETH</b> straight to the {wallets} wallets nearest the core.
        </Body>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12 }}>
          {stats.map(([v, l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 22, background: "rgba(18,18,18,0.9)", borderLeft: `8px solid ${c}`, padding: "12px 24px" }}>
              <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 52, color: c, minWidth: 300 }}>{v}</span>
              <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 29, color: V.paper }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 150, width: 380, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ background: V.orange, color: "#121212", padding: "18px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 22, letterSpacing: "0.14em" }}>TOP EARNER SO FAR</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 30, marginTop: 6 }}>{short(topAddr)}</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 56, lineHeight: 1 }}>+{topETH.toFixed(4)}</div>
          <div style={{ fontFamily: VF.display, fontWeight: 800, fontSize: 20, letterSpacing: "0.1em" }}>ETH · NEVER SOLD</div>
        </div>
        <div style={{ background: "#121212", border: `3px solid ${V.orange}`, padding: "16px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 80, lineHeight: 0.95, color: V.orange }}>{onSite}</div>
          <div style={{ fontFamily: VF.display, fontWeight: 800, fontSize: 22, letterSpacing: "0.14em", color: V.muted }}>HOLDERS ON SITE</div>
        </div>
        <div style={{ background: "#121212", border: `3px solid ${V.paper}`, padding: "14px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 20, letterSpacing: "0.14em", color: V.muted }}>RUNNING NOW</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 36, color: V.paper, textTransform: "uppercase" }}>{next}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 20, color: V.paper }}>
            {escrow.toFixed(4)} / {nextETH} ETH
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#121212", borderTop: `4px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 80px", justifyContent: "space-between" }}>
        <Mono size={24} color={V.orange}>{SITE} · $HAWK · ON PONS</Mono>
        {at ? <Mono size={20} color={V.muted}>LIVE READING · {at}</Mono> : null}
      </div>
    </AbsoluteFill>
  );
}

/* ───────── 2. gimmick: a boarding pass to the core ───────── */

export function HKBoardingPass() {
  const cells: [string, string][] = [
    ["Passenger", "You"],
    ["From", "Your wallet"],
    ["To", "The core"],
    ["Seat", "No. 1-10"],
    ["Baggage", "100,000 $HAWK min."],
    ["Return ticket", "None"],
  ];
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <Render w={1600} h={900} scale={0.85} />
      </div>
      <AbsoluteFill style={{ background: "rgba(11,11,12,0.55)" }} />
      {/* the pass */}
      <div style={{ position: "absolute", left: 110, top: 150, width: 1380, height: 560, display: "flex", transform: "rotate(-2deg)", boxShadow: "0 50px 90px rgba(0,0,0,0.7)" }}>
        <div style={{ flex: 1, background: V.paper, color: "#121212", position: "relative" }}>
          <div style={{ height: 96, background: "#121212", display: "flex", alignItems: "center", gap: 18, padding: "0 36px" }}>
            <Tri size={58} />
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 44, letterSpacing: "0.1em", color: V.orange }}>HAWKING AIR</span>
            <span style={{ marginLeft: "auto", fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.18em", color: V.paper }}>BOARDING PASS</span>
          </div>
          <div style={{ padding: "26px 36px 0", display: "flex", alignItems: "baseline", gap: 26 }}>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1 }}>WLT</span>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 70, color: V.orangeDeep }}>✈ →</span>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 1 }}>CORE</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 30px", padding: "22px 36px" }}>
            {cells.map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 17, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5c5f64" }}>{k}</div>
                <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 40, textTransform: "uppercase", color: k === "Return ticket" ? V.red : "#121212" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 36, bottom: 24, fontFamily: VF.serif, fontWeight: 600, fontSize: 24, color: "#3c3f44" }}>In-flight service: ETH, every reward. Leaving early (selling) means spaghettification.</div>
        </div>
        {/* the stub */}
        <div style={{ width: 330, background: V.orange, color: "#121212", borderLeft: "6px dashed #121212", padding: "28px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.14em" }}>GATE</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 64, lineHeight: 1 }}>PONS</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.14em", marginTop: 18 }}>CLASS</div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 44, lineHeight: 1 }}>DIAMOND HANDS</div>
          </div>
          {/* a barcode */}
          <div style={{ display: "flex", gap: 3, height: 90, alignItems: "stretch" }}>
            {Array.from({ length: 34 }, (_, i) => (
              <div key={i} style={{ width: [3, 6, 2, 4, 8][(i * 7) % 5], background: "#121212" }} />
            ))}
          </div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 20 }}>{SITE}</div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 60, bottom: 14 }}>
        <Mascot size={200} ring />
      </div>
      <Caps size={22} color={V.orange} style={{ position: "absolute", left: 110, top: 64 }}>Now boarding · all zones</Caps>
    </AbsoluteFill>
  );
}

/* ───────── 3. gimmick: the weather report from the core ───────── */

export function HKForecast() {
  const days: [string, string, string, string][] = [
    ["Top 10", "☀️", "Sunny", "ETH every reward, to the ten nearest the core"],
    ["Sellers", "🌀", "Severe", "spaghettification, no recovery"],
    ["Supply", "🔥", "Falling", "buybacks burn what they buy"],
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0f2347, #0a1426 70%)", overflow: "hidden" }}>
      {/* the presenter */}
      <div style={{ position: "absolute", left: 40, bottom: -40 }}>
        <Mascot size={560} bare />
      </div>
      <div style={{ position: "absolute", left: 90, top: 70 }}>
        <div style={{ display: "inline-block", background: V.red, color: "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.14em", padding: "6px 14px" }}>WEATHER</div>
        <Head size={104} style={{ marginTop: 12 }}>
          Forecast from <span style={{ color: V.orange }}>the core.</span>
        </Head>
      </div>
      {/* the board */}
      <div style={{ position: "absolute", right: 80, top: 270, width: 900, display: "flex", flexDirection: "column", gap: 16 }}>
        {days.map(([who, icon, big, small], i) => (
          <div key={who} style={{ display: "grid", gridTemplateColumns: "180px 110px 1fr", alignItems: "center", background: "rgba(18,18,18,0.92)", borderLeft: `10px solid ${[V.orange, V.red, V.glow][i]}`, padding: "18px 26px" }}>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 38, textTransform: "uppercase", color: V.paper }}>{who}</span>
            <span style={{ fontSize: 64, lineHeight: 1 }}>{icon}</span>
            <span>
              <span style={{ display: "block", fontFamily: VF.display, fontWeight: 900, fontSize: 54, lineHeight: 1, color: [V.orange, V.red, V.glow][i], textTransform: "uppercase" }}>{big}</span>
              <span style={{ display: "block", fontFamily: VF.serif, fontWeight: 600, fontSize: 27, color: V.paper, marginTop: 4 }}>{small}</span>
            </span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#121212", borderTop: `4px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 80px", justifyContent: "flex-end" }}>
        <Mono size={24} color={V.orange}>{SITE} · $HAWK · ON PONS</Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── 4. feature: the cycle, live on the site ───────── */

/** The real cycle section from hawkings.fun (public/hk/cycle-live.png, a 1920x1080 capture). */
export function HKCycleFeature() {
  // crop of the capture: the three placards and the loop line
  const cx = 372;
  const cy = 412;
  const cw = 1190;
  const ch = 448;
  const k = 1240 / cw;
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 18, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 18px, #121212 18px 36px)` }} />
      <div style={{ position: "absolute", left: 90, top: 56, right: 90, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "inline-block", background: V.orange, color: "#121212", fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.14em", padding: "6px 14px" }}>NEW ON {SITE.toUpperCase()}</div>
          <Head size={104} style={{ marginTop: 12 }}>
            Watch the cycle <span style={{ color: V.orange }}>live.</span>
          </Head>
        </div>
        <Body size={28} color={V.paper} style={{ width: 420, textAlign: "right", marginBottom: 8 }}>
          Only the step running now lights up, its meter filling toward the next payout.
        </Body>
      </div>
      {/* the site, in a browser frame */}
      <div style={{ position: "absolute", left: 180, top: 300, width: 1240, background: "#121212", border: `3px solid ${V.orange}`, boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
        <div style={{ height: 40, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: "2px solid #2c2f33" }}>
          {[V.red, V.orange, V.green].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ marginLeft: 16, fontFamily: VF.mono, fontWeight: 700, fontSize: 18, color: V.muted }}>{SITE}/#round</span>
        </div>
        <div style={{ position: "relative", width: 1240, height: ch * k, overflow: "hidden" }}>
          <Img src={staticFile("hk/cycle-live.png")} style={{ position: "absolute", width: 1920 * k, left: -cx * k, top: -cy * k }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#121212", borderTop: `4px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 90px", justifyContent: "space-between" }}>
        <Mono size={22} color={V.paper}>REWARD → TREASURY → BUYBACK & BURN → TREASURY → AGAIN</Mono>
        <Mono size={24} color={V.orange}>{SITE}</Mono>
      </div>
    </AbsoluteFill>
  );
}

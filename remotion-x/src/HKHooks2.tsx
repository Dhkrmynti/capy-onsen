/**
 * Three posts for X: a Mission Control bulletin with the live numbers (props, read from
 * hawkings.fun at render time by render-hawking-hooks.sh), and two gimmicks: a job ad for
 * astronauts and the hawk at the podium reacting to a seller.
 */
import { AbsoluteFill } from "remotion";
import { Body, Caps, Head, Mono, SITE, Tape, Tri, V, VF } from "./HKTheme";
import { Mascot } from "./HKMascot";
import { Render } from "./HKStills";

export type BulletinProps = {
  ca: string;
  cycles: number; // full cycles finished
  fedETH: number;
  treasuryETH: number;
  burned: number; // $HAWK
  onSite: number;
  out: number;
  next: string;
  nextETH: string;
  escrow: number;
  at: string;
};

export const BULLETIN_DEFAULTS: BulletinProps = { ca: "0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca", cycles: 1, fedETH: 0.048, treasuryETH: 0.057, burned: 2167347, onSite: 38, out: 92, next: "The Emission", nextETH: "0.02", escrow: 0, at: "" };

const mil = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : `${Math.round(n / 1e3)}K`);

/* ───────── 1. news: the bulletin, live numbers ───────── */

export function HKBulletin({ cycles, fedETH, treasuryETH, burned, onSite, out, next, nextETH, escrow, at }: BulletinProps) {
  const stats: [string, string, string][] = [
    [`${fedETH.toFixed(3)} ETH`, "paid to the ten nearest the core", V.orange],
    [`${treasuryETH.toFixed(3)} ETH`, "into the Containment Fund", V.paper],
    [`${mil(burned)} $HAWK`, "bought back and burned", V.red],
  ];
  return (
    <AbsoluteFill style={{ background: "#0a1426", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)" }} />
      {/* masthead */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, background: "#121212", borderBottom: `5px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 80px", gap: 20 }}>
        <Tri size={54} />
        <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 40, letterSpacing: "0.1em", color: V.orange }}>MISSION CONTROL BULLETIN</span>
        <span style={{ marginLeft: "auto", background: V.red, color: "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 28, letterSpacing: "0.12em", padding: "6px 16px" }}>● LIVE</span>
      </div>
      <div style={{ position: "absolute", left: 80, top: 140, width: 1000 }}>
        <Caps size={24}>Breaking</Caps>
        <Head size={120} style={{ marginTop: 8 }}>
          Cycle {cycles} is <span style={{ color: V.orange }}>complete.</span>
        </Head>
        <Body size={30} color={V.paper} style={{ marginTop: 14, maxWidth: 940 }}>
          All four steps ran on their own, on chain: emission, Containment Fund, buyback & burn, Containment Fund.
        </Body>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 14 }}>
          {stats.map(([n, l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 22, background: "rgba(18,18,18,0.9)", borderLeft: `8px solid ${c}`, padding: "14px 24px" }}>
              <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 56, color: c, minWidth: 330 }}>{n}</span>
              <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 30, color: V.paper }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* right column: the site right now */}
      <div style={{ position: "absolute", right: 80, top: 150, width: 380, display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          [String(onSite), "on site", V.orange],
          [String(out), "spaghettified", V.red],
        ].map(([n, l, c]) => (
          <div key={l} style={{ background: "#121212", border: `3px solid ${c}`, padding: "18px 24px" }}>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 96, lineHeight: 0.95, color: c }}>{n}</div>
            <div style={{ fontFamily: VF.display, fontWeight: 800, fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase", color: V.muted }}>{l}</div>
          </div>
        ))}
        <div style={{ background: V.orange, color: "#121212", padding: "16px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 22, letterSpacing: "0.14em" }}>NEXT UP</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 40, lineHeight: 1.05, textTransform: "uppercase" }}>{next}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 22, marginTop: 4 }}>
            {escrow.toFixed(4)} / {nextETH} ETH
          </div>
        </div>
      </div>
      {/* ticker */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#121212", borderTop: `4px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 80px", justifyContent: "space-between" }}>
        <Mono size={24} color={V.orange}>{SITE} · $HAWK · ON PONS</Mono>
        {at ? <Mono size={20} color={V.muted}>LIVE READING · {at}</Mono> : null}
      </div>
    </AbsoluteFill>
  );
}

/* ───────── 2. gimmick: a job ad for astronauts ───────── */

export function HKJobAd() {
  const rows: [string, string][] = [
    ["Requirements", "Hold 100,000 $HAWK. That's it."],
    ["Pay", "ETH, every emission. Ranked by balance."],
    ["Location", "Within ten rings of a black hole."],
    ["Hours", "24/7. The engine never sleeps."],
    ["Dismissal", "Sell once. Spaghettified, for good."],
  ];
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 900, top: -60, width: 900, height: 1020, opacity: 0.6 }}>
        <Render w={900} h={1020} scale={1} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #0b0b0c 0%, #0b0b0c 50%, rgba(11,11,12,0.3) 85%)" }} />
      {/* the notice */}
      <div style={{ position: "absolute", left: 90, top: 70, width: 960, background: V.paper, color: "#121212", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", transform: "rotate(-1.2deg)" }}>
        <div style={{ height: 22, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 18px, #121212 18px 36px)` }} />
        <div style={{ padding: "26px 44px 34px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.2em" }}>NOW HIRING · MISSION CONTROL</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 124, lineHeight: 1, textTransform: "uppercase", marginTop: 8 }}>Astronauts</div>
          <div style={{ display: "inline-block", fontFamily: VF.display, fontWeight: 900, fontSize: 124, lineHeight: 1, textTransform: "uppercase", background: "#121212", color: V.orange, padding: "4px 18px 0", marginTop: 10 }}>wanted.</div>
          <div style={{ marginTop: 24 }}>
            {rows.map(([k, v], i) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 18, padding: "12px 0", borderTop: "2px solid rgba(18,18,18,0.18)" }}>
                <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 30, letterSpacing: "0.06em", textTransform: "uppercase", color: i === 4 ? V.red : "#121212" }}>{k}</span>
                <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 31 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <span style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 26 }}>Apply at {SITE}</span>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 22, letterSpacing: "0.12em", border: "3px solid #121212", padding: "4px 12px" }}>NO EXPERIENCE NEEDED</span>
          </div>
        </div>
      </div>
      {/* the recruiter */}
      <div style={{ position: "absolute", right: 60, bottom: -40 }}>
        <Mascot size={560} bare />
      </div>
    </AbsoluteFill>
  );
}

/* ───────── 3. gimmick: the hawk reacts to a seller ───────── */

export function HKBoldChoice() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <Tape word="Seller detected" tone="red" width={2200} angle={-4} size={32} style={{ left: -200, top: 36 }} />
      <div style={{ position: "absolute", left: 100, top: 210, width: 860 }}>
        <Caps size={24} color={V.muted}>A wallet just sold $HAWK</Caps>
        <Head size={170} style={{ marginTop: 10 }}>
          Bold <span style={{ color: V.orange }}>choice.</span>
        </Head>
        <Body size={36} color={V.paper} style={{ marginTop: 24, maxWidth: 780 }}>
          It's off the board for good. Its share of every emission now goes to the ten who held.
        </Body>
        <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 18, background: "#121212", border: `3px solid ${V.orange}`, padding: "14px 22px" }}>
          <Tri size={44} />
          <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 34, letterSpacing: "0.06em", color: V.paper, textTransform: "uppercase" }}>Thank you for your service.</span>
        </div>
      </div>
      {/* the hawk, unimpressed, with a speech bubble */}
      <div style={{ position: "absolute", right: 80, top: 250 }}>
        <div style={{ position: "absolute", left: -150, top: -110, background: V.paper, color: "#121212", padding: "16px 24px", fontFamily: VF.display, fontWeight: 900, fontSize: 40, letterSpacing: "0.02em", border: "4px solid #121212", boxShadow: "8px 8px 0 #121212", zIndex: 2 }}>
          SPAGHETTI, EXTRA LONG.
          <div style={{ position: "absolute", right: 70, bottom: -26, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "26px solid #121212" }} />
        </div>
        <Mascot size={600} ring />
      </div>
      <Mono size={24} color={V.orange} style={{ position: "absolute", left: 100, bottom: 54 }}>
        {SITE} · $HAWK · ON PONS
      </Mono>
    </AbsoluteFill>
  );
}

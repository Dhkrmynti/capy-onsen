/**
 * Four posts for X: the Connect X update, a burn news card (props, read from hawkings.fun at
 * render time by render-hawking-hooks3.sh), a name-tag gimmick and a hook.
 */
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Body, Caps, Head, Mono, SITE, Tri, V, VF } from "./HKTheme";
import { Mascot } from "./HKMascot";
import { Render } from "./HKStills";

const XMark = ({ size = 40, color = V.paper }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill={color} d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8L18.9 2Zm-1.1 18.1h1.7L6.3 3.8H4.5l13.3 16.3Z" />
  </svg>
);

const Footer = ({ right }: { right?: string }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 62, background: "#121212", borderTop: `4px solid ${V.orange}`, display: "flex", alignItems: "center", padding: "0 90px", justifyContent: "space-between" }}>
    <Mono size={22} color={V.orange}>{SITE} · $HAWK · ON PONS</Mono>
    {right ? <Mono size={20} color={V.muted}>{right}</Mono> : null}
  </div>
);

/* ───────── 1. feature: Connect X is live ───────── */

export function HKXFeature() {
  const steps = ["Connect the wallet that holds $HAWK", "Your dosimeter → “Set your name, astronaut or connect X”", "Tab Connect X → Sign & connect X → Authorize"];
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 18, background: `repeating-linear-gradient(-45deg, ${V.orange} 0 18px, #121212 18px 36px)` }} />
      <div style={{ position: "absolute", left: 90, top: 70, width: 760 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: V.orange, color: "#121212", fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.14em", padding: "6px 14px" }}>NEW ON {SITE.toUpperCase()}</div>
        <Head size={118} style={{ marginTop: 14 }}>
          Connect <span style={{ color: V.orange }}>X.</span>
        </Head>
        <Body size={32} color={V.paper} style={{ marginTop: 16 }}>
          Put your X handle, picture and badge on the exposure board, right next to your rank.
        </Body>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ width: 52, height: 52, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "#121212", border: `3px solid ${V.orange}`, fontFamily: VF.display, fontWeight: 900, fontSize: 30, color: V.orange }}>{i + 1}</span>
              <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 27, color: V.paper }}>{s}</span>
            </div>
          ))}
        </div>
        <Mono size={20} color={V.muted} style={{ marginTop: 26 }}>READ-ONLY · WE NEVER POST OR SEE YOUR DMS</Mono>
      </div>
      {/* the booth from the site */}
      <div style={{ position: "absolute", right: 90, top: 190, width: 640 }}>
        <div style={{ position: "absolute", right: -30, top: -70 }}>
          <div style={{ width: 120, height: 120, borderRadius: 26, background: "#000", border: `4px solid ${V.orange}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XMark size={66} />
          </div>
        </div>
        <div style={{ border: `4px solid ${V.orange}`, boxShadow: "0 40px 80px rgba(0,0,0,0.7)", background: "#121212" }}>
          <Img src={staticFile("hk/booth-x.png")} style={{ display: "block", width: 632 }} />
        </div>
      </div>
      <Footer />
    </AbsoluteFill>
  );
}

/* ───────── 2. news: the second burn ───────── */

export type BurnProps = { n: number; burnedNow: number; burnedTotal: number; fedETH: number; treasuryETH: number; rounds: number; next: string; escrow: number; nextETH: string; at: string };
export const BURN_DEFAULTS: BurnProps = { n: 2, burnedNow: 1952632, burnedTotal: 4119979, fedETH: 0.0685, treasuryETH: 0.0856, rounds: 7, next: "Treasury", escrow: 0.0207, nextETH: "0.025", at: "" };
const mil = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : `${Math.round(n / 1e3)}K`);
const nth = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

export function HKBurnNews({ n, burnedNow, burnedTotal, fedETH, treasuryETH, rounds, next, escrow, nextETH, at }: BurnProps) {
  const stats: [string, string, string][] = [
    [`${mil(burnedTotal)}`, "$HAWK burned so far, for good", V.red],
    [`${fedETH.toFixed(4)} ETH`, "paid to the ten nearest the core", V.orange],
    [`${treasuryETH.toFixed(4)} ETH`, "into the Containment Fund", V.paper],
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
        <Caps size={24}>Evaporation · the {nth(n)} buyback & burn</Caps>
        <Head size={112} style={{ marginTop: 6 }}>
          {mil(burnedNow)} $HAWK <span style={{ color: V.red }}>gone.</span>
        </Head>
        <Body size={31} color={V.paper} style={{ marginTop: 12 }}>
          The engine bought it back on Pons and burned exactly what it bought. Supply only goes one way.
        </Body>
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          {stats.map(([v, l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 22, background: "rgba(18,18,18,0.9)", borderLeft: `8px solid ${c}`, padding: "12px 24px" }}>
              <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 52, color: c, minWidth: 300 }}>{v}</span>
              <span style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 29, color: V.paper }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 150, width: 380, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ background: "#121212", border: `3px solid ${V.red}`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 76, lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 80, lineHeight: 0.95, color: V.red }}>{rounds}</div>
            <div style={{ fontFamily: VF.display, fontWeight: 800, fontSize: 20, letterSpacing: "0.14em", color: V.muted }}>ROUNDS, NO HANDS</div>
          </div>
        </div>
        <div style={{ background: V.orange, color: "#121212", padding: "16px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 20, letterSpacing: "0.14em" }}>RUNNING NOW</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 40, lineHeight: 1.05, textTransform: "uppercase" }}>{next}</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 21, marginTop: 4 }}>
            {escrow.toFixed(4)} / {nextETH} ETH
          </div>
        </div>
        <div style={{ background: "#121212", border: `3px solid ${V.paper}`, padding: "14px 22px" }}>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 20, letterSpacing: "0.14em", color: V.muted }}>THEN</div>
          <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 34, color: V.paper, textTransform: "uppercase" }}>The next reward</div>
        </div>
      </div>
      <Footer right={at ? `LIVE READING · ${at}` : undefined} />
    </AbsoluteFill>
  );
}

/* ───────── 3. gimmick: the name tag ───────── */

export function HKNameTag() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        <Render w={1600} h={900} scale={0.9} />
      </div>
      <AbsoluteFill style={{ background: "rgba(11,11,12,0.55)" }} />
      {/* the sticker */}
      <div style={{ position: "absolute", left: 120, top: 150, width: 820, background: V.red, borderRadius: 28, padding: "18px 18px 22px", transform: "rotate(-4deg)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
        <div style={{ textAlign: "center", color: "#fff", fontFamily: VF.display, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "0.04em" }}>HELLO</div>
        <div style={{ textAlign: "center", color: "#fff", fontFamily: VF.display, fontWeight: 800, fontSize: 36, letterSpacing: "0.2em", marginTop: 4 }}>MY NAME IS</div>
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, height: 250, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <XMark size={70} color="#121212" />
          <span style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', cursive", fontWeight: 700, fontSize: 96, color: "#121212", transform: "rotate(-2deg)" }}>@you</span>
        </div>
        <div style={{ textAlign: "center", color: "#fff", fontFamily: VF.mono, fontWeight: 700, fontSize: 24, marginTop: 14, letterSpacing: "0.08em" }}>RANK: NEAR THE CORE · STATUS: NEVER SOLD</div>
      </div>
      <div style={{ position: "absolute", right: 90, top: 140, width: 520 }}>
        <Caps size={22}>Mission Control dress code</Caps>
        <Head size={88} style={{ marginTop: 10 }}>
          Wear your <span style={{ color: V.orange }}>@</span> to the core.
        </Head>
        <Body size={30} color={V.paper} style={{ marginTop: 18 }}>
          Connect X on hawkings.fun and the board shows your handle instead of 0x…
        </Body>
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 40 }}>
        <Mascot size={300} bare />
      </div>
      <Footer />
    </AbsoluteFill>
  );
}

/* ───────── 4. hook: anonymous 0x vs your @ ───────── */

export function HKHookHandle() {
  const rows: [string, string, boolean][] = [
    ["01", "@you", true],
    ["02", "0x1a2b…3c4d", false],
    ["03", "0x5e6f…7a8b", false],
  ];
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 90, top: 110, width: 760 }}>
        <Head size={120}>Nobody remembers</Head>
        <Head size={120} color={V.orange} style={{ textTransform: "none" }}>
          0x1a2b…3c4d.
        </Head>
        <Body size={36} color={V.paper} style={{ marginTop: 28, maxWidth: 680 }}>
          Hold near the core with your X on it. Let them see who's getting paid.
        </Body>
      </div>
      {/* a slice of the board */}
      <div style={{ position: "absolute", right: 90, top: 200, width: 600, display: "flex", flexDirection: "column", gap: 12 }}>
        <Mono size={20} color={V.muted}>EXPOSURE BOARD · RED ZONE</Mono>
        {rows.map(([n, who, me]) => (
          <div key={n} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", alignItems: "center", height: 96, padding: "0 24px", background: me ? V.orange : "#1b1d20", color: me ? "#121212" : V.muted, borderLeft: `10px solid ${V.red}`, transform: me ? "scale(1.04)" : "none", boxShadow: me ? "0 24px 50px rgba(255,209,0,0.25)" : "none" }}>
            <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 46 }}>{n}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: me ? VF.display : VF.mono, fontWeight: me ? 900 : 700, fontSize: me ? 48 : 32 }}>
              {me ? <XMark size={36} color="#121212" /> : null}
              {who}
            </span>
            {me ? <span style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 24, letterSpacing: "0.1em" }}>YOU</span> : null}
          </div>
        ))}
      </div>
      <Footer />
    </AbsoluteFill>
  );
}

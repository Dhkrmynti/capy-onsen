/**
 * Hawking live-state posters for X: the numbers come in as props, read from hawkings.fun
 * at render time (see render-hawking-now.sh), so a poster never shows a made-up figure.
 */
import { AbsoluteFill } from "remotion";
import { Body, Caps, Head, Mono, Placard, SITE, Tape, V, VF } from "./HKTheme";
import { Level, Render, Zones } from "./HKStills";
import { Prohibit } from "./HKSigns";

export type NowProps = {
  ca: string;
  heirs: number; // wallets on the board that never sold
  out: number; // wallets spaghettified
  escrow: number; // ETH waiting toward the next emission
  target: number; // the emission size, ETH
  at: string; // when the numbers were read, WIB
};

export const HK_NOW_DEFAULTS: NowProps = { ca: "0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca", heirs: 8, out: 8, escrow: 0.0042, target: 0.02, at: "" };

function Footer({ at }: { at: string }) {
  return (
    <div style={{ position: "absolute", left: 100, right: 100, bottom: 50, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <Mono size={24} color={V.orange}>{SITE} · $HAWK · ON PONS</Mono>
      {at ? <Mono size={18} color={V.muted}>LIVE READING · {at}</Mono> : null}
    </div>
  );
}

function CaBox({ ca }: { ca: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", background: "#121212", border: `3px solid ${V.orange}` }}>
      <span style={{ background: V.orange, color: "#121212", fontFamily: VF.display, fontWeight: 900, fontSize: 26, letterSpacing: "0.12em", padding: "14px 18px" }}>CA</span>
      <span style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 26, color: V.paper, padding: "14px 20px" }}>{ca.toLowerCase()}</span>
    </div>
  );
}

/* ───────── 1. live on Pons, with the CA ───────── */

export function HKNowLive({ ca }: NowProps) {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 640, top: -40, width: 1060, height: 980 }}>
        <Render w={1060} h={980} scale={1.1} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #0b0b0c 0%, #0b0b0c 40%, rgba(11,11,12,0) 70%)" }} />
      <Tape word="Live on Pons" width={2200} angle={-4} size={34} style={{ left: -200, top: 34 }} />
      <div style={{ position: "absolute", left: 100, top: 190, width: 900 }}>
        <Caps size={24}>The site is open</Caps>
        <Head size={170} style={{ marginTop: 10 }}>
          $HAWK is <span style={{ color: V.orange }}>live.</span>
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 20, maxWidth: 760 }}>
          The ten biggest holders sit nearest the core and get paid in ETH. Sell once and you're spaghettified.
        </Body>
        <div style={{ marginTop: 44 }}>
          <CaBox ca={ca} />
        </div>
      </div>
      <Footer at="" />
    </AbsoluteFill>
  );
}

/* ───────── 2. zones open on the exposure board ───────── */

export function HKNowZones({ heirs, at }: NowProps) {
  const inTen = Math.min(10, heirs);
  const open = 10 - inTen;
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 100, top: 120, width: 700 }}>
        <Caps size={24}>Exposure board</Caps>
        <Head size={open ? 140 : 120} style={{ marginTop: 12 }}>
          {open ? (
            <>
              {open} {open === 1 ? "zone" : "zones"} <span style={{ color: V.orange }}>open.</span>
            </>
          ) : (
            <>
              All ten <span style={{ color: V.orange }}>taken.</span>
            </>
          )}
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 24, maxWidth: 700 }}>
          {open
            ? `${inTen} ${inTen === 1 ? "holder is" : "holders are"} on the board. Hold 100,000 $HAWK and you take a zone at once, ranked by balance.`
            : `${heirs} holders on site, ten on the board. Out-hold No. 10 and the zone is yours, live.`}
        </Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 34, fontFamily: VF.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.04em", textTransform: "uppercase", color: V.paper }}>
          <span>
            <span style={{ color: V.red }}>■</span> Red zone No. 1-5 · 0.014 ETH
          </span>
          <span>
            <span style={{ color: V.glow }}>■</span> Amber No. 6-10 · 0.006 ETH
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 100 }}>
        <Zones size={680} filled={inTen} open={Array.from({ length: open }, (_, i) => inTen + i)} />
      </div>
      <Footer at={at} />
    </AbsoluteFill>
  );
}

/* ───────── 3. the radiation level toward the first emission ───────── */

export function HKNowLevel({ escrow, target, at }: NowProps) {
  const fill = Math.max(0, Math.min(1, escrow / target));
  const pct = Math.round(fill * 100);
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 760, top: -20, width: 940, height: 940 }}>
        <Render w={940} h={940} scale={1} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #0b0b0c 0%, #0b0b0c 42%, rgba(11,11,12,0.2) 75%)" }} />
      <div style={{ position: "absolute", left: 100, top: 110, width: 900 }}>
        <Caps size={24}>Radiation level</Caps>
        <Head size={160} style={{ marginTop: 10 }}>
          <span style={{ color: V.orange }}>{pct}%</span> charged.
        </Head>
        <Placard width={820} head="CAUTION" style={{ marginTop: 30 }}>
          <div style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 30, lineHeight: 1.3 }}>Every trade charges the level. At {target} ETH the engine emits it to the ten nearest the core.</div>
          <div style={{ marginTop: 22 }}>
            <Level fill={fill} segs={30} />
          </div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 26, marginTop: 12 }}>
            {escrow.toFixed(4)} / {target} ETH to The Emission
          </div>
        </Placard>
      </div>
      <Footer at={at} />
    </AbsoluteFill>
  );
}

/* ───────── 4. spaghettified: who sold, who still holds ───────── */

export function HKNowOut({ heirs, out, at }: NowProps) {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <Tape word="Spaghettified" tone="red" width={2200} angle={-5} size={34} style={{ left: -200, top: 40 }} />
      <div style={{ position: "absolute", left: 100, top: 180, width: 1000 }}>
        <Caps size={24}>Incident report</Caps>
        <Head size={118} style={{ marginTop: 10, whiteSpace: "nowrap" }}>
          {out} <span style={{ color: V.red }}>spaghettified.</span>
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 22, maxWidth: 780 }}>
          {out} {out === 1 ? "wallet" : "wallets"} sold and fell in, for good. {heirs} still {heirs === 1 ? "holds" : "hold"}, and they split the next emission.
        </Body>
        <div style={{ display: "flex", gap: 80, marginTop: 40 }}>
          {[
            [String(heirs), "Still on site", V.orange],
            [String(out), "Spaghettified", V.red],
          ].map(([n, l, c]) => (
            <div key={l}>
              <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 120, lineHeight: 0.9, color: c }}>{n}</div>
              <div style={{ fontFamily: VF.display, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: V.muted, marginTop: 8 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 260 }}>
        <Prohibit kind="sell" size={360} />
      </div>
      <Footer at={at} />
    </AbsoluteFill>
  );
}

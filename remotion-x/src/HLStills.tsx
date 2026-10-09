/** Heirloom stills for X: avatar, header, two posts, and a looping GIF. */
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Body, Caps, Coin, H, HF, Head, Monogram, Sig, WaxSeal, clamp, ease, easeInOut, ramp } from "./HLTheme";

/* ───────── avatar: the coin, centred for X's round crop ───────── */

export function HLLogo() {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${H.v2} 0%, ${H.v1} 45%, ${H.v0} 80%)`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(232,193,110,0.22), rgba(0,0,0,0) 55%)" }} />
      <Coin size={820} turn={0} glow={0.5} id="logo" />
    </AbsoluteFill>
  );
}

/* ───────── header: 1500x500, the avatar covers the lower left ───────── */

export function HLBanner() {
  return (
    <AbsoluteFill style={{ background: H.v0, overflow: "hidden" }}>
      <Img src={staticFile("hl/plate-wall.png")} style={{ position: "absolute", width: 1500, height: 844, top: -190, objectFit: "cover", opacity: 0.9 }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(11,20,36,0.35) 0%, rgba(11,20,36,0.82) 38%, rgba(11,20,36,0.94) 100%)" }} />
      <div style={{ position: "absolute", left: 470, top: 96, right: 300 }}>
        <Caps size={20}>The Family Vault · $HEIR</Caps>
        <Head size={96} style={{ marginTop: 14 }}>
          An heirloom <span style={{ fontFamily: HF.displayItalic, color: H.gold2 }}>is never sold.</span>
        </Head>
        <Body size={27} style={{ marginTop: 16 }}>
          Every trade pays the ten largest holders in ETH. Sell once and you are written out of the will.
        </Body>
        <div style={{ marginTop: 22, fontFamily: HF.data, fontWeight: 600, fontSize: 22, letterSpacing: "0.08em", color: H.gold2 }}>HEIRLOOMS.FUN · ROBINHOOD CHAIN · ON PONS</div>
      </div>
      <div style={{ position: "absolute", right: 44, top: 120 }}>
        <Coin size={260} turn={0.5} glow={0.5} id="bn" />
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the Ten Heirs, from the site ───────── */

export function HLPostHeirs() {
  return (
    <AbsoluteFill style={{ background: H.v0, overflow: "hidden" }}>
      <Img src={staticFile("hl/plate-wall.png")} style={{ position: "absolute", inset: 0, width: 1600, height: 900, objectFit: "cover", opacity: 0.55 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,20,36,0.75), rgba(11,20,36,0.92))" }} />
      <div style={{ position: "absolute", left: 160, top: 40, right: 160, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Caps size={20}>The ledger, live on heirlooms.fun</Caps>
          <Head size={70} style={{ marginTop: 8 }}>
            Ten inherit. <span style={{ fontFamily: HF.displayItalic, color: H.gold2 }}>Fifty are watching.</span>
          </Head>
        </div>
      </div>
      {/* the real ledger, cropped from the site */}
      <div style={{ position: "absolute", left: 160, top: 176, width: 1281, height: 629, overflow: "hidden", borderRadius: 10, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.95), 0 0 0 1px rgba(201,164,92,0.5)" }}>
        <Img src={staticFile("hl/s-_register_0.6.png")} style={{ position: "absolute", width: 1920 * 1.12, left: -388 * 1.12, top: -286 * 1.12 }} />
      </div>
      <div style={{ position: "absolute", left: 160, bottom: 34, right: 160, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Body size={24} style={{ whiteSpace: "nowrap" }}>
          <b style={{ color: H.gold2 }}>◆ No. 1–5</b> share 0.014 ETH · <b style={{ color: H.gold2 }}>◆ No. 6–10</b> share 0.006 ETH · from every 0.02 ETH in fees
        </Body>
        <Body size={18} italic style={{ whiteSpace: "nowrap" }}>Illustration edition</Body>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the will ───────── */

const WILL = [
  ["100,000 $HEIR", "names you in the will"],
  ["No. 1–5", "share 0.014 ETH of every inheritance"],
  ["No. 6–10", "share 0.006 ETH of every inheritance"],
  ["1 hour", "a holding must age before it is paid"],
  ["One sale", "writes you out, for good"],
  ["Your own wallets", "transfers between them are not sales"],
];

export function HLPostWill() {
  return (
    <AbsoluteFill style={{ background: H.v0, overflow: "hidden" }}>
      <Img src={staticFile("hl/plate-will.png")} style={{ position: "absolute", inset: 0, width: 1600, height: 900, objectFit: "cover", opacity: 0.7 }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(11,20,36,0.25), rgba(11,20,36,0.94) 58%)" }} />
      <div style={{ position: "absolute", left: 80, top: 60, width: 840, background: H.paper, color: H.ink, borderRadius: 8, padding: "40px 48px 34px", boxShadow: "0 40px 80px -30px rgba(0,0,0,0.9)" }}>
        <div style={{ position: "absolute", inset: 12, border: "1.5px solid rgba(36,66,122,0.45)", borderRadius: 4 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Monogram size={58} color={H.deedBlue} />
          <Head size={66} color={H.ink}>The will</Head>
        </div>
        {WILL.map(([k, v], i) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 18, padding: "12px 0", borderTop: "1px solid rgba(28,25,19,0.16)", marginTop: i === 0 ? 20 : 0, position: "relative" }}>
            <span style={{ fontFamily: HF.display, fontWeight: 600, fontSize: 31, color: i === 4 ? H.wax : H.deedBlue }}>{k}</span>
            <span style={{ fontFamily: HF.serif, fontSize: 26, color: H.ink2 }}>{v}</span>
          </div>
        ))}
        <div style={{ position: "absolute", right: -96, bottom: -96 }}>
          <WaxSeal size={180} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 260, width: 520 }}>
        <Head size={76} italic color={H.gold2}>
          Patient money inherits.
        </Head>
        <Body size={30} style={{ marginTop: 22 }}>
          The fees of every trade go to the ten largest holders, in ETH. One sale and the will forgets you.
        </Body>
      </div>
      <Sig style={{ right: 80, bottom: 54 }} />
    </AbsoluteFill>
  );
}

/* ───────── GIF: #10 sells, the seal falls, #11 moves up into the zone ───────── */

export const HL_GIF_LENGTH = 150;
const ROWS = [
  ["8", "Wilhelmina Rothwell", "820K"],
  ["9", "Margaux Radcliffe", "560K"],
  ["10", "Edmund Stanhope", "400K"],
  ["11", "Sterling Dunmore", "310K"],
  ["12", "Theodora Langley", "240K"],
];

export function HLGif() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sell = ramp(f, 22, 30);
  const stamp = spring({ frame: f - 30, fps, config: { damping: 9, stiffness: 170 } });
  const leave = easeInOut(ramp(f, 62, 84));
  const rise = easeInOut(ramp(f, 80, 102));
  const glow = ramp(f, 98, 110) * (1 - ramp(f, 136, 150));
  const fadeAll = 1 - ramp(f, 138, 150);
  const fadeIn = ramp(f, 0, 8);
  const ROW = 74;
  const LINE_Y = 214 + ROW * 3; // the line under rank 10
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${H.v2}, ${H.v0} 75%)`, opacity: Math.min(fadeAll, fadeIn) }}>
      <div style={{ position: "absolute", left: 40, top: 40, right: 40 }}>
        <Caps size={18}>The Ten Heirs</Caps>
        <Head size={52} style={{ marginTop: 8 }}>
          {f < 62 ? "Rank 10 sells." : <span>Rank 11 <span style={{ fontFamily: HF.displayItalic, color: H.gold2 }}>inherits.</span></span>}
        </Head>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 214 - 6, height: ROW * 3 + 6, borderRadius: 8, background: "linear-gradient(180deg, #f3e2b2, #ead39a)", boxShadow: `0 0 0 3px ${H.gold}, 0 0 ${30 + glow * 40}px rgba(232,193,110,${0.4 + glow * 0.5})` }} />
      <div style={{ position: "absolute", left: 44, top: 214 - 44, fontFamily: HF.caps, fontWeight: 700, fontSize: 15, letterSpacing: "0.2em", color: H.gold2 }}>◆ INHERITANCE ZONE · NO. 1–10</div>
      {ROWS.map(([rank, name, bal], i) => {
        let y = 214 + i * ROW;
        let op = 1;
        let x = 0;
        if (i === 2) {
          x = leave * 520;
          op = 1 - leave;
        }
        if (i > 2) y -= rise * ROW;
        if (i > 2) y += i === 3 ? 0 : 0;
        const inZone = y < LINE_Y - 10;
        const r = i > 2 ? String(Number(rank) - Math.round(rise)) : rank;
        return (
          <div key={name} style={{ position: "absolute", left: 56 + x, right: 56 - x, top: y, height: ROW, display: "grid", gridTemplateColumns: "56px 1fr auto", alignItems: "center", gap: 14, opacity: op, borderBottom: `1px solid ${inZone ? "rgba(28,25,19,0.14)" : "rgba(201,164,92,0.2)"}` }}>
            <span style={{ fontFamily: HF.displayItalic, fontSize: 34, color: inZone ? "#8a5d12" : H.gold2, textAlign: "center" }}>{r}</span>
            <span style={{ fontFamily: HF.display, fontSize: 32, color: inZone ? H.ink : H.text, textDecoration: i === 2 && sell > 0.5 ? "line-through" : "none" }}>{name}</span>
            <span style={{ fontFamily: HF.data, fontWeight: 700, fontSize: 24, color: inZone ? H.ink2 : H.text2 }}>{i === 2 && sell > 0.5 ? "SOLD" : bal}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 420, top: 300, opacity: stamp > 0.02 ? 1 - leave : 0, transform: `scale(${2 - stamp})` }}>
        <WaxSeal size={170} />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: HF.serifItalic, fontSize: 24, color: H.text2 }}>One sale writes you out, for good.</span>
        <span style={{ fontFamily: HF.caps, fontWeight: 700, fontSize: 18, letterSpacing: "0.16em", color: H.gold2 }}>$HEIR</span>
      </div>
    </AbsoluteFill>
  );
}

export { clamp, ease, interpolate };

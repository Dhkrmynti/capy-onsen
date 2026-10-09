/** Kingpins stills for X: avatar, header, two posts, and the "New King" GIF. */
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { BoardField, Body, Crown, Head, K, KF, Mark, Mono, Piece, Sig, Token, back, easeInOut, ramp } from "./KPTheme";

/* ───────── avatar: the crown on the King, centred for X's round crop ───────── */
export function KPLogo() {
  return (
    <AbsoluteFill style={{ background: K.violet, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: -60, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", opacity: 0.35 }}>
        {Array.from({ length: 36 }, (_, i) => (
          <div key={i} style={{ background: (Math.floor(i / 6) + i) % 2 ? K.violetDeep : K.violet }} />
        ))}
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Crown size={420} style={{ marginBottom: -40, zIndex: 2, rotate: "-6deg" }} />
        <Piece kind="king" size={460} fill={K.crown} />
      </div>
    </AbsoluteFill>
  );
}

/* ───────── header: 1500x500, the avatar covers the lower left ───────── */
export function KPBanner() {
  const rank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as const;
  return (
    <AbsoluteFill style={{ background: K.violet, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -160, top: 250, transform: "perspective(900px) rotateX(58deg) rotateZ(-8deg)", transformOrigin: "50% 0%" }}>
        <BoardField cell={110} />
      </div>
      <div style={{ position: "absolute", right: 60, bottom: 40, display: "flex", gap: 4, alignItems: "flex-end" }}>
        {rank.map((k, i) => (
          <Piece key={i} kind={k} size={k === "king" ? 92 : 72} fill={k === "king" ? K.crown : K.cream} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 470, top: 56 }}>
        <Head size={84}>Take the</Head>
        <Head size={84} color={K.lime}>
          crown.
        </Head>
        <Token bg={K.grape0} color={K.cream} style={{ display: "inline-block", marginTop: 26, padding: "12px 20px", borderRadius: 14 }}>
          <Body size={24}>The biggest $KING holder wears the crown.<br />Every trade pays the top 10 in ETH.</Body>
        </Token>
        <Mono size={22} color={K.cream} style={{ marginTop: 18 }}>
          KINGPINS.FUN · ROBINHOOD CHAIN
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the Ladder, from the site ───────── */
export function KPPostLadder() {
  return (
    <AbsoluteFill style={{ background: K.grape0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, top: 50, right: 80, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Head size={66}>
          Ten get paid. <span style={{ color: K.lime }}>One wears the crown.</span>
        </Head>
      </div>
      <div style={{ position: "absolute", left: 80, top: 176, width: 1440, height: 620, overflow: "hidden", borderRadius: 18, border: `6px solid ${K.ink}`, boxShadow: `0 12px 0 #07030f` }}>
        <Img src={staticFile("kp/s-_ladder_0.png")} style={{ position: "absolute", width: 1920 * 1.06, left: -232 * 1.06, top: -258 * 1.06 }} />
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 30, right: 80, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Mono size={22} color={K.cream}>
          No. 1–5 share 0.014 ETH · No. 6–10 share 0.006 ETH · every 0.02 ETH of fees
        </Mono>
        <Mono size={18} color={K.cream2}>
          illustration
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the rules ───────── */
export function KPPostRules() {
  const rules: [string, string][] = [
    ["100,000 $KING", "puts you on the board."],
    ["Most $KING", "wears the crown."],
    ["Top 10", "split every Tribute."],
    ["One sale", "and you're captured. For good."],
  ];
  return (
    <AbsoluteFill style={{ background: K.lime, color: K.ink, padding: "70px 90px", overflow: "hidden" }}>
      <Head size={92} color={K.ink} style={{ textShadow: "none" }}>
        Rules of the board.
      </Head>
      <div style={{ marginTop: 34 }}>
        {rules.map(([k, v], i) => (
          <div key={k} style={{ padding: "18px 0", borderTop: `5px solid ${K.ink}`, borderBottom: i === rules.length - 1 ? `5px solid ${K.ink}` : undefined, fontFamily: KF.display, fontSize: 58, lineHeight: 1.05 }}>
            <span style={{ color: K.violetDeep }}>{k}</span> {v}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 60, display: "flex", gap: 10, alignItems: "flex-end" }}>
        {(["pawn", "knight", "pawn"] as const).map((k, i) => (
          <Piece key={i} kind={k} size={90} fill={K.cream} style={{ rotate: "90deg" }} />
        ))}
      </div>
      <Sig style={{ left: 90, bottom: 50 }} />
    </AbsoluteFill>
  );
}

/* ───────── GIF: a holder overtakes No. 1 and the crown moves to them ───────── */
export const KP_GIF_LENGTH = 150;
const BAR = 30; // px per million
const FLOOR = 560; // y of the bars' base
export function KPGif() {
  const f = useCurrentFrame();
  const a = 9.4;
  const b = 7.1 + easeInOut(ramp(f, 14, 70)) * 3.3;
  const swap = b > a;
  // the crown sits on the taller bar; when the lead changes it lifts, travels, and lands
  const hop = ramp(f, 72, 104);
  const topOf = (bal: number) => FLOOR - 40 - bal * BAR;
  const fromX = 95;
  const toX = 425;
  const x = !swap ? fromX : fromX + (toX - fromX) * easeInOut(hop);
  const y = !swap ? topOf(a) - 150 : topOf(a) - 150 + (topOf(b) - topOf(a)) * hop - Math.sin(hop * Math.PI) * 50;
  const shout = back(ramp(f, 100, 112)) * (1 - ramp(f, 134, 146));
  const fade = Math.min(ramp(f, 0, 8), 1 - ramp(f, 140, 150));
  const col = (name: string, bal: number, king: boolean, left: number) => (
    <div style={{ position: "absolute", left, top: topOf(bal), width: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Token bg={king ? K.crown : K.lime} style={{ width: 220, height: 40 + bal * BAR, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 14 }}>
        <Mono size={26} color={K.ink}>
          {bal.toFixed(1)}M
        </Mono>
      </Token>
      <Body size={26} color={K.cream}>
        {name}
      </Body>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: K.violet, opacity: fade, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 40, top: 34 }}>
        <Head size={46}>{swap && hop > 0.6 ? "New King." : "Race for No. 1"}</Head>
      </div>
      {col("@kingwhale", a, !(swap && hop > 0.6), 70)}
      {col("0x2f8c…6a9f", b, swap && hop > 0.6, 400)}
      <div style={{ position: "absolute", left: x, top: y }}>
        <Crown size={190} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 120, opacity: shout, transform: `scale(${0.6 + shout * 0.4}) rotate(-8deg)` }}>
        <Token bg={K.exile} color={K.cream} style={{ padding: "10px 20px" }}>
          <span style={{ fontFamily: KF.display, fontSize: 46 }}>CROWNED!</span>
        </Token>
      </div>
      <Mono size={20} color={K.cream} style={{ position: "absolute", left: 40, bottom: 34 }}>
        $KING · kingpins.fun
      </Mono>
      <div style={{ position: "absolute", right: 30, bottom: 24 }}>
        <Mark size={54} />
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: right now — the throne is empty, the board is set ───────── */
export function KPPostEmpty() {
  const rank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as const;
  return (
    <AbsoluteFill style={{ background: K.violet, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", bottom: -330, transform: "translateX(-50%) perspective(1000px) rotateX(56deg)", transformOrigin: "50% 100%" }}>
        <BoardField cell={128} />
      </div>
      <div style={{ position: "absolute", left: 90, bottom: 80, display: "flex", gap: 8, alignItems: "flex-end" }}>
        {rank.map((k, i) => (
          <Piece key={i} kind={k} size={k === "king" ? 104 : 84} fill={k === "king" ? K.crown : K.cream} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, top: 70 }}>
        <Head size={110}>The throne</Head>
        <Head size={110} color={K.lime}>
          is empty.
        </Head>
        <Token bg={K.grape0} color={K.cream} style={{ display: "inline-block", marginTop: 30, padding: "14px 22px", borderRadius: 14 }}>
          <Body size={30}>Hold the most $KING and the crown is yours.</Body>
        </Token>
      </div>
      <div style={{ position: "absolute", right: 110, top: 90, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Crown size={250} style={{ marginBottom: -26, zIndex: 2, rotate: "-6deg" }} />
        <Token bg={K.cream} style={{ width: 300, padding: 18, rotate: "-3deg" }}>
          <div style={{ height: 240, border: `4px dashed ${K.ink}`, borderRadius: 10, background: K.lime, display: "grid", placeItems: "center" }}>
            <Piece kind="king" size={130} fill={K.violet} />
          </div>
          <div style={{ marginTop: 12, fontFamily: KF.display, fontSize: 26, color: K.ink, textAlign: "center" }}>No. 1 · open</div>
        </Token>
      </div>
      <div style={{ position: "absolute", right: 110, bottom: 74, textAlign: "right" }}>
        <Mono size={26} color={K.cream}>
          0 / 0.02 ETH to the first Tribute
        </Mono>
        <Mono size={22} color={K.lime} style={{ marginTop: 8 }}>
          kingpins.fun · @kingpins_rh
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

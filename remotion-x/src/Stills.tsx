import { AbsoluteFill } from "remotion";
import { Flaps, Wall, BoardFrame, Plate, Eyes } from "./Board";
import { Sitwell, Fly } from "./Sitwell";
import { C, F } from "./theme";

/** X profile picture. X crops to a circle, so the face sits inside the middle 80%. */
export function Logo() {
  return (
    <AbsoluteFill>
      <Wall>
        {/* a soft lit disc behind him so the head reads at 48px */}
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 90,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.wallDeep} 0%, ${C.wallDeep} 62%, transparent 63%)`,
          }}
        />
        <Sitwell pad={false} viewBox="58 52 304 304" style={{ position: "absolute", left: 130, top: 120, width: 820, height: 820 }} />
      </Wall>
    </AbsoluteFill>
  );
}

/** X header, 1500x500. The avatar covers the lower-left corner, so the left 340px stays quiet. */
export function Banner() {
  return (
    <AbsoluteFill>
      <Wall>
        <Fly size={46} flap={0} style={{ position: "absolute", left: 120, top: 70, transform: "rotate(-14deg)" }} />
        <Fly size={34} flap={1} style={{ position: "absolute", left: 230, top: 150, transform: "rotate(10deg)" }} />
        <Fly size={28} flap={0} style={{ position: "absolute", left: 1460, top: 50, transform: "rotate(-6deg)" }} />

        <div style={{ position: "absolute", left: 360, top: 62 }}>
          <Plate size={30}>
            <Eyes size={22} />
            Pepads
            <span style={{ background: C.enamelInk, color: C.enamel, borderRadius: 8, padding: "4px 10px", fontSize: 20 }}>$PADS</span>
          </Plate>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 128, lineHeight: 0.9, letterSpacing: "-0.01em", marginTop: 22, color: C.wallInk }}>never hop off.</div>
          <BoardFrame pad={14} style={{ display: "inline-flex", gap: 22, alignItems: "center", marginTop: 26 }}>
            <Flaps keys={[{ at: -999, text: "TOP 10 EAT" }]} cells={10} size={30} />
            <Flaps keys={[{ at: -999, text: "PAID IN ETH", tone: "amber" }]} cells={11} size={30} row={1} />
          </BoardFrame>
        </div>

        <Sitwell style={{ position: "absolute", right: 44, bottom: 18, width: 390, height: 400 }} />
        <div style={{ position: "absolute", right: 470, bottom: 30, fontFamily: F.flap, fontWeight: 600, fontSize: 24, letterSpacing: "0.08em", color: C.wallInkSoft, textTransform: "uppercase" }}>
          pepads.fun · robinhood chain
        </div>
      </Wall>
    </AbsoluteFill>
  );
}

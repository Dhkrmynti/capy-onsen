import { AbsoluteFill } from "remotion";
import { Flaps, Wall, BoardFrame, Plate, Eyes, Coin } from "./Board";
import { Sitwell, Fly } from "./Sitwell";
import { C, F } from "./theme";

const STILL = -999;

/** Footer strip shared by the status posts: brand left, source right. */
function Strip({ note }: { note: string }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Plate size={30}>
        <Eyes size={22} /> pepads.fun
      </Plate>
      <span style={{ fontFamily: F.flap, fontWeight: 600, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color: C.wallInkSoft }}>{note}</span>
    </div>
  );
}

/** Post: the wallets that already sold, as a departures board of cancelled trains. */
export function PaperLegs() {
  const rows: [string, string][] = [
    ["0XF369..1E9F", "14:57 WIB"],
    ["0X0CE2..17F4", "15:02 WIB"],
  ];
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 60 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 120, lineHeight: 0.92 }}>2 frogs already</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 120, lineHeight: 0.92, color: C.stop }}>hopped off.</div>
          <div style={{ fontFamily: F.body, fontSize: 32, color: C.wallInkSoft, marginTop: 18 }}>launched 14:54. first one jumped 3 minutes later. they never eat again.</div>
        </div>

        <BoardFrame title="Hopped off · cancelled for good" pad={22} style={{ position: "absolute", left: 70, top: 400, width: 980 }}>
          {rows.map(([w, t], i) => (
            <div key={w} style={{ display: "flex", gap: 24, marginBottom: i === 0 ? 14 : 0 }}>
              <Flaps cells={12} size={44} row={i * 3} keys={[{ at: STILL, text: w }]} />
              <Flaps cells={9} size={44} row={i * 3 + 1} keys={[{ at: STILL, text: t, tone: "dim" }]} />
              <Flaps cells={4} size={44} row={i * 3 + 2} keys={[{ at: STILL, text: "GONE", tone: "stop" }]} />
            </div>
          ))}
        </BoardFrame>

        {/* the one who stays, and an empty pad where a frog used to sit */}
        <Sitwell style={{ position: "absolute", right: 90, top: 250, width: 400, height: 410 }} look={-8} />
        <svg viewBox="0 330 420 100" style={{ position: "absolute", right: 120, top: 680, width: 300, height: 72, opacity: 0.85 }}>
          <path d="M210 330 C 330 330 404 352 404 378 C 404 404 320 424 210 424 C 100 424 16 404 16 378 C 16 356 70 338 150 333 L 196 372 Z" fill={C.pad} stroke={C.frogInk} strokeWidth="6" />
        </svg>
        <span style={{ position: "absolute", right: 150, top: 760, fontFamily: F.flap, fontWeight: 600, fontSize: 22, letterSpacing: "0.08em", color: C.wallInkSoft, textTransform: "uppercase" }}>
          empty pad · paper legs
        </span>

        <Strip note="live from the engine · 8 oct 15:04 wib" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: how close the first feeding is. Numbers from the engine at 15:04 WIB. */
export function FirstFeeding() {
  const pct = 67;
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 60 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 112, lineHeight: 0.92 }}>first feeding</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 112, lineHeight: 0.92, color: C.amber }}>is {pct}% loaded.</div>
        </div>

        {/* the escrow meter, as a row of flap tiles filling up */}
        <BoardFrame title="Feeding · 0.01 ETH · top 10 eat" pad={22} style={{ position: "absolute", left: 70, top: 330, width: 1000 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 4,
                  background: i < Math.round(pct / 5) ? `linear-gradient(${C.amber}, #d99a0c)` : `linear-gradient(${C.flapLit}, ${C.flap})`,
                  boxShadow: `inset 0 -3px 0 ${C.flapSplit}`,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
            <Flaps cells={12} size={36} keys={[{ at: STILL, text: "0.0067 ETH" }]} />
            <Flaps cells={13} size={36} row={1} keys={[{ at: STILL, text: "BOARDING 67%", tone: "amber" }]} />
          </div>
        </BoardFrame>

        <div style={{ position: "absolute", left: 70, top: 640, display: "flex", gap: 22 }}>
          {[
            ["10", "seats at the table"],
            ["9", "frogs warming the pad"],
            ["15:54", "first seats unlock (wib)"],
          ].map(([n, l]) => (
            <div key={l} style={{ background: C.enamel, color: C.enamelInk, borderRadius: 14, padding: "16px 26px", boxShadow: `inset 0 0 0 3px ${C.enamelInk}`, minWidth: 230 }}>
              <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 60, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Sitwell with the tongue half out, a fly just out of reach */}
        <div style={{ position: "absolute", right: 40, top: 230, width: 520 * 0.95, height: 430 * 0.95 }}>
          <Sitwell viewBox="0 0 520 430" style={{ width: "100%", height: "100%" }} tongue={0.67} look={6} />
        </div>
        <Fly size={58} style={{ position: "absolute", right: 40, top: 300, transform: "rotate(-10deg)" }} />
        <Coin eth size={64} style={{ position: "absolute", right: 300, top: 180 }} />

        <Strip note="live from the engine · 8 oct 15:04 wib" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: the race for feeding #1. The first wallet past the hold time eats the whole escrow alone. */
export function FirstFrog() {
  // Engine data, 8 Oct 15:06 WIB. Sorted by when each wallet passes the 1h hold.
  const rows: [string, string, string, string, "amber" | "dim"][] = [
    ["0X249D..3B25", "15:55", "12.2M", "EATS ALONE", "amber"],
    ["0X701B..4922", "15:56", "6.9M", "1 MIN LATE", "dim"],
    ["0XAAF1..CF66", "15:58", "0.9M", "3 MIN LATE", "dim"],
    ["0X0DCA..A66A", "16:00", "23.2M", "5 MIN LATE", "dim"],
    ["0X898B..C2EB", "16:01", "17.8M", "NEXT ROUND", "dim"],
    ["0XF655..A927", "16:01", "12.4M", "NEXT ROUND", "dim"],
    ["0X4107..F712", "16:01", "8.6M", "NEXT ROUND", "dim"],
  ];
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 50 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 100, lineHeight: 0.92 }}>the first frog</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 100, lineHeight: 0.92, color: C.amber }}>eats alone.</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.wallInkSoft, marginTop: 14, maxWidth: 980 }}>
            feeding #1 is loaded: 0.0103 ETH. it fires the second the first wallet finishes its hour on the pad.
          </div>
        </div>

        <BoardFrame title="Feeding #1 · seat order" pad={18} style={{ position: "absolute", left: 70, top: 330, width: 1070 }}>
          <div style={{ display: "flex", gap: 22, marginBottom: 8, fontFamily: F.flap, fontWeight: 600, fontSize: 16, letterSpacing: "0.2em", color: C.glyphDim }}>
            <span style={{ width: 12 * 24.6 }}>WALLET</span>
            <span style={{ width: 5 * 24.6 }}>SEATS</span>
            <span style={{ width: 5 * 24.6 }}>BAG</span>
            <span>STATUS</span>
          </div>
          {rows.map(([w, t, b, st, tone], i) => (
            <div key={w} style={{ display: "flex", gap: 22, marginBottom: i < rows.length - 1 ? 8 : 0, opacity: i === 0 ? 1 : 0.8 }}>
              <Flaps cells={12} size={34} row={i * 4} keys={[{ at: STILL, text: w }]} />
              <Flaps cells={5} size={34} row={i * 4 + 1} keys={[{ at: STILL, text: t, tone: i === 0 ? "amber" : "dim" }]} />
              <Flaps cells={5} size={34} row={i * 4 + 2} keys={[{ at: STILL, text: b }]} />
              <Flaps cells={10} size={34} row={i * 4 + 3} keys={[{ at: STILL, text: st, tone }]} />
            </div>
          ))}
        </BoardFrame>

        {/* Sitwell with the whole plate: the ETH coin in front of him */}
        <Sitwell style={{ position: "absolute", right: 70, top: 300, width: 380, height: 390 }} look={-6} />
        <Coin eth size={120} style={{ position: "absolute", right: 200, top: 190 }} />
        <span style={{ position: "absolute", right: 120, top: 700, width: 280, textAlign: "center", fontFamily: F.flap, fontWeight: 700, fontSize: 28, color: C.amber, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          0.0103 ETH · 1 plate
        </span>

        <Strip note="provisional · engine data 8 oct 15:06 wib · sell and you're off" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: feeding #1 is done, as a dinner receipt. Data from round #1 on the engine. */
export function FirstServed() {
  const line = (k: string, v: string, strong = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.flap, fontWeight: strong ? 700 : 600, fontSize: strong ? 40 : 30, marginBottom: 10 }}>
      <span style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</span>
      <span>{v}</span>
    </div>
  );
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 60 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 110, lineHeight: 0.92 }}>feeding #1:</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 110, lineHeight: 0.92, color: C.amber }}>served.</div>
          <div style={{ fontFamily: F.body, fontSize: 30, color: C.wallInkSoft, marginTop: 18, maxWidth: 620 }}>
            11 frogs hopped off before dinner. one stayed seated and ate the whole plate, straight to the wallet, in ETH.
          </div>
        </div>

        <BoardFrame pad={16} style={{ position: "absolute", left: 70, top: 470, display: "flex", gap: 22 }}>
          <Flaps cells={10} size={38} keys={[{ at: STILL, text: "FEEDING 1" }]} />
          <Flaps cells={12} size={38} row={1} keys={[{ at: STILL, text: "SERVED", tone: "amber" }]} />
        </BoardFrame>
        <BoardFrame pad={16} style={{ position: "absolute", left: 70, top: 572, display: "flex", gap: 22 }}>
          <Flaps cells={10} size={38} row={2} keys={[{ at: STILL, text: "HOPPED OFF" }]} />
          <Flaps cells={12} size={38} row={3} keys={[{ at: STILL, text: "11 · NO FOOD", tone: "stop" }]} />
        </BoardFrame>

        {/* the receipt */}
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 70,
            width: 470,
            padding: "34px 36px 40px",
            background: C.enamel,
            color: C.enamelInk,
            borderRadius: 14,
            transform: "rotate(-2.5deg)",
            boxShadow: `inset 0 0 0 3px ${C.enamelInk}, 0 30px 60px -30px rgba(4,22,14,.9)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: F.sign, fontWeight: 800, fontSize: 40, textTransform: "uppercase" }}>
            <Eyes size={28} /> the pond diner
          </div>
          <div style={{ fontFamily: F.flap, fontWeight: 600, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, margin: "6px 0 22px" }}>8 oct 2026 · 15:16 wib</div>
          <div style={{ borderTop: `3px dashed ${C.enamelInk}`, paddingTop: 22 }}>
            {line("table for", "1 frog")}
            {line("guest", "0x792d…edfc")}
            {line("bag at the table", "4.81M $PADS")}
            {line("seats empty", "9")}
          </div>
          <div style={{ borderTop: `3px dashed ${C.enamelInk}`, paddingTop: 22, marginTop: 12 }}>
            {line("served", "0.0137 ETH", true)}
          </div>
          <div style={{ borderTop: `3px dashed ${C.enamelInk}`, paddingTop: 18, marginTop: 8, fontFamily: F.flap, fontWeight: 600, fontSize: 22 }}>
            TX 0x6310b1…66dd · PAID BY THE ENGINE
          </div>
          <div
            style={{
              position: "absolute",
              right: -34,
              bottom: -30,
              transform: "rotate(-14deg)",
              background: C.enamel,
              border: `5px solid ${C.stop}`,
              color: C.stop,
              borderRadius: 10,
              padding: "6px 16px",
              fontFamily: F.sign,
              fontWeight: 900,
              fontSize: 44,
              opacity: 0.9,
            }}
          >
            PAID
          </div>
        </div>

        <Sitwell style={{ position: "absolute", right: 50, top: 380, width: 330, height: 338 }} look={-4} />
        <Coin eth size={90} style={{ position: "absolute", right: 110, top: 290 }} />

        <Strip note="engine round #1 · on robinhood chain" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: the seat chart, with nine of the ten seats still free. Engine data 8 Oct 15:23 WIB. */
export function Scoop() {
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 56 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 92, lineHeight: 0.92 }}>scoop a seat</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 92, lineHeight: 0.92, color: C.amber }}>before the pond fills.</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.wallInkSoft, marginTop: 12, maxWidth: 900 }}>
            the top 10 bags split every feeding, in ETH. right now one frog is eating alone.
          </div>
        </div>

        {/* seat chart: one taken, nine waiting */}
        <BoardFrame title="Feeding table · top 10 seats" pad={20} style={{ position: "absolute", left: 70, top: 318, width: 1000 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {Array.from({ length: 10 }, (_, i) => {
              const taken = i === 0;
              return (
                <div
                  key={i}
                  style={{
                    height: 118,
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: taken ? C.enamel : "transparent",
                    border: taken ? "none" : `3px dashed ${C.glyphDim}`,
                    boxShadow: taken ? `inset 0 0 0 3px ${C.enamelInk}` : "none",
                    color: taken ? C.enamelInk : C.glyphDim,
                    fontFamily: F.flap,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: 22, letterSpacing: "0.1em", opacity: 0.8 }}>SEAT #{i + 1}</span>
                  {taken ? (
                    <>
                      <Sitwell pad={false} viewBox="58 52 304 304" style={{ width: 44, height: 44 }} />
                      <span style={{ fontSize: 22 }}>10.1M · ate Ξ</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 30, color: C.amber }}>your bag?</span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
            <Flaps cells={10} size={34} keys={[{ at: STILL, text: "SEATS FREE" }]} />
            <Flaps cells={3} size={34} row={1} keys={[{ at: STILL, text: "9", tone: "amber" }]} />
            <Flaps cells={8} size={34} row={2} keys={[{ at: STILL, text: "MIN 100K", tone: "dim" }]} />
          </div>
        </BoardFrame>

        {/* regret: a grey frog watching from the shore */}
        <div style={{ position: "absolute", right: 70, top: 300, width: 400, textAlign: "center" }}>
          <Sitwell pad={false} style={{ width: 300, height: 290, filter: "grayscale(1) brightness(0.8)" }} look={-8} />
          <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 30, color: C.wallInk, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            frog who waited
          </div>
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.wallInkSoft, marginTop: 6 }}>watching from the shore. again.</div>
        </div>

        <Strip note="engine data 8 oct 15:23 wib · memecoin, no promises · fees decide the feedings" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: hour one, as a time capsule. Engine data 8 Oct 15:26 WIB (launched 14:54). */
export function HourOne() {
  const inWallets = 4.8;
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 56 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 112, lineHeight: 0.92 }}>this is hour 1.</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 72, lineHeight: 1, color: C.amber, marginTop: 12 }}>95% of $PADS is still on the shelf.</div>
        </div>

        {/* supply bar: a sliver in wallets, the rest still in the Pons curve */}
        <div style={{ position: "absolute", left: 70, top: 300, width: 1050 }}>
          <div style={{ display: "flex", height: 92, borderRadius: 12, overflow: "hidden", boxShadow: `inset 0 0 0 4px ${C.frogInk}` }}>
            <div style={{ width: `${inWallets}%`, background: C.amber }} />
            <div style={{ flex: 1, background: `repeating-linear-gradient(90deg, ${C.wallShade} 0 22px, ${C.wallDeep} 22px 44px)`, display: "flex", alignItems: "center", paddingLeft: 26, fontFamily: F.flap, fontWeight: 700, fontSize: 34, color: C.wallInk, letterSpacing: "0.04em" }}>
              952M STILL IN THE PONS CURVE
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: F.flap, fontWeight: 600, fontSize: 24, color: C.wallInkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <span style={{ color: C.amber }}>▲ 4.8% out in wallets</span>
            <span>1,000,000,000 supply</span>
          </div>
        </div>

        <BoardFrame title="Time capsule · 8 Oct 2026" pad={18} style={{ position: "absolute", left: 70, top: 500, width: 1050 }}>
          {(
            [
              ["AGE", "32 MIN", "amber"],
              ["FED SO FAR", "0.0137 ETH", "amber"],
              ["SEATED", "1 OF 10", "glyph"],
              ["HOPPED OFF", "11 FROGS", "stop"],
            ] as const
          ).map(([k, v, tone], i) => (
            <div key={k} style={{ display: "flex", gap: 24, marginBottom: i < 3 ? 8 : 0 }}>
              <Flaps cells={10} size={36} row={i * 2} keys={[{ at: STILL, text: k, tone: "dim" }]} />
              <Flaps cells={10} size={36} row={i * 2 + 1} keys={[{ at: STILL, text: v, tone }]} />
            </div>
          ))}
        </BoardFrame>

        {/* you are here: Sitwell at the very start of the line */}
        <div style={{ position: "absolute", right: 90, top: 250, width: 360, textAlign: "center" }}>
          <div style={{ display: "inline-block", background: C.stop, color: C.wallInk, fontFamily: F.sign, fontWeight: 900, fontSize: 40, padding: "10px 22px", borderRadius: 12, boxShadow: `inset 0 0 0 3px ${C.frogInk}` }}>YOU ARE HERE</div>
          <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `22px solid ${C.stop}` }} />
          <Sitwell style={{ width: 340, height: 348, marginTop: 10 }} look={-6} />
          <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 28, color: C.wallInk, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>stop #1 of the line</div>
        </div>

        <div style={{ position: "absolute", left: 690, top: 585, width: 400, transform: "rotate(-3deg)" }}>
          <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 54, lineHeight: 1, color: C.amber }}>screenshot this.</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.glyph, marginTop: 10 }}>hour 1 only happens once.</div>
        </div>

        <Strip note="engine data 8 oct 15:26 wib · memecoin, no promises" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: a wallet that sold, then bought back bigger, still has no seat. Engine data 8 Oct 15:26 WIB. */
export function NoSeatBack() {
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 56 }}>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 108, lineHeight: 0.92 }}>you can&rsquo;t buy</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 108, lineHeight: 0.92, color: C.stop }}>your seat back.</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.wallInkSoft, marginTop: 14, maxWidth: 900 }}>
            one wallet sold at 15:08, then came back with an even bigger bag. the engine remembers.
          </div>
        </div>

        <BoardFrame title="Wallet 0x249d…3b25 · history" pad={20} style={{ position: "absolute", left: 70, top: 360, width: 1020 }}>
          {(
            [
              ["15:08", "SOLD 12.2M", "HOPPED OFF", "stop"],
              ["LATER", "BOUGHT 21.8M", "STILL OFF", "stop"],
              ["NOW", "BIGGEST BAG", "NO SEAT", "stop"],
            ] as const
          ).map(([t, what, st, tone], i) => (
            <div key={t} style={{ display: "flex", gap: 22, marginBottom: i < 2 ? 10 : 0 }}>
              <Flaps cells={5} size={38} row={i * 3} keys={[{ at: STILL, text: t, tone: "dim" }]} />
              <Flaps cells={14} size={38} row={i * 3 + 1} keys={[{ at: STILL, text: what }]} />
              <Flaps cells={10} size={38} row={i * 3 + 2} keys={[{ at: STILL, text: st, tone }]} />
            </div>
          ))}
        </BoardFrame>

        <div style={{ position: "absolute", left: 70, top: 660, display: "flex", gap: 22 }}>
          {[
            ["21.8M", "bag size", C.enamel, C.enamelInk],
            ["0", "ETH from feedings", C.stop, C.wallInk],
            ["forever", "hopped off", C.board, C.stop],
          ].map(([n, l, bg, ink]) => (
            <div key={l} style={{ background: bg, color: ink, borderRadius: 14, padding: "16px 26px", boxShadow: `inset 0 0 0 3px ${C.frogInk}`, minWidth: 250 }}>
              <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 58, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* a grey frog with a huge bag, standing next to a pad it can't sit on */}
        <div style={{ position: "absolute", right: 80, top: 300, width: 400, textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Sitwell pad={false} style={{ width: 300, height: 290, filter: "grayscale(1) brightness(0.8)" }} look={8} />
            <div style={{ position: "absolute", right: -30, bottom: 10, width: 120, height: 120, borderRadius: "40% 40% 46% 46%", background: C.amber, boxShadow: `inset 0 0 0 5px ${C.frogInk}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sign, fontWeight: 900, fontSize: 30, color: C.amberInk }}>21.8M</div>
          </div>
          <svg viewBox="0 330 420 100" style={{ width: 300, height: 72, marginTop: 10 }}>
            <path d="M210 330 C 330 330 404 352 404 378 C 404 404 320 424 210 424 C 100 424 16 404 16 378 C 16 356 70 338 150 333 L 196 372 Z" fill={C.pad} stroke={C.frogInk} strokeWidth="6" />
          </svg>
          <div style={{ display: "inline-block", marginTop: 8, border: `4px solid ${C.stop}`, color: C.stop, borderRadius: 10, padding: "4px 16px", fontFamily: F.sign, fontWeight: 900, fontSize: 36, transform: "rotate(-6deg)" }}>SEAT CLOSED</div>
        </div>

        <Strip note="engine data 8 oct 15:26 wib · sold once = off for good" />
      </Wall>
    </AbsoluteFill>
  );
}

/** Post: the only frog still seated, as an employee-of-the-month poster. Engine data 8 Oct 16:33 WIB. */
export function SitterOfTheMonth() {
  return (
    <AbsoluteFill>
      <Wall>
        <div style={{ position: "absolute", left: 70, top: 56 }}>
          <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 30, letterSpacing: "0.2em", color: C.amber, textTransform: "uppercase" }}>the pond presents</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 112, lineHeight: 0.92, marginTop: 10 }}>sitter of</div>
          <div style={{ fontFamily: F.sign, fontWeight: 800, fontSize: 112, lineHeight: 0.92, color: C.amber }}>the month.</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.wallInkSoft, marginTop: 14, maxWidth: 760 }}>
            11 frogs jumped. this one sat down, kept buying, and got fed. it has been sitting alone ever since.
          </div>
        </div>

        <BoardFrame title="Record · 0x792d…edfc" pad={18} style={{ position: "absolute", left: 70, top: 470, width: 860 }}>
          {(
            [
              ["SAT DOWN", "15:08 WIB", "glyph"],
              ["FIRST BAG", "558K", "dim"],
              ["BAG NOW", "11.2M  20X", "amber"],
              ["FED", "0.0137 ETH", "amber"],
              ["SOLD", "NEVER", "glyph"],
            ] as const
          ).map(([k, v, tone], i) => (
            <div key={k} style={{ display: "flex", gap: 22, marginBottom: i < 4 ? 8 : 0 }}>
              <Flaps cells={9} size={34} row={i * 2} keys={[{ at: STILL, text: k, tone: "dim" }]} />
              <Flaps cells={10} size={34} row={i * 2 + 1} keys={[{ at: STILL, text: v, tone }]} />
            </div>
          ))}
        </BoardFrame>

        {/* the portrait: gold frame, Sitwell in a tiny crown, brass plaque */}
        <div style={{ position: "absolute", right: 90, top: 70, width: 520 }}>
          <div
            style={{
              padding: 24,
              borderRadius: 18,
              background: `linear-gradient(135deg, #ffd66b, ${C.amber} 45%, #b07a08)`,
              boxShadow: `inset 0 0 0 6px ${C.frogInk}, 0 40px 60px -30px rgba(0,0,0,.85)`,
            }}
          >
            <div style={{ position: "relative", height: 520, borderRadius: 10, background: `radial-gradient(circle at 50% 40%, ${C.wallDeep}, ${C.wallShade})`, boxShadow: `inset 0 0 0 5px ${C.frogInk}`, overflow: "hidden" }}>
              {/* crown */}
              <svg viewBox="0 0 120 70" style={{ position: "absolute", left: 200, top: 22, width: 120, height: 70 }}>
                <path d="M6 64 L14 14 L40 40 L60 6 L80 40 L106 14 L114 64 Z" fill={C.amber} stroke={C.frogInk} strokeWidth="5" strokeLinejoin="round" />
                <circle cx="60" cy="44" r="7" fill="#dff4ff" stroke={C.frogInk} strokeWidth="3" />
              </svg>
              <Sitwell style={{ position: "absolute", left: 50, top: 80, width: 420, height: 430 }} look={-5} />
            </div>
          </div>
          <div style={{ margin: "18px auto 0", width: 420, padding: "14px 0", borderRadius: 10, background: `linear-gradient(#e7c45a, #b9902a)`, boxShadow: `inset 0 0 0 3px ${C.frogInk}`, textAlign: "center", color: C.amberInk }}>
            <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 40, lineHeight: 1 }}>0x792d…edfc</div>
            <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", marginTop: 6, textTransform: "uppercase" }}>seat #1 · never hopped off</div>
          </div>
        </div>

        <div style={{ position: "absolute", left: 610, top: 600, width: 300, transform: "rotate(-4deg)" }}>
          <div style={{ fontFamily: F.sign, fontWeight: 900, fontSize: 56, lineHeight: 0.95, color: C.amber }}>be like 0x792d.</div>
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.glyph, marginTop: 10 }}>sit. never sell. get fed.</div>
        </div>

        <Strip note="engine data 8 oct 16:33 wib · 9 seats still empty" />
      </Wall>
    </AbsoluteFill>
  );
}

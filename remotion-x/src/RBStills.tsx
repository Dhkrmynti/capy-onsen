import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { BoardFrame, Flaps } from "./Board";
import { LootCoin, Robin } from "./Robin";
import { F, RB, VAULT_TILE } from "./theme";

/** Robin Heist X assets. Same wall, plates and boards as the rebranded site. */

const STILL = -999;

function Vault({ children }: { children?: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: RB.wall, backgroundImage: VAULT_TILE, backgroundSize: "160px 160px", color: RB.paper, fontFamily: F.body, overflow: "hidden" }}>
      {children}
    </div>
  );
}

/** Paper plate with the brand name, like the site nav. */
function Plate({ size = 32, children, style }: { size?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.4,
        background: RB.paper,
        color: RB.ink,
        borderRadius: 14 * (size / 32),
        padding: `${size * 0.32}px ${size * 0.6}px`,
        fontFamily: F.brand,
        fontSize: size,
        textTransform: "uppercase",
        lineHeight: 1,
        boxShadow: `inset 0 0 0 ${size * 0.09}px ${RB.ink}, inset 0 0 0 ${size * 0.15}px ${RB.paper}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tick({ size = 20 }: { size?: number }) {
  return <span style={{ background: RB.ink, color: RB.paper, borderRadius: 8, padding: `${size * 0.2}px ${size * 0.5}px`, fontFamily: F.flap, fontWeight: 700, fontSize: size }}>$RBANK</span>;
}

function Strip({ note }: { note: string }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Plate size={28}>
        Robin Heist <Tick size={18} />
      </Plate>
      <span style={{ fontFamily: F.flap, fontWeight: 600, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color: RB.paperSoft }}>{note}</span>
    </div>
  );
}

/** X profile picture: Robin's head on a vault-navy disc. */
export function RBLogo() {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #22385a, ${RB.wall} 70%)` }}>
      <Robin pad={false} sack={false} viewBox="62 36 296 296" style={{ position: "absolute", inset: 0, width: 1080, height: 1080 }} />
    </AbsoluteFill>
  );
}

/** X header, 1500x500. The avatar covers the lower-left corner, so the left 340px stays quiet. */
export function RBBanner() {
  return (
    <AbsoluteFill>
      <Vault>
        <LootCoin size={46} style={{ position: "absolute", left: 120, top: 70, transform: "rotate(-14deg)" }} />
        <LootCoin size={34} style={{ position: "absolute", left: 230, top: 160, transform: "rotate(10deg)" }} />
        <div style={{ position: "absolute", left: 360, top: 58 }}>
          <Plate size={30}>
            Robin Heist <Tick size={20} />
          </Plate>
          <div style={{ fontFamily: F.brand, fontSize: 96, lineHeight: 1, marginTop: 20 }}>never snitch.</div>
          <BoardFrame pad={14} style={{ display: "inline-flex", gap: 22, alignItems: "center", marginTop: 22 }}>
            <Flaps keys={[{ at: STILL, text: "TOP 10 SPLIT" }]} cells={12} size={30} />
            <Flaps keys={[{ at: STILL, text: "PAID IN ETH", tone: "amber" }]} cells={11} size={30} row={1} />
          </BoardFrame>
        </div>
        <Robin style={{ position: "absolute", right: 30, bottom: 14, width: 380, height: 390 }} look={-6} />
        <div style={{ position: "absolute", right: 470, bottom: 30, fontFamily: F.flap, fontWeight: 600, fontSize: 24, letterSpacing: "0.08em", color: RB.paperSoft, textTransform: "uppercase" }}>
          robbing the paper hands since block one
        </div>
      </Vault>
    </AbsoluteFill>
  );
}

/** Launch post: the vault is open, and how the heist runs. */
export function RBLaunch() {
  const steps: [string, string, string, string, "amber" | "glyph" | "stop"][] = [
    ["1", "THE SPLIT", "0.01 ETH", "TOP 10 BAGS", "amber"],
    ["2", "HIDEOUT", "0.02 ETH", "TREASURY", "glyph"],
    ["3", "BURN", "0.01 ETH", "BUY + BURN", "stop"],
  ];
  return (
    <AbsoluteFill>
      <Vault>
        <div style={{ position: "absolute", left: 70, top: 56 }}>
          <div style={{ fontFamily: F.flap, fontWeight: 700, fontSize: 30, letterSpacing: "0.2em", color: RB.brass, textTransform: "uppercase" }}>robin heist presents</div>
          <div style={{ fontFamily: F.brand, fontSize: 104, lineHeight: 1, marginTop: 8 }}>the vault</div>
          <div style={{ fontFamily: F.brand, fontSize: 104, lineHeight: 1, color: RB.brass }}>is open.</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: RB.paperSoft, marginTop: 14, maxWidth: 820 }}>
            every trade drops loot. robin grabs it and runs the heist. the crew gets paid in ETH.
          </div>
        </div>

        <BoardFrame title="Heist board" pad={20} style={{ position: "absolute", left: 70, top: 470, width: 960 }}>
          {steps.map(([n, name, eth, to, tone], i) => (
            <div key={n} style={{ display: "flex", gap: 22, marginBottom: i < 2 ? 10 : 0 }}>
              <Flaps cells={1} size={38} row={i * 4} keys={[{ at: STILL, text: n, tone: "amber" }]} />
              <Flaps cells={9} size={38} row={i * 4 + 1} keys={[{ at: STILL, text: name }]} />
              <Flaps cells={8} size={38} row={i * 4 + 2} keys={[{ at: STILL, text: eth, tone: "dim" }]} />
              <Flaps cells={11} size={38} row={i * 4 + 3} keys={[{ at: STILL, text: to, tone }]} />
            </div>
          ))}
        </BoardFrame>

        <Robin style={{ position: "absolute", right: 70, top: 250, width: 470, height: 481 }} look={-6} />
        <div style={{ position: "absolute", right: 120, top: 180, transform: "rotate(-6deg)", border: `5px solid ${RB.alarm}`, color: RB.alarm, borderRadius: 12, padding: "6px 20px", fontFamily: F.brand, fontSize: 40, background: "rgba(21,36,59,.6)" }}>
          SELL = SNITCH
        </div>

        <Strip note="memecoin · not a dividend · no promises" />
      </Vault>
    </AbsoluteFill>
  );
}

/** Migration post: $PADS ends, $RBANK begins. Plain about what happens to the old token. */
export function RBMigration() {
  return (
    <AbsoluteFill>
      <Vault>
        <div style={{ position: "absolute", left: 70, top: 60 }}>
          <div style={{ fontFamily: F.brand, fontSize: 96, lineHeight: 1 }}>new crew.</div>
          <div style={{ fontFamily: F.brand, fontSize: 96, lineHeight: 1, color: RB.brass }}>same heist.</div>
        </div>

        <BoardFrame title="Announcement · 8 Oct 2026" pad={20} style={{ position: "absolute", left: 70, top: 330, width: 980 }}>
          {(
            [
              ["$PADS", "SPLITS END", "stop"],
              ["$RBANK", "SPLITS START", "amber"],
              ["THE ENGINE", "SAME CODE", "glyph"],
              ["THE RULE", "NEVER SNITCH", "glyph"],
            ] as const
          ).map(([k, v, tone], i) => (
            <div key={k} style={{ display: "flex", gap: 22, marginBottom: i < 3 ? 10 : 0 }}>
              <Flaps cells={10} size={40} row={i * 2} keys={[{ at: STILL, text: k, tone: "dim" }]} />
              <Flaps cells={12} size={40} row={i * 2 + 1} keys={[{ at: STILL, text: v, tone }]} />
            </div>
          ))}
        </BoardFrame>

        <div style={{ position: "absolute", left: 70, top: 690, width: 980, fontFamily: F.body, fontSize: 28, lineHeight: 1.4, color: RB.paperSoft }}>
          pepads paid its first split on launch day. from now on the same engine runs for robin heist: every split, hideout transfer and burn goes to $RBANK and shows up in the ledger.
        </div>

        <Robin style={{ position: "absolute", right: 70, top: 220, width: 440, height: 450 }} look={-6} />

        <Strip note="ca in the post · memecoin, no promises" />
      </Vault>
    </AbsoluteFill>
  );
}

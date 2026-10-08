/**
 * Robin Heist X assets in the Gazette look of robinheist.fun: newsprint stock, one red,
 * League Gothic heads, Alfa Slab masthead, wire-service Courier. Same Robin, same mugshots.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMast } from "@remotion/google-fonts/AlfaSlabOne";
import { loadFont as loadHead } from "@remotion/google-fonts/LeagueGothic";
import { loadFont as loadBody } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadData } from "@remotion/google-fonts/ArchivoNarrow";
import { loadFont as loadWire } from "@remotion/google-fonts/CourierPrime";
import { Robin } from "./Robin";
import { Mugshot, type Traits } from "./Mugshot";

// Same tokens as src/styles/tokens.css.
const G = {
  paper: "#dedcd5",
  paperDeep: "#cfccc3",
  paperLift: "#e9e7e1",
  ink: "#161514",
  inkSoft: "#3d3b37",
  inkFaint: "#5d5a54",
  red: "#c8241b",
  redDeep: "#9e1a13",
  redInk: "#fbf3ee",
};
const F = {
  mast: loadMast("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  head: loadHead("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  body: loadBody("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily,
  bodyItalic: loadBody("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  data: loadData("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily,
  wire: loadWire("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily,
};

const SITE = "robinheist.fun";

/* ─────────────────────────── shared press parts ─────────────────────────── */

/** Newsprint: the stock colour plus a faint printed grain. */
function Stock({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <AbsoluteFill
      style={{
        background: G.paper,
        backgroundImage: "radial-gradient(rgba(22,21,20,0.07) 1px, transparent 1.3px)",
        backgroundSize: "7px 7px",
        color: G.ink,
        fontFamily: F.body,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Robin printed as a halftone plate: grayscale, then seen through a dot screen. */
function HalftoneRobin({ size, frameStyle, grab = 0, blink = 0 }: { size: number; frameStyle?: CSSProperties; grab?: number; blink?: number }) {
  const dot = Math.max(5, Math.round(size / 70));
  return (
    <div style={{ position: "relative", width: size, height: size * 1.02, padding: size * 0.03, border: `2px solid ${G.ink}`, background: G.paperLift, ...frameStyle }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <Robin grab={grab} blink={blink} style={{ width: "100%", height: "100%", filter: "grayscale(1) contrast(1.25) brightness(1.02)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, transparent ${dot * 0.28}px, ${G.paperLift} ${dot * 0.42}px)`,
            backgroundSize: `${dot}px ${dot}px`,
            mixBlendMode: "lighten",
            opacity: 0.75,
          }}
        />
      </div>
    </div>
  );
}

function Masthead({ size, color = G.red }: { size: number; color?: string }) {
  return <div style={{ fontFamily: F.mast, fontSize: size, lineHeight: 1.05, color, whiteSpace: "nowrap" }}>The Robin Heist Gazette</div>;
}

function Dateline({ left, mid, right, size = 18 }: { left: string; mid?: string; right: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: `${size * 0.4}px 0 ${size * 0.3}px`,
        borderBottom: `1.5px solid ${G.ink}`,
        fontFamily: F.data,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      <span>{left}</span>
      {mid ? <span>{mid}</span> : null}
      <span>{right}</span>
    </div>
  );
}

/** The red EXTRA banner across the page. */
function Extra({ word, size = 26, style }: { word: string; size?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: `${size * 0.22}px ${size * 0.6}px`,
        background: G.red,
        color: G.redInk,
        fontFamily: F.head,
        fontSize: size,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        lineHeight: 1,
        ...style,
      }}
    >
      <span>Extra</span>
      <span>{word}</span>
      <span>Extra</span>
    </div>
  );
}

const Rule = ({ double = false, style }: { double?: boolean; style?: CSSProperties }) => <div style={{ borderTop: double ? `7px double ${G.ink}` : `1.5px solid ${G.ink}`, ...style }} />;

function Head({ children, size, color = G.ink, style }: { children: ReactNode; size: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: F.head, fontSize: size, lineHeight: 0.9, textTransform: "uppercase", color, letterSpacing: "0.005em", ...style }}>{children}</div>;
}

function Ticker({ size = 22 }: { size?: number }) {
  return <span style={{ display: "inline-block", padding: `${size * 0.18}px ${size * 0.45}px ${size * 0.1}px`, background: G.ink, color: G.paperLift, fontFamily: F.head, fontSize: size, lineHeight: 1, letterSpacing: "0.04em" }}>$RBANK</span>;
}

/** The four-step plan from the site, as one row of panels. */
const PLAN = [
  { big: "Every trade", what: "drops loot in the escrow", loot: true },
  { big: "0.01 ETH", what: "to the top 10 bags" },
  { big: "0.02 ETH", what: "to the hideout" },
  { big: "0.01 ETH", what: "buys $RBANK, burns it" },
];
function PlanPanel({ i, size, style }: { i: number; size: number; style?: CSSProperties }) {
  const p = PLAN[i];
  return (
    <div style={{ flex: 1, padding: `${size * 0.45}px ${size * 0.4}px`, border: `2px solid ${G.ink}`, background: p.loot ? G.ink : G.paperLift, color: p.loot ? G.paper : G.ink, ...style }}>
      <div style={{ fontFamily: F.wire, fontSize: size * 0.42, letterSpacing: "0.06em", opacity: 0.8 }}>{p.loot ? "STEP 0" : `STEP ${i}`}</div>
      <Head size={size * 1.25} color="inherit" style={{ marginTop: size * 0.2 }}>
        {p.big}
      </Head>
      <div style={{ marginTop: size * 0.2, fontFamily: F.data, fontWeight: 700, fontSize: size * 0.46, letterSpacing: "0.05em", textTransform: "uppercase" }}>{p.what}</div>
    </div>
  );
}

const Arrow = ({ size }: { size: number }) => <div style={{ alignSelf: "center", fontFamily: F.head, fontSize: size, lineHeight: 1 }}>→</div>;

/** The take: 25 / 50 / 25 of every cycle. */
function TakeBar({ size, grow = 1 }: { size: number; grow?: number }) {
  const parts = [
    { pct: 25, name: "The split", eth: "0.01 ETH", bg: G.ink, fg: G.paper },
    { pct: 50, name: "Hideout fund", eth: "0.02 ETH", bg: G.paperDeep, fg: G.ink },
    { pct: 25, name: "Burn the ledger", eth: "0.01 ETH", bg: G.paperLift, fg: G.ink },
  ];
  return (
    <div style={{ display: "flex", border: `2px solid ${G.ink}` }}>
      {parts.map((p, i) => (
        <div key={p.name} style={{ flex: `${p.pct * grow + (1 - grow) * 33} 1 0%`, padding: `${size * 0.3}px ${size * 0.4}px`, background: p.bg, color: p.fg, borderLeft: i ? `2px solid ${G.ink}` : undefined, overflow: "hidden" }}>
          <Head size={size * 1.3} color="inherit">
            {p.pct}%
          </Head>
          <div style={{ marginTop: size * 0.12, fontFamily: F.data, fontWeight: 700, fontSize: size * 0.42, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{p.name}</div>
          <div style={{ fontFamily: F.data, fontWeight: 600, fontSize: size * 0.38, opacity: 0.85 }}>{p.eth}</div>
        </div>
      ))}
    </div>
  );
}

/** A rubber stamp, tilted. */
function Stamp({ children, size, color = G.red, rotate = -8, style }: { children: ReactNode; size: number; color?: string; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${size * 0.12}px ${size * 0.3}px ${size * 0.04}px`,
        border: `${Math.max(4, size * 0.08)}px solid ${color}`,
        color,
        fontFamily: F.head,
        fontSize: size,
        lineHeight: 1,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Footer({ size = 20, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: size * 0.5, borderTop: `1.5px solid ${G.ink}`, fontFamily: F.wire, fontSize: size, ...style }}>
      <span style={{ fontWeight: 700 }}>{SITE}</span>
      <span style={{ display: "flex", alignItems: "center", gap: size * 0.6 }}>
        <Ticker size={size * 1.1} /> on Pons · Robinhood Chain
      </span>
    </div>
  );
}

/* ─────────────────────────── logo + banner ─────────────────────────── */

/** X profile picture. X crops it to a circle, so Robin's head sits well inside it. */
export function GZLogo() {
  return (
    <AbsoluteFill style={{ background: G.red }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.12) 2px, transparent 2.6px)", backgroundSize: "18px 18px" }} />
      {/* Robin is printed inside the seal, so nothing pokes past X's circle crop */}
      <div style={{ position: "absolute", left: 90, top: 90, width: 900, height: 900, borderRadius: "50%", overflow: "hidden", background: G.paper }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(22,21,20,0.08) 2px, transparent 2.6px)", backgroundSize: "16px 16px" }} />
        <Robin pad={false} sack={false} viewBox="70 40 280 280" style={{ position: "absolute", left: 60, top: 92, width: 780, height: 780 }} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 90, width: 900, height: 900, borderRadius: "50%", boxShadow: `inset 0 0 0 18px ${G.ink}, inset 0 0 0 32px ${G.paper}, inset 0 0 0 38px ${G.ink}` }} />
    </AbsoluteFill>
  );
}

/** X header, 1500 × 500. The avatar covers the lower left, so that corner stays plain. */
export function GZBanner() {
  return (
    <Stock>
      <div style={{ position: "absolute", left: 60, right: 60, top: 22 }}>
        <Dateline left="Vol. I, No. 1" mid="Robinhood Chain edition" right="Price: 0.01 ETH" size={15} />
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Masthead size={74} />
        </div>
        <Rule double style={{ marginTop: 6 }} />
        <Extra word="Never snitch" size={24} style={{ marginTop: 10 }} />
      </div>
      <div style={{ position: "absolute", left: 420, right: 350, top: 212 }}>
        <Head size={100}>
          Robin hits
          <br />
          the vault.
        </Head>
        <div style={{ marginTop: 10, fontFamily: F.bodyItalic, fontSize: 23, color: G.inkSoft, whiteSpace: "nowrap" }}>Top 10 bags get paid in ETH. Sell once, you&rsquo;re a snitch.</div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 206 }}>
        <HalftoneRobin size={250} frameStyle={{ height: 236 }} />
      </div>
      <div style={{ position: "absolute", left: 420, right: 60, bottom: 22 }}>
        <Footer size={18} />
      </div>
    </Stock>
  );
}

/* ─────────────────────────── three posts, 1600 × 900 ─────────────────────────── */

/** Post 1: how the heist runs. */
export function GZPostPlan() {
  return (
    <Stock>
      <div style={{ position: "absolute", inset: "34px 70px 40px" }}>
        <Dateline left="The Robin Heist Gazette" mid="Crime desk" right="Page 2" size={17} />
        <Extra word="How the heist runs" size={30} style={{ marginTop: 18 }} />
        <Head size={150} style={{ marginTop: 22 }}>
          Every trade is a heist.
        </Head>
        <div style={{ marginTop: 14, fontFamily: F.bodyItalic, fontSize: 30, color: G.inkSoft }}>Robin spends the loot in three jobs, always in this order, then starts again.</div>
        <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
          {PLAN.map((_, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i ? <Arrow size={58} /> : null}
              <PlanPanel i={i} size={46} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22 }}>
          <TakeBar size={48} />
        </div>
        <Footer size={22} style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} />
      </div>
    </Stock>
  );
}

/** Post 2: the one rule. */
export function GZPostWanted() {
  return (
    <Stock>
      <div style={{ position: "absolute", inset: "34px 70px 40px" }}>
        <Dateline left="The Robin Heist Gazette" mid="Notices" right="Page 3" size={17} />
        <div style={{ display: "flex", gap: 60, marginTop: 30, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Head size={64} color={G.red}>
              Notice to the crew
            </Head>
            <Head size={178} style={{ marginTop: 10 }}>
              Sell once,
              <br />
              you&rsquo;re a snitch.
            </Head>
            <div style={{ marginTop: 24, fontFamily: F.body, fontSize: 32, lineHeight: 1.4, maxWidth: 820 }}>
              One sell to the curve or a DEX and your wallet is out of the crew for good. No second chances, no cut, ever. Moving to your own wallet is fine.
            </div>
          </div>
          <div style={{ width: 430, padding: "26px 26px 22px", border: `2px solid ${G.ink}`, background: G.paperLift, textAlign: "center", transform: "rotate(2deg)", boxShadow: "0 18px 34px -20px rgba(40,36,28,.6)" }}>
            <Head size={110} style={{ letterSpacing: "0.04em" }}>
              Wanted
            </Head>
            <div style={{ margin: "14px auto 0", width: 250 }}>
              <Mugshot traits={[1, 3, 5, 3]} size={250} />
            </div>
            <Head size={44} style={{ marginTop: 14 }}>
              Paper hands
            </Head>
            <div style={{ marginTop: 8, fontFamily: F.bodyItalic, fontSize: 22 }}>For selling $RBANK on the curve or a DEX.</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `6px double ${G.ink}` }}>
              <Head size={40}>Reward: nothing. Ever.</Head>
            </div>
          </div>
        </div>
        <Footer size={22} style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} />
      </div>
    </Stock>
  );
}

/** A few made-up wallets for the lineup, with the aliases the site would print. */
const LINEUP: { name: string; t: Traits; x?: boolean }[] = [
  { name: "Silent Sal", t: [0, 2, 0, 0] },
  { name: "Two-Bag Tony", t: [1, 4, 3, 3] },
  { name: "Velvet Mae", t: [4, 1, 1, 5] },
  { name: "Lefty Lou", t: [3, 3, 2, 4] },
  { name: "No-Sell Lola", t: [2, 0, 4, 2] },
  { name: "Iron Gus", t: [1, 2, 5, 1] },
  { name: "Lucky Ruby", t: [4, 4, 4, 0] },
  { name: "Cold Fats", t: [0, 1, 3, 5] },
];

/** Post 3: every wallet gets a name and a face. */
export function GZPostMugshots() {
  return (
    <Stock>
      <div style={{ position: "absolute", inset: "34px 70px 40px" }}>
        <Dateline left="The Robin Heist Gazette" mid="Crew affairs" right="Page 4" size={17} />
        <div style={{ display: "flex", gap: 56, marginTop: 30 }}>
          <div style={{ width: 600 }}>
            <Head size={150}>Get your mugshot.</Head>
            <div style={{ marginTop: 22, fontFamily: F.body, fontSize: 31, lineHeight: 1.4 }}>Every wallet in the vault prints with a gang alias and a mugshot, even if it bought somewhere else.</div>
            <div style={{ marginTop: 22, display: "grid", gap: 12, fontFamily: F.data, fontWeight: 700, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <div>① Connect your wallet on the site</div>
              <div>② Build your mugshot, pick a nickname</div>
              <div>③ Or link your X: handle, picture, badge</div>
            </div>
            <div style={{ marginTop: 18, fontFamily: F.wire, fontSize: 21, color: G.inkFaint }}>One free signature. No transaction, no gas.</div>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, alignContent: "start" }}>
            {LINEUP.map((m) => (
              <div key={m.name} style={{ textAlign: "center" }}>
                <Mugshot traits={m.t} size={178} />
                <div style={{ marginTop: 8, fontFamily: F.head, fontSize: 30, lineHeight: 1, textTransform: "uppercase" }}>{m.name}</div>
              </div>
            ))}
          </div>
        </div>
        <Footer size={22} style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} />
      </div>
    </Stock>
  );
}

/* ─────────────────────────── GIF: the snitch stamp ─────────────────────────── */

export const GIF_LENGTH = 105;

/** 720 × 720 loop: the notice prints, then NO CUT. EVER. slams across it. */
export function GZGif() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = (at: number) => spring({ frame: frame - at, fps, config: { damping: 16, mass: 0.6 } });
  const slam = spring({ frame: frame - 42, fps, config: { damping: 11, stiffness: 180 } });
  const shake = frame >= 46 && frame < 54 ? Math.sin(frame * 3.1) * 5 : 0;
  // Fade back to the plain page so the loop seam is invisible.
  const out = interpolate(frame, [GIF_LENGTH - 12, GIF_LENGTH - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stock style={{ transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <div style={{ position: "absolute", inset: "28px 36px", opacity: out }}>
        <Dateline left="Robin Heist Gazette" right="$RBANK" size={16} />
        <div style={{ transform: `translateY(${(1 - line(2)) * -60}px)`, opacity: line(2) }}>
          <Extra word="Notice" size={30} style={{ marginTop: 16 }} />
        </div>
        <div style={{ marginTop: 34 }}>
          {["Sell once,", "you're", "a snitch."].map((w, i) => (
            <div key={w} style={{ transform: `scale(${1.25 - 0.25 * line(10 + i * 7)})`, transformOrigin: "0% 60%", opacity: line(10 + i * 7) }}>
              <Head size={140}>{w}</Head>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <Footer size={17} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", opacity: out * Math.min(1, slam * 1.4) }}>
        <Stamp size={72} rotate={-5} style={{ transform: `rotate(-5deg) scale(${interpolate(slam, [0, 1], [2.6, 1])})`, background: "rgba(222,220,213,0.86)" }}>
          No cut. Ever.
        </Stamp>
      </div>
    </Stock>
  );
}

/* ─────────────────────────── demo video, 1920 × 1080 ─────────────────────────── */

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Fades a scene in and out at its own edges. */
function useScene(len: number) {
  const f = useCurrentFrame();
  return { f, o: interpolate(f, [0, 8, len - 8, len], [0, 1, 1, 0], clamp) };
}

function SceneIntro({ len }: { len: number }) {
  const { f, o } = useScene(len);
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f - 2, fps, config: { damping: 18 } });
  const head = spring({ frame: f - 18, fps, config: { damping: 14, mass: 0.7 } });
  const robin = spring({ frame: f - 30, fps, config: { damping: 15 } });
  return (
    <Stock style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 110, right: 110, top: 54 }}>
        <Dateline left="Vol. I, No. 1" mid="Robinhood Chain edition" right="Price: 0.01 ETH" size={20} />
        <div style={{ textAlign: "center", marginTop: 10, transform: `translateY(${(1 - drop) * -140}px)` }}>
          <Masthead size={120} />
        </div>
        <Rule double style={{ marginTop: 8, transform: `scaleX(${drop})`, transformOrigin: "0 50%" }} />
        <div style={{ transform: `translateY(${(1 - drop) * -40}px)`, opacity: drop }}>
          <Extra word="The split" size={36} style={{ marginTop: 16 }} />
        </div>
        <div style={{ display: "flex", gap: 60, marginTop: 40, alignItems: "flex-start" }}>
          <div style={{ flex: 1, transform: `scale(${1.2 - 0.2 * head})`, transformOrigin: "0% 60%", opacity: head, filter: `blur(${(1 - head) * 8}px)` }}>
            <Head size={230}>
              Robin hits
              <br />
              the vault.
            </Head>
            <div style={{ marginTop: 26, fontFamily: F.bodyItalic, fontSize: 40, color: G.inkSoft }}>A memecoin that robs every trade and pays the crew in ETH.</div>
          </div>
          <div style={{ transform: `translateY(${(1 - robin) * 80}px) rotate(${(1 - robin) * 4}deg)`, opacity: robin }}>
            <HalftoneRobin size={470} blink={f > 70 && f < 76 ? 1 : 0} />
          </div>
        </div>
      </div>
    </Stock>
  );
}

function ScenePlan({ len }: { len: number }) {
  const { f, o } = useScene(len);
  const { fps } = useVideoConfig();
  const p = (i: number) => spring({ frame: f - 16 - i * 14, fps, config: { damping: 16 } });
  const bar = interpolate(f, [80, 110], [0, 1], { ...clamp, easing: ease });
  return (
    <Stock style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 110, right: 110, top: 70 }}>
        <Dateline left="The Robin Heist Gazette" mid="Crime desk" right="Page 2" size={20} />
        <Head size={170} style={{ marginTop: 34 }}>
          How the heist runs
        </Head>
        <div style={{ marginTop: 14, fontFamily: F.bodyItalic, fontSize: 38, color: G.inkSoft }}>Every trade drops loot. Robin spends it in three jobs, always in this order.</div>
        <div style={{ display: "flex", gap: 18, marginTop: 50 }}>
          {PLAN.map((_, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i ? (
                <div style={{ display: "flex", opacity: p(i) }}>
                  <Arrow size={70} />
                </div>
              ) : null}
              <PlanPanel i={i} size={46} style={{ transform: `translateY(${(1 - p(i)) * 70}px)`, opacity: p(i) }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26, opacity: bar }}>
          <TakeBar size={44} grow={bar} />
        </div>
      </div>
    </Stock>
  );
}

/** A real page of the site in a browser window, scrolled and zoomed slowly. */
function SceneSite({ len, src, srcH, title, deck, from = 0, to = 0, zoom = [1, 1.06], originX = 50 }: { len: number; src: string; srcH: number; title: string; deck: string; from?: number; to?: number; zoom?: [number, number]; originX?: number }) {
  const { f, o } = useScene(len);
  const { fps } = useVideoConfig();
  const t = interpolate(f, [10, len - 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const enter = spring({ frame: f, fps, config: { damping: 18 } });
  const W = 1240;
  const scale = W / 1920;
  // The window is as tall as the page shot allows, and never scrolls past its end.
  const viewH = Math.min(720, Math.round(srcH * scale));
  const maxY = Math.max(0, srcH - viewH / scale);
  const y = interpolate(t, [0, 1], [Math.min(from, maxY), Math.min(to, maxY)]);
  const top = Math.round((1080 - 46 - viewH) / 2);
  return (
    <Stock style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 90, top: 120, width: 470 }}>
        <Head size={44} color={G.red}>
          On {SITE}
        </Head>
        <Head size={118} style={{ marginTop: 14 }}>
          {title}
        </Head>
        <div style={{ marginTop: 22, fontFamily: F.body, fontSize: 34, lineHeight: 1.38 }}>{deck}</div>
      </div>
      <div style={{ position: "absolute", left: 600, top, width: W, transform: `translateX(${(1 - enter) * 160}px)`, opacity: enter, boxShadow: "0 30px 60px -30px rgba(30,26,20,.7)", border: `2px solid ${G.ink}`, background: G.paperLift }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 16px", borderBottom: `2px solid ${G.ink}`, background: G.paperDeep }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${G.ink}` }} />
          ))}
          <span style={{ marginLeft: 16, padding: "4px 16px", background: G.paperLift, border: `1.5px solid ${G.ink}`, fontFamily: F.wire, fontSize: 19 }}>https://{SITE}</span>
          <span style={{ marginLeft: "auto", fontFamily: F.wire, fontSize: 16, color: G.inkFaint }}>preview · example numbers</span>
        </div>
        <div style={{ position: "relative", height: viewH, overflow: "hidden" }}>
          <Img
            src={staticFile(src)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: srcH * scale,
              transform: `translateY(${-y * scale}px) scale(${interpolate(t, [0, 1], zoom)})`,
              transformOrigin: `${originX}% ${((y + viewH / scale / 2) / srcH) * 100}%`,
            }}
          />
        </div>
      </div>
    </Stock>
  );
}

function SceneRule({ len }: { len: number }) {
  const { f, o } = useScene(len);
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 15 } });
  const s = spring({ frame: f - 34, fps, config: { damping: 10, stiffness: 190 } });
  const shake = f >= 37 && f < 46 ? Math.sin(f * 3) * 7 : 0;
  return (
    <Stock style={{ opacity: o, transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <div style={{ position: "absolute", left: 110, right: 110, top: 150, textAlign: "center" }}>
        <Head size={70} color={G.red} style={{ opacity: a }}>
          The only rule
        </Head>
        <Head size={215} style={{ marginTop: 26, whiteSpace: "nowrap", transform: `scale(${1.15 - 0.15 * a})`, opacity: a }}>
          Sell once = snitch.
        </Head>
        <div style={{ marginTop: 30, fontFamily: F.body, fontSize: 40, opacity: a }}>Out of the crew for good. Wallet to wallet is fine.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: Math.min(1, s * 1.5) }}>
        <Stamp size={150} rotate={-7} style={{ transform: `rotate(-7deg) scale(${interpolate(s, [0, 1], [2.4, 1])})`, background: "rgba(222,220,213,0.85)" }}>
          No cut. Ever.
        </Stamp>
      </div>
    </Stock>
  );
}

function SceneEnd({ len }: { len: number }) {
  const { f, o } = useScene(len);
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 16 } });
  const g = interpolate(f, [30, 46, 70, 86], [0, 1, 1, 0], clamp);
  return (
    <Stock style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 120, top: 150, width: 980, opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}>
        <Masthead size={78} />
        <Head size={260} style={{ marginTop: 26 }}>
          Still holding.
        </Head>
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 20, fontFamily: F.data, fontWeight: 700, fontSize: 40, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          <Ticker size={46} /> on Pons · Robinhood Chain
        </div>
        <div style={{ marginTop: 40, display: "inline-block", padding: "18px 34px", background: G.red, color: G.redInk, border: `3px solid ${G.ink}`, fontFamily: F.data, fontWeight: 700, fontSize: 46, letterSpacing: "0.06em" }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 190, transform: `translateY(${(1 - a) * 80}px)`, opacity: a }}>
        <HalftoneRobin size={560} grab={g} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, bottom: 54, fontFamily: F.wire, fontSize: 22, color: G.inkFaint }}>Not a security. Not a dividend. A raccoon with a spreadsheet.</div>
    </Stock>
  );
}

const DEMO_PLAN: [number, (p: { len: number }) => ReactNode][] = [
  [110, (p) => <SceneIntro {...p} />],
  [150, (p) => <ScenePlan {...p} />],
  [150, (p) => <SceneSite {...p} src="gz/front.png" srcH={1120} title="The front page" deck="Live loot, the last heist and the crew count, on one screen." from={0} to={60} zoom={[1, 1.08]} originX={30} />],
  [165, (p) => <SceneSite {...p} src="gz/vault.png" srcH={868} title="The vault" deck="Ranked by bag. The top 10 get every split, paid in ETH." from={0} to={250} zoom={[1, 1.04]} originX={20} />],
  [165, (p) => <SceneSite {...p} src="gz/card.png" srcH={982} title="Your crew card" deck="Connect your wallet, build a mugshot, pick a nickname. Or link your X." from={60} to={300} zoom={[1, 1.2]} originX={85} />],
  [135, (p) => <SceneSite {...p} src="gz/blotter.png" srcH={693} title="The blotter" deck="Every heist printed with its transaction. No tx, didn't happen." from={0} to={60} zoom={[1, 1.05]} />],
  [120, (p) => <SceneRule {...p} />],
  [120, (p) => <SceneEnd {...p} />],
];
export const GZ_DEMO_LENGTH = DEMO_PLAN.reduce((n, [len]) => n + len, 0);

export function GZDemo() {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: G.paper }}>
      {DEMO_PLAN.map(([len, scene], i) => {
        const from = at;
        at += len;
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            {scene({ len })}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

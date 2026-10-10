/**
 * "Put your name in orbit": how a holder gets a name and portrait, or links X, on thehorizon.fun.
 * Built from real screenshots of the site (illustration edition). Wallet and X prompts are drawn
 * as plain generic dialogs, never as a real brand's UI.
 */
import type React from "react";
import type { ReactNode } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Body, Caps, Coin, H, HF, Head, Plate, Sig, clamp, ease, easeInOut, ramp } from "./HZTheme";
import RECTS from "../public/hz/tut/rects.json";

type Box = [number, number, number, number];
const R = RECTS as unknown as Record<string, Record<string, Box | null>>;
const box = (shot: string, key: string): Box => (R[shot]?.[key] as Box) ?? [860, 440, 200, 200];
const mid = (b: Box): [number, number] => [b[0] + b[2] / 2, b[1] + b[3] / 2];

const WIN = { x: 200, y: 214, w: 1520, h: 855 };
const BAR = 40;
const VIEW = { w: WIN.w, h: WIN.h - BAR };
const BASE = VIEW.w / 1920;

/** Camera: zoom z at point p (screenshot px), kept inside the page. */
function project(z: number, p: [number, number]) {
  const s = BASE * z;
  const tx = Math.min(0, Math.max(VIEW.w - 1920 * s, VIEW.w / 2 - p[0] * s));
  const ty = Math.min(0, Math.max(VIEW.h - 1080 * s, VIEW.h / 2 - p[1] * s));
  return { s, tx, ty, pt: (q: [number, number]) => [tx + q[0] * s, ty + q[1] * s] as [number, number] };
}

function Cursor({ x, y, down }: { x: number; y: number; down: number }) {
  return (
    <svg width={44} height={44} viewBox="0 0 24 24" style={{ position: "absolute", left: x - 6, top: y - 3, transform: `scale(${1 - down * 0.12})`, transformOrigin: "6px 3px", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.5))" }}>
      <path d="M5 2 L5 19 L9.5 15 L12.5 21.5 L15 20.4 L12.1 14 L18 14 Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

interface StepProps {
  n: number;
  title: string;
  sub: string;
  shots: [number, string][];
  focus: Box;
  zoom?: number;
  click?: number;
  ring?: Box;
  dialog?: { at: number; node: ReactNode };
  len: number;
}

/** One step: the page in a browser window, the camera leans in, the cursor clicks the thing. */
function Step({ n, title, sub, shots, focus, zoom = 1.7, click = 62, ring, dialog, len }: StepProps) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zin = easeInOut(ramp(f, 8, 44));
  const z = 1 + (zoom - 1) * zin;
  const centre = mid(focus);
  const p: [number, number] = [960 + (centre[0] - 960) * zin, 540 + (centre[1] - 540) * zin];
  const { s, tx, ty, pt } = project(z, p);
  const target = pt(centre);
  const mv = easeInOut(ramp(f, 24, click - 4));
  const cx = interpolate(mv, [0, 1], [VIEW.w * 0.9, target[0]]);
  const cy = interpolate(mv, [0, 1], [VIEW.h * 0.95, target[1]]);
  const down = ramp(f, click - 3, click) - ramp(f, click + 3, click + 8);
  const ripple = ramp(f, click, click + 18);
  const rb = ring ?? focus;
  const [rx, ry] = pt([rb[0], rb[1]]);
  const ringOn = ramp(f, 30, 44) * (1 - ramp(f, click + 30, click + 44));
  const head = spring({ frame: f, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ opacity: 1 }}>
      <Plate src="hz/plate-hero.png" dark={0.86} />
      <div style={{ position: "absolute", left: WIN.x, right: 1920 - WIN.x - WIN.w, top: 46, display: "flex", alignItems: "center", gap: 30, opacity: head, transform: `translateY(${(1 - head) * -20}px)` }}>
        <div style={{ flex: "none", width: 112, height: 112, borderRadius: "50%", display: "grid", placeItems: "center", border: `2px solid ${H.gold2}`, boxShadow: `inset 0 0 0 6px ${H.v0}, inset 0 0 0 7px ${H.gold}`, fontFamily: HF.caps, fontWeight: 700, fontSize: 48, color: H.gold2 }}>{n}</div>
        <div>
          <Head size={64}>{title}</Head>
          <Body size={30} italic style={{ marginTop: 6 }}>{sub}</Body>
        </div>
      </div>
      <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, overflow: "hidden", boxShadow: "0 50px 100px -30px rgba(0,0,0,0.95), 0 0 0 1px rgba(243,243,239,0.45)", background: H.v0 }}>
        <div style={{ height: BAR, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", background: "#141418" }}>
          {["#e0645a", "#e6b94e", "#5fbf6a"].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
          <div style={{ marginLeft: 18, flex: 1, height: 26, borderRadius: 13, background: "#0a0a0c", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: HF.data, fontSize: 17, color: "#c9cfdb" }}>🔒 thehorizon.fun</div>
        </div>
        <div style={{ position: "relative", width: VIEW.w, height: VIEW.h, overflow: "hidden" }}>
          {shots.map(([at, src], i) => (
            <Img key={src} src={staticFile(src)} style={{ position: "absolute", left: tx, top: ty, width: 1920 * s, height: 1080 * s, opacity: i === 0 ? 1 : ramp(f, at, at + 10) }} />
          ))}
          <div style={{ position: "absolute", left: rx - 8, top: ry - 8, width: rb[2] * s + 16, height: rb[3] * s + 16, borderRadius: 10, border: `4px solid ${H.gold2}`, boxShadow: `0 0 0 9999px rgba(5,5,6,${0.42 * ringOn}), 0 0 30px rgba(255,107,26,0.8)`, opacity: ringOn }} />
          {ripple > 0 && ripple < 1 ? <div style={{ position: "absolute", left: target[0] - 40 * ripple, top: target[1] - 40 * ripple, width: 80 * ripple, height: 80 * ripple, borderRadius: "50%", border: `3px solid ${H.gold2}`, opacity: 1 - ripple }} /> : null}
          {dialog && f >= dialog.at ? <Dialog at={dialog.at}>{dialog.node}</Dialog> : null}
          <Cursor x={cx} y={cy} down={down} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** A plain, unbranded browser-extension style prompt. */
function Dialog({ at, children }: { at: number; children: ReactNode }) {
  const f = useCurrentFrame();
  const t = ease(ramp(f, at, at + 12));
  return (
    <div style={{ position: "absolute", right: 40, top: 20, width: 470, borderRadius: 16, background: "#f7f7f9", color: "#16181d", boxShadow: "0 30px 70px rgba(0,0,0,0.6)", padding: "26px 28px", opacity: t, transform: `translateY(${(1 - t) * -16}px)`, fontFamily: HF.data }}>
      {children}
    </div>
  );
}

function DialogBody({ title, lines, button }: { title: string; lines: string[]; button: string }) {
  return (
    <>
      <div style={{ fontSize: 16, color: "#6b7080", letterSpacing: "0.04em" }}>Your wallet</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{title}</div>
      <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 10, background: "#eceef3", fontSize: 19, lineHeight: 1.45 }}>
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRadius: 24, border: "1.5px solid #c8ccd6", fontSize: 19, fontWeight: 600 }}>Cancel</div>
        <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRadius: 24, background: "#16161b", color: "#fff", fontSize: 19, fontWeight: 600 }}>{button}</div>
      </div>
    </>
  );
}

function Opening({ len }: { len: number }) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 1 }}>
      <Plate src="hz/plate-hero.png" dark={0.6} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
        <Caps size={26} style={{ opacity: ramp(f, 0, 14) }}>Tutorial · two minutes</Caps>
        <Head size={120} style={{ textAlign: "center", opacity: ramp(f, 6, 22) }}>Put your name in orbit.</Head>
        <Body size={40} italic color={H.gold2} style={{ textAlign: "center", opacity: ramp(f, 18, 34) }}>
          A name and a portrait, or your X profile, on your orbit card and on the orbit.
        </Body>
      </AbsoluteFill>
      <Sig style={{ left: 60, bottom: 50 }} />
    </AbsoluteFill>
  );
}

function Closing() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Plate src="hz/plate-hero.png" dark={0.68} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26 }}>
        <Coin size={300} turn={f * 0.07} id="tutend" />
        <Head size={104} style={{ textAlign: "center", opacity: ramp(f, 4, 18) }}>
          Free to sign. <span style={{ fontFamily: HF.displayItalic, color: H.gold2 }}>Moves no funds.</span>
        </Head>
        <Body size={34} style={{ textAlign: "center", opacity: ramp(f, 14, 28) }}>
          Your wallet signs a message, never a payment. Hold 100,000 $VOID to enter orbit.
        </Body>
        <div style={{ fontFamily: HF.serif, fontSize: 44, color: H.text, opacity: ramp(f, 24, 38) }}>thehorizon.fun</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const T = "hz/tut/";
const STEPS: [number, (p: { len: number }) => React.ReactElement][] = [
  [120, Opening],
  [150, ({ len }) => <Step len={len} n={1} title="Open thehorizon.fun and press Connect." sub="Use the wallet that holds your $VOID." shots={[[0, `${T}t1-front.png`]]} focus={box("t1-front", "connect")} zoom={2.2} />],
  [150, ({ len }) => <Step len={len} n={2} title="Your card opens." sub="Press “Set your name or connect X”." shots={[[0, `${T}t2-card.png`]]} focus={box("t2-card", "open")} zoom={1.8} />],
  [
    170,
    ({ len }) => (
      <Step
        len={len}
        n={3}
        title="Connect this wallet."
        sub="Your wallet only shares its address."
        shots={[[0, `${T}t3-desk.png`]]}
        focus={box("t3-desk", "connect")}
        zoom={1.9}
        dialog={{ at: 72, node: <DialogBody title="Connect to thehorizon.fun?" lines={["Share your address with this site.", "No funds move, nothing is spent."]} button="Connect" /> }}
      />
    ),
  ],
  [170, ({ len }) => <Step len={len} n={4} title="Pick your portrait." sub="Turn the dials: skin, hair, tie, backdrop." shots={[[0, `${T}t4-booth.png`], [80, `${T}t5-booth2.png`]]} focus={box("t4-booth", "dials")} ring={box("t4-booth", "dials")} zoom={1.7} click={70} />],
  [
    190,
    ({ len }) => (
      <Step
        len={len}
        n={5}
        title="Type a name, then Sign & stamp."
        sub="3 to 18 letters or numbers."
        shots={[[0, `${T}t6-name.png`]]}
        focus={box("t6-name", "sign")}
        ring={box("t6-name", "input")}
        zoom={1.8}
        click={76}
        dialog={{ at: 86, node: <DialogBody title="Signature request" lines={["thehorizon.fun asks you to sign:", "“Horizon name: Event Horizon”", "Free. This is not a transaction."]} button="Sign" /> }}
      />
    ),
  ],
  [150, ({ len }) => <Step len={len} n={6} title="On your orbit card." sub="Your name and portrait, for every visitor to see." shots={[[0, `${T}t7-printed.png`]]} focus={box("t7-printed", "card")} zoom={1.45} click={999} />],
  [150, ({ len }) => <Step len={len} n={7} title="And in the orbit." sub="Your orbit, your mass, and how far you are from the ten closest." shots={[[0, `${T}t8-heirs.png`]]} focus={box("t8-heirs", "row")} zoom={2.1} click={999} />],
  [
    190,
    ({ len }) => (
      <Step
        len={len}
        n={8}
        title="Or show your X instead."
        sub="Open the Connect X tab, then Sign & connect X."
        shots={[[0, `${T}t9-xtab.png`]]}
        focus={box("t9-xtab", "xbtn")}
        zoom={1.9}
        click={70}
        dialog={{ at: 80, node: <DialogBody title="Authorize the app on X?" lines={["Read your name, handle and picture.", "It can't post or read your DMs."]} button="Authorize" /> }}
      />
    ),
  ],
  [160, ({ len }) => <Step len={len} n={9} title="Your X is on the card." sub="Handle, picture and badge come from X. The logo opens your profile." shots={[[0, `${T}t10-xlinked.png`]]} focus={box("t10-xlinked", "card")} zoom={1.45} click={999} />],
  [150, Closing as (p: { len: number }) => React.ReactElement],
];
// Scenes overlap by XF frames and cross-dissolve, so there is never a dip to black between them.
const XF = 14;
export const HZ_TUTORIAL_LENGTH = STEPS.reduce((t, [n]) => t + n, 0) - XF * (STEPS.length - 1);

/** Fades a scene in over its first XF frames (its own fade-out covers the end). */
function FadeScene({ children, first }: { children: React.ReactNode; first: boolean }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: first ? 1 : Math.min(1, f / XF) }}>{children}</AbsoluteFill>;
}

export function HZTutorial() {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: H.v0 }}>
      {STEPS.map(([len, Scene], i) => {
        const from = at;
        at += len - XF;
        return (
          <Sequence key={i} from={from} durationInFrames={len} premountFor={30}>
            <FadeScene first={i === 0}>
              <Scene len={len} />
            </FadeScene>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export { clamp };

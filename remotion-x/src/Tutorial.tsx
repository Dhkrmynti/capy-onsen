/**
 * "Get your name in the vault": a step-by-step how-to built from real screenshots of
 * robinheist.cloud. A camera zooms to the control being explained, a cursor clicks it.
 * Wallet and X prompts are drawn as plain generic dialogs, never as a real brand's UI.
 */
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Dateline, F, G, HalftoneRobin, Head, Masthead, Stock, Ticker } from "./Gazette";
import RECTS from "../public/tut/rects.json";

const SITE = "robinheist.cloud";
type Box = [number, number, number, number];
const R = RECTS as unknown as Record<string, Record<string, Box>>;
const mid = (b: Box): [number, number] => [b[0] + b[2] / 2, b[1] + b[3] / 2];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.inOut(Easing.cubic);

/* ─────────────── frame: step banner + browser window ─────────────── */

const WIN = { x: 160, y: 196, w: 1600, h: 846 }; // window incl. its 44px address bar
const BAR = 44;
const VIEW = { w: WIN.w, h: WIN.h - BAR };
const BASE = WIN.w / 1920; // screenshot px → window px at zoom 1

function StepBanner({ n, title, sub }: { n: string; title: string; sub?: string }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", left: WIN.x, right: 1920 - WIN.x - WIN.w, top: 34, display: "flex", alignItems: "center", gap: 28, opacity: a, transform: `translateY(${(1 - a) * -24}px)` }}>
      <div style={{ flex: "none", width: 112, height: 112, display: "grid", placeItems: "center", background: G.red, color: G.redInk, border: `3px solid ${G.ink}`, fontFamily: F.head, fontSize: n.length > 2 ? 46 : 84, lineHeight: 1 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <Head size={76}>{title}</Head>
        {sub ? <div style={{ marginTop: 8, fontFamily: F.bodyItalic, fontSize: 30, color: G.inkSoft }}>{sub}</div> : null}
      </div>
    </div>
  );
}

/** Where the camera looks: a zoom and a point (in screenshot px) to keep centred. */
interface Cam {
  z: number;
  at: [number, number];
}

function camAt(f: number, keys: [number, Cam][]): Cam {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, c1] = keys[i];
    const [t0, c0] = keys[i - 1];
    if (f <= t1) {
      const k = smooth((f - t0) / Math.max(1, t1 - t0));
      return { z: c0.z + (c1.z - c0.z) * k, at: [c0.at[0] + (c1.at[0] - c0.at[0]) * k, c0.at[1] + (c1.at[1] - c0.at[1]) * k] };
    }
  }
  return keys[keys.length - 1][1];
}

/** Maps a screenshot point to window coordinates for a camera, keeping the page edge-to-edge. */
function project(c: Cam) {
  const s = BASE * c.z;
  const tx = Math.min(0, Math.max(VIEW.w - 1920 * s, VIEW.w / 2 - c.at[0] * s));
  const ty = Math.min(0, Math.max(VIEW.h - 1080 * s, VIEW.h / 2 - c.at[1] * s));
  return { s, tx, ty, pt: (p: [number, number]) => [tx + p[0] * s, ty + p[1] * s] as [number, number] };
}

interface Click {
  at: number;
  p: [number, number];
}

/** The page in a browser window, filmed by a camera, with a cursor that clicks things. */
function Browser({ shots, cam, cursor, clicks = [], ring, dim = 0, children }: { shots: [number, string][]; cam: [number, Cam][]; cursor?: [number, [number, number]][]; clicks?: Click[]; ring?: { from: number; to: number; box: Box }; dim?: number; children?: ReactNode }) {
  const f = useCurrentFrame();
  const c = camAt(f, cam);
  const { s, tx, ty, pt } = project(c);
  // crossfade between screenshots at their start frames
  const layers = shots.map(([at, src], i) => {
    const next = shots[i + 1]?.[0];
    const o = i === 0 ? 1 : interpolate(f, [at, at + 8], [0, 1], clamp);
    const gone = next !== undefined && f >= next + 8;
    return gone ? null : <Img key={src} src={staticFile(src)} style={{ position: "absolute", left: tx, top: ty, width: 1920 * s, height: 1080 * s, opacity: o }} />;
  });
  // cursor path between keyed points (screenshot px)
  let cur: [number, number] | null = null;
  if (cursor?.length) {
    const k = cursor;
    if (f <= k[0][0]) cur = k[0][1];
    else {
      cur = k[k.length - 1][1];
      for (let i = 1; i < k.length; i++)
        if (f <= k[i][0]) {
          const e = smooth((f - k[i - 1][0]) / Math.max(1, k[i][0] - k[i - 1][0]));
          cur = [k[i - 1][1][0] + (k[i][1][0] - k[i - 1][1][0]) * e, k[i - 1][1][1] + (k[i][1][1] - k[i - 1][1][1]) * e];
          break;
        }
    }
  }
  const press = clicks.some((cl) => f >= cl.at && f < cl.at + 5);
  return (
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, border: `2px solid ${G.ink}`, background: G.paperLift, boxShadow: "0 30px 60px -30px rgba(30,26,20,.7)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: BAR, padding: "0 16px", borderBottom: `2px solid ${G.ink}`, background: G.paperDeep }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${G.ink}` }} />
        ))}
        <span style={{ marginLeft: 16, padding: "4px 16px", background: G.paperLift, border: `1.5px solid ${G.ink}`, fontFamily: F.wire, fontSize: 19 }}>https://{SITE}</span>
        <span style={{ marginLeft: "auto", fontFamily: F.wire, fontSize: 16, color: G.inkFaint }}>preview · example numbers</span>
      </div>
      <div style={{ position: "relative", width: VIEW.w, height: VIEW.h, overflow: "hidden" }}>
        {layers}
        {ring && f >= ring.from && f <= ring.to
          ? (() => {
              const [x, y] = pt([ring.box[0], ring.box[1]]);
              const pulse = 0.5 + 0.5 * Math.sin((f - ring.from) / 4);
              return <div style={{ position: "absolute", left: x - 10, top: y - 10, width: ring.box[2] * s + 20, height: ring.box[3] * s + 20, border: `5px solid ${G.red}`, borderRadius: 10, boxShadow: `0 0 0 ${6 + pulse * 10}px rgba(200,36,27,${0.25 - pulse * 0.15})`, opacity: interpolate(f, [ring.from, ring.from + 6], [0, 1], clamp) }} />;
            })()
          : null}
        {clicks.map((cl, i) => {
          const t = f - cl.at;
          if (t < 0 || t > 16) return null;
          const [x, y] = pt(cl.p);
          const r = 16 + t * 4;
          return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `4px solid ${G.red}`, opacity: 1 - t / 16 }} />;
        })}
        {dim ? <div style={{ position: "absolute", inset: 0, background: `rgba(22,21,20,${dim})` }} /> : null}
        {cur
          ? (() => {
              const [x, y] = pt(cur);
              return (
                <svg viewBox="0 0 24 24" style={{ position: "absolute", left: x - 4, top: y - 3, width: 46, height: 46, transform: `scale(${press ? 0.85 : 1})`, transformOrigin: "4px 3px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.35))" }}>
                  <path d="M4 3 L4 20 L8.6 15.6 L11.6 22 L14.6 20.6 L11.7 14.4 L18 14.4 Z" fill="#ffffff" stroke={G.ink} strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              );
            })()
          : null}
        {children}
      </div>
    </div>
  );
}

/** A plain, brand-free wallet prompt. */
function WalletPrompt({ title, lines, button, pressAt, appear = 0 }: { title: string; lines: ReactNode[]; button: string; pressAt: number; appear?: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - appear, fps, config: { damping: 15 } });
  const pressed = f >= pressAt && f < pressAt + 6;
  return (
    <div style={{ position: "absolute", right: 70, top: 60, width: 560, padding: "26px 28px 24px", background: "#ffffff", color: "#1b1d22", borderRadius: 18, border: "2px solid #1b1d22", boxShadow: "0 30px 60px -20px rgba(0,0,0,.55)", fontFamily: F.data, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#5b6070", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: "#1b1d22", display: "grid", placeItems: "center", color: "#fff", fontSize: 20 }}>⛁</span>
        Your wallet
      </div>
      <div style={{ marginTop: 18, fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
      <div style={{ marginTop: 14, display: "grid", gap: 8, fontSize: 24, lineHeight: 1.35, color: "#3c404b" }}>{lines}</div>
      <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
        <div style={{ flex: 1, padding: "16px 0", textAlign: "center", border: "2px solid #c9ccd4", borderRadius: 12, fontSize: 24, fontWeight: 700, color: "#5b6070" }}>Cancel</div>
        <div style={{ flex: 1, padding: "16px 0", textAlign: "center", background: pressed ? "#000" : "#1b1d22", color: "#fff", borderRadius: 12, fontSize: 24, fontWeight: 700, transform: `scale(${pressed ? 0.96 : 1})` }}>{button}</div>
      </div>
    </div>
  );
}

const Mono = ({ children }: { children: ReactNode }) => <div style={{ fontFamily: F.wire, fontSize: 21, background: "#f1f2f5", borderRadius: 10, padding: "12px 14px", lineHeight: 1.45, color: "#1b1d22" }}>{children}</div>;

/* ─────────────── scenes ─────────────── */

function Scene({ len, children }: { len: number; children: ReactNode }) {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, len - 8, len], [0, 1, 1, 0], clamp);
  return <Stock style={{ opacity: o }}>{children}</Stock>;
}

function SIntro({ len }: { len: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 15 } });
  const b = spring({ frame: f - 16, fps, config: { damping: 14, mass: 0.7 } });
  return (
    <Scene len={len}>
      <div style={{ position: "absolute", left: 120, right: 120, top: 70 }}>
        <Dateline left="The Robin Heist Gazette" mid="How-to desk" right="Special" size={20} />
        <div style={{ marginTop: 22, transform: `translateY(${(1 - a) * -60}px)`, opacity: a }}>
          <Masthead size={70} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 330, width: 1100, transform: `scale(${1.15 - 0.15 * b})`, transformOrigin: "0% 50%", opacity: b }}>
        <Head size={196}>
          Get your name
          <br />
          in the vault.
        </Head>
        <div style={{ marginTop: 26, fontFamily: F.bodyItalic, fontSize: 42, color: G.inkSoft }}>Nickname, mugshot or your X account, in a minute.</div>
      </div>
      <div style={{ position: "absolute", right: 130, top: 330, opacity: b }}>
        <HalftoneRobin size={470} blink={f > 60 && f < 66 ? 1 : 0} />
      </div>
    </Scene>
  );
}

function SConnect({ len }: { len: number }) {
  const btn = R["t1-front"].connect;
  const p = mid(btn);
  return (
    <Scene len={len}>
      <StepBanner n="1" title={`Open ${SITE}`} sub="Use a browser with your wallet: MetaMask, Rabby, OKX or a wallet's in-app browser." />
      <Browser
        shots={[[0, "tut/t1-front.png"]]}
        cam={[
          [0, { z: 1, at: [960, 540] }],
          [40, { z: 1, at: [960, 540] }],
          [80, { z: 2.4, at: p }],
        ]}
        cursor={[
          [0, [900, 700]],
          [50, [900, 700]],
          [86, p],
        ]}
        clicks={[{ at: 92, p }]}
        ring={{ from: 70, to: len, box: btn }}
      />
    </Scene>
  );
}

function SApprove({ len }: { len: number }) {
  return (
    <Scene len={len}>
      <StepBanner n="2" title="Approve the connection" sub="Your wallet only shares its address. Nothing is sent, nothing is spent." />
      <Browser shots={[[0, "tut/t2-card.png"]]} cam={[[0, { z: 1.25, at: [1300, 400] }]]} dim={0.35}>
        <WalletPrompt
          appear={6}
          pressAt={len - 30}
          title={`${SITE} wants to connect`}
          lines={["It will see your wallet address.", <b key="b">It can't move your funds.</b>]}
          button="Connect"
        />
      </Browser>
    </Scene>
  );
}

function SBooth({ len }: { len: number }) {
  const hat = mid(R["t3-booth"].hatNext);
  const dials = R["t3-booth"].dials;
  const extra: [number, number] = [hat[0], hat[1] + 34];
  const bg: [number, number] = [hat[0], hat[1] + 68];
  return (
    <Scene len={len}>
      <StepBanner n="3" title="Build your mugshot" sub="Your crew card opens. Turn the dials: fur, hat, extra, backdrop." />
      <Browser
        shots={[
          [0, "tut/t3-booth.png"],
          [96, "tut/t4-booth2.png"],
        ]}
        cam={[
          [0, { z: 1, at: [1300, 450] }],
          [30, { z: 2.1, at: [1300, 445] }],
        ]}
        cursor={[
          [0, [1100, 700]],
          [40, hat],
          [70, extra],
          [100, bg],
          [len, bg],
        ]}
        clicks={[
          { at: 44, p: hat },
          { at: 56, p: hat },
          { at: 74, p: extra },
          { at: 86, p: extra },
          { at: 104, p: bg },
        ]}
        ring={{ from: 30, to: len, box: dials }}
      />
    </Scene>
  );
}

function SName({ len }: { len: number }) {
  const input = R["t5-name"].input;
  const sign = R["t5-name"].sign;
  return (
    <Scene len={len}>
      <StepBanner n="4" title="Pick a nickname" sub="3 to 18 letters or numbers. Then press Sign & print." />
      <Browser
        shots={[
          [0, "tut/t4-booth2.png"],
          [30, "tut/t5-name.png"],
        ]}
        cam={[
          [0, { z: 2.1, at: [1300, 445] }],
          [24, { z: 2.3, at: [1306, 570] }],
        ]}
        cursor={[
          [0, mid(input)],
          [70, mid(input)],
          [100, mid(sign)],
        ]}
        clicks={[
          { at: 12, p: mid(input) },
          { at: 106, p: mid(sign) },
        ]}
        ring={{ from: 24, to: 90, box: input }}
      />
    </Scene>
  );
}

function SSign({ len }: { len: number }) {
  return (
    <Scene len={len}>
      <StepBanner n="5" title="Sign the message" sub="One free signature. No gas, no transaction." />
      <Browser shots={[[0, "tut/t5-name.png"]]} cam={[[0, { z: 1.25, at: [1300, 500] }]]} dim={0.35}>
        <WalletPrompt
          appear={6}
          pressAt={len - 30}
          title="Signature request"
          lines={[
            <Mono key="m">
              Robin Heist: claim my byline
              <br />
              Nickname: Lucky Lou
              <br />
              This signature is free and moves no funds.
            </Mono>,
          ]}
          button="Sign"
        />
      </Browser>
    </Scene>
  );
}

function SPrinted({ len }: { len: number }) {
  const who = R["t6-printed"].who;
  const row = R["t7-vault"].row;
  const half = Math.round(len / 2);
  return (
    <Scene len={len}>
      <StepBanner n="6" title="You're printed" sub="Your name and mugshot go on your crew card and on the vault leaderboard." />
      <Browser
        shots={[
          [0, "tut/t6-printed.png"],
          [half, "tut/t7-vault.png"],
        ]}
        cam={printedCam(half, len, who, row)}
        ring={{ from: 24, to: half - 4, box: who }}
      />
      <RowRing box={row} keys={printedCam(half, len, who, row)} from={half + 34} />
    </Scene>
  );
}

/** Card close-up, a crossfade to the vault at the same camera, then a pan down to the row. */
function printedCam(half: number, len: number, who: Box, row: Box): [number, Cam][] {
  return [
    [0, { z: 1.4, at: [1307, 380] }],
    [30, { z: 2.2, at: mid(who) }],
    [half - 26, { z: 2.2, at: mid(who) }],
    // pull back to the whole sheet, swap pages there, then settle on the row
    [half - 2, { z: 1, at: [960, 540] }],
    [half + 10, { z: 1, at: [960, 540] }],
    [half + 34, { z: 1.25, at: [960, mid(row)[1]] }],
    [len, { z: 1.4, at: [700, mid(row)[1]] }],
  ];
}

/** A highlight on the vault row, drawn in window space with the scene's camera. */
function RowRing({ box, keys, from }: { box: Box; keys: [number, Cam][]; from: number }) {
  const f = useCurrentFrame();
  if (f < from) return null;
  const { s, pt } = project(camAt(f, keys));
  const [x, y] = pt([box[0], box[1]]);
  const o = interpolate(f, [from, from + 8], [0, 1], clamp);
  return <div style={{ position: "absolute", left: WIN.x + x - 8, top: WIN.y + BAR + y - 6, width: Math.min(VIEW.w - x, box[2] * s) + 16, height: box[3] * s + 12, border: `5px solid ${G.red}`, borderRadius: 8, opacity: o }} />;
}

function SX({ len }: { len: number }) {
  const btn = R["t8-xtab"].xbtn;
  const tab = R["t8-xtab"].tab;
  const who = R["t9-xlinked"].who;
  const at2 = 110;
  return (
    <Scene len={len}>
      <StepBanner n="Or" title="Link your X instead" sub="Your real handle, picture and badge, straight from X. A logo by your name opens your profile." />
      <Browser
        shots={[
          [0, "tut/t8-xtab.png"],
          [at2, "tut/t9-xlinked.png"],
        ]}
        cam={[
          [0, { z: 1.3, at: [1300, 500] }],
          [24, { z: 2.1, at: [1260, 450] }],
          [at2 - 26, { z: 2.1, at: [1260, 450] }],
          [at2 - 2, { z: 1, at: [960, 540] }],
          [at2 + 10, { z: 1, at: [960, 540] }],
          [at2 + 34, { z: 2.2, at: mid(who) }],
        ]}
        cursor={[
          [0, [1200, 700]],
          [30, mid(tab)],
          [60, mid(btn)],
          [at2 - 1, mid(btn)],
        ]}
        clicks={[
          { at: 34, p: mid(tab) },
          { at: 64, p: mid(btn) },
        ]}
        ring={{ from: at2 + 36, to: len, box: who }}
      >
        <Sequence from={70} durationInFrames={at2 - 70}>
          <XPrompt />
        </Sequence>
      </Browser>
    </Scene>
  );
}

/** A plain stand-in for the X sign-in step (not X's page). */
function XPrompt() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 15 } });
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(22,21,20,${0.5 * a})`, display: "grid", placeItems: "center" }}>
      <div style={{ width: 640, padding: "34px 36px", background: "#ffffff", borderRadius: 18, border: "2px solid #1b1d22", fontFamily: F.data, textAlign: "center", opacity: a, transform: `scale(${0.92 + 0.08 * a})` }}>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1 }}>𝕏</div>
        <div style={{ marginTop: 16, fontSize: 36, fontWeight: 700 }}>Sign in on X</div>
        <div style={{ marginTop: 10, fontSize: 25, color: "#3c404b", lineHeight: 1.4 }}>then tap “Authorize app”. Read-only: Robin Heist can't post or see your DMs.</div>
      </div>
    </div>
  );
}

function SEnd({ len }: { len: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 16 } });
  const rows: [string, string][] = [
    ["Hold $RBANK", "the booth opens for wallets holding it"],
    ["One free signature", "no gas, no transaction, funds never move"],
    ["Change it once a day", "nickname, mugshot or X, as often as daily"],
  ];
  return (
    <Scene len={len}>
      <div style={{ position: "absolute", left: 120, top: 110, width: 1080, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
        <Head size={64} color={G.red}>
          House rules
        </Head>
        <div style={{ marginTop: 26, display: "grid", gap: 22 }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "560px 1fr", alignItems: "baseline", gap: 26, paddingBottom: 18, borderBottom: `1.5px dashed ${G.inkFaint}`, opacity: interpolate(f, [8 + i * 8, 18 + i * 8], [0, 1], clamp) }}>
              <Head size={70} style={{ whiteSpace: "nowrap" }}>
                {k}
              </Head>
              <div style={{ fontFamily: F.body, fontSize: 32, color: G.inkSoft }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ padding: "18px 34px", background: G.red, color: G.redInk, border: `3px solid ${G.ink}`, fontFamily: F.data, fontWeight: 700, fontSize: 48, letterSpacing: "0.05em" }}>{SITE}</div>
          <Ticker size={46} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 210, opacity: a }}>
        <HalftoneRobin size={500} />
      </div>
    </Scene>
  );
}

const PLAN: [number, (p: { len: number }) => ReactNode][] = [
  [100, (p) => <SIntro {...p} />],
  [120, (p) => <SConnect {...p} />],
  [100, (p) => <SApprove {...p} />],
  [150, (p) => <SBooth {...p} />],
  [130, (p) => <SName {...p} />],
  [105, (p) => <SSign {...p} />],
  [170, (p) => <SPrinted {...p} />],
  [200, (p) => <SX {...p} />],
  [130, (p) => <SEnd {...p} />],
];
export const TUTORIAL_LENGTH = PLAN.reduce((n, [len]) => n + len, 0);

export function GZTutorial() {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: G.paper }}>
      {PLAN.map(([len, scene], i) => {
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


/** Hawking stills for X: avatar, header, posts, hooks, and the "New core" GIF. */
import type React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Body, Caps, Head, Mono, Placard, SITE, Sig, Stripe, Tape, Tri, V, VF, back, easeInOut, ramp } from "./HKTheme";
import { Mandatory, Prohibit, Safe, Warn } from "./HKSigns";
import { Mascot } from "./HKMascot";

/** The real render of the contained black hole from the site, framed on a point (px of the 1920x1080 plate). */
function Render({ src = "hk/plate-hero.png", cx = 1328, cy = 545, scale = 1, w, h, dark = 0 }: { src?: string; cx?: number; cy?: number; scale?: number; w: number; h: number; dark?: number }) {
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: V.void }}>
      <Img src={staticFile(src)} style={{ position: "absolute", width: 1920 * scale, height: 1080 * scale, left: w / 2 - cx * scale, top: h / 2 - cy * scale }} />
      {dark ? <AbsoluteFill style={{ background: V.void, opacity: dark }} /> : null}
    </AbsoluteFill>
  );
}

/** The ten zones seen from above: red rings 1-5, amber 6-10, a striped containment ring outside. */
function Zones({ size, filled = 0, mark, open = [] as number[] }: { size: number; filled?: number; mark?: React.ReactNode; open?: number[] }) {
  const c = size / 2;
  const r0 = size * 0.1;
  const step = size * 0.036;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r0 + 10.6 * step} fill="none" stroke="#121212" strokeWidth={size * 0.026} />
      <circle cx={c} cy={c} r={r0 + 10.6 * step} fill="none" stroke={V.orange} strokeWidth={size * 0.026} strokeDasharray={`${size * 0.022} ${size * 0.022}`} />
      {Array.from({ length: 10 }, (_, i) => {
        const r = r0 + (i + 1) * step;
        const isOpen = open.includes(i);
        const a = -Math.PI / 2 + i * 0.71 + 0.5;
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={i < 5 ? V.red : V.glow} strokeOpacity={isOpen ? 0.95 : 0.75} strokeWidth={isOpen ? 2.6 : 1.6} strokeDasharray={isOpen ? "8 8" : undefined} />
            {i < filled && !isOpen ? <circle cx={c + Math.cos(a) * r} cy={c + Math.sin(a) * r} r={i === 0 ? 9 : 6.5} fill={i === 0 ? V.orange : V.paper} stroke="#121212" strokeWidth="2" /> : null}
          </g>
        );
      })}
      <circle cx={c} cy={c} r={r0} fill="#000" stroke="#fff4d0" strokeWidth="2.4" />
      {mark}
    </svg>
  );
}

/* ───────── avatar: the hawk astronaut mascot, centred for X's round crop ───────── */
export function HKLogo() {
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <Mascot size={1080} />
    </AbsoluteFill>
  );
}

/* ───────── header: 1500x500, the avatar covers the lower left ───────── */
export function HKBanner() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 760, top: -60, width: 960, height: 620 }}>
        <Render w={960} h={620} scale={0.9} cy={560} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #0b0b0c 0%, #0b0b0c 54%, rgba(11,11,12,0) 76%)" }} />
      <Stripe h={16} style={{ position: "absolute", left: 0, right: 0, top: 0 }} />
      <div style={{ position: "absolute", left: 450, top: 70 }}>
        <Head size={120}>
          Hold
          <br />
          <span style={{ color: V.orange }}>closer.</span>
        </Head>
        <Body size={24} color={V.paper} style={{ marginTop: 18, maxWidth: 440 }}>
          The ten biggest $HAWK holders sit nearest the core. Every trade pays them in ETH.
        </Body>
        <Mono size={20} color={V.orange} style={{ marginTop: 14, letterSpacing: "0.1em" }}>
          {SITE.toUpperCase()} · ROBINHOOD CHAIN
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the exposure board, from the site ───────── */
export function HKPostBoard() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, top: 56, right: 80 }}>
        <Head size={84}>
          Ten on site. <span style={{ color: V.orange }}>One at the core.</span>
        </Head>
      </div>
      <div style={{ position: "absolute", left: 80, top: 170, width: 1440, height: 610, overflow: "hidden", border: `3px solid ${V.orange}` }}>
        <Img src={staticFile("hk/s-_ladder_0.png")} style={{ position: "absolute", width: 1920 * 1.16, left: -330 * 1.16, top: -232 * 1.16 }} />
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 34, right: 80, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Body size={26} color={V.paper}>
          <b style={{ color: V.red }}>RED ZONE</b> No. 1-5 share 0.014 ETH · <b style={{ color: V.glow }}>AMBER ZONE</b> No. 6-10 share 0.006 ETH · of every 0.02 ETH emission
        </Body>
        <Mono size={17} color={V.muted}>
          illustration
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the safety rules, as signs ───────── */
export function HKPostRules() {
  const rules: [React.ReactNode, string, string, boolean][] = [
    [<Mandatory kind="coins" size={150} />, "Hold 100,000 $HAWK", "to enter the site.", false],
    [<Warn kind="core" size={150} />, "Biggest holder", "sits at the core.", false],
    [<Safe kind="hand" size={150} />, "The top ten", "share every emission.", false],
    [<Prohibit kind="sell" size={150} />, "No selling", "One sale and you are spaghettified. For good.", true],
  ];
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <Stripe h={18} style={{ position: "absolute", left: 0, right: 0, top: 0 }} />
      <div style={{ position: "absolute", left: 90, top: 70 }}>
        <Head size={120} color={V.orange}>
          Safety rules
        </Head>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 250, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 26 }}>
        {rules.map(([sign, b, s, red], i) => (
          <div key={i} style={{ background: red ? V.red : V.paper, padding: "30px 26px 34px", height: 470, display: "flex", flexDirection: "column", gap: 22 }}>
            {sign}
            <div style={{ fontFamily: VF.display, fontWeight: 900, fontSize: 52, lineHeight: 0.95, textTransform: "uppercase", color: red ? V.paper : "#121212" }}>{b}</div>
            <div style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 30, lineHeight: 1.3, color: red ? V.paper : "#3a3e44" }}>{s}</div>
          </div>
        ))}
      </div>
      <Sig style={{ left: 90, bottom: 44 }} />
      <Mono size={20} color={V.muted} style={{ position: "absolute", right: 90, bottom: 58 }}>
        Moving between your own wallets is not a sale.
      </Mono>
    </AbsoluteFill>
  );
}

/** The radiation level bar from the hero placard. */
function Level({ fill, segs = 24 }: { fill: number; segs?: number }) {
  const lit = Math.round(segs * fill);
  return (
    <div style={{ display: "flex", gap: 4, padding: 5, background: "#121212" }}>
      {Array.from({ length: segs }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 26, background: i < lit ? V.orange : "#2c2f33" }} />
      ))}
    </div>
  );
}

/* ───────── post: right now, the core is unclaimed ───────── */
export function HKPostEmpty() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 520, top: -40, width: 1180, height: 980 }}>
        <Render w={1180} h={980} scale={1.2} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #0b0b0c 0%, #0b0b0c 36%, rgba(11,11,12,0) 62%)" }} />
      <div style={{ position: "absolute", left: 100, top: 96, width: 760 }}>
        <Caps size={24}>At the core · No. 1</Caps>
        <Head size={150} style={{ marginTop: 18 }}>
          Unclaimed.
        </Head>
        <Placard width={660} style={{ marginTop: 34 }}>
          <div style={{ fontFamily: VF.serif, fontWeight: 600, fontSize: 30, lineHeight: 1.3 }}>Hold the most $HAWK and you sit at the core. The first 0.02 ETH emission goes to the ten nearest.</div>
          <div style={{ fontFamily: VF.mono, fontWeight: 700, fontSize: 16, letterSpacing: "0.18em", color: "#3a3e44", margin: "20px 0 8px" }}>RADIATION LEVEL</div>
          <Level fill={0} />
          <div style={{ fontFamily: VF.mono, fontSize: 22, marginTop: 10 }}>0.0000 / 0.02 ETH to The Emission</div>
        </Placard>
      </div>
      <Mono size={24} color={V.orange} style={{ position: "absolute", left: 100, bottom: 54 }}>
        {SITE}
      </Mono>
    </AbsoluteFill>
  );
}

/* ───────── post: who reaches the core first? ───────── */
export function HKPostWho() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 100, top: 110, width: 800 }}>
        <Head size={130}>Who reaches</Head>
        <Head size={130} color={V.orange}>
          the core first?
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 32, maxWidth: 600 }}>
          Cycle one is open. The biggest holder takes the core. The ten nearest split the first 0.02 ETH emission.
        </Body>
        <Mono size={26} color={V.orange} style={{ marginTop: 40 }}>
          {SITE}
        </Mono>
      </div>
      <div style={{ position: "absolute", right: 70, top: 90 }}>
        <Zones
          size={720}
          open={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
          mark={
            <text x={360} y={386} textAnchor="middle" fontFamily={VF.display} fontWeight={900} fontSize={80} fill={V.orange}>
              ?
            </text>
          }
        />
      </div>
      <Caps size={18} color={V.muted} style={{ position: "absolute", right: 120, bottom: 56 }}>
        All ten zones open
      </Caps>
    </AbsoluteFill>
  );
}

/* ───────── hook posts: one line that stops the scroll ───────── */
function HookFrame({ children, plate, dark = 0.15 }: { children: React.ReactNode; plate?: { cx?: number; cy?: number; scale: number; left: number }; dark?: number }) {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      {plate ? (
        <>
          <div style={{ position: "absolute", left: plate.left, top: 0, width: 1600 - plate.left + 200, height: 900 }}>
            <Render w={1600 - plate.left + 200} h={900} scale={plate.scale} cx={plate.cx} cy={plate.cy} dark={dark} />
          </div>
          <AbsoluteFill style={{ background: `linear-gradient(90deg, #0b0b0c 0%, #0b0b0c ${(plate.left / 1600) * 100 + 6}%, rgba(11,11,12,0) ${(plate.left / 1600) * 100 + 32}%)` }} />
        </>
      ) : null}
      {children}
      <Mono size={24} color={V.paper} style={{ position: "absolute", left: 100, bottom: 56 }}>
        $HAWK · <span style={{ color: V.orange }}>{SITE}</span>
      </Mono>
      <div style={{ position: "absolute", right: 80, bottom: 40 }}>
        <Tri size={66} />
      </div>
    </AbsoluteFill>
  );
}

/** 1. Paper hands get spaghettified. */
export function HKHookPaper() {
  return (
    <HookFrame plate={{ scale: 1.1, left: 720 }}>
      <Tape word="Do not sell" angle={-5} tone="red" size={38} style={{ left: -200, top: 560 }} />
      <div style={{ position: "absolute", left: 100, top: 120, width: 880 }}>
        <Head size={124}>Paper hands get</Head>
        <Head size={124} color={V.orange}>
          spaghettified.
        </Head>
        <Body size={38} color={V.paper} style={{ marginTop: 30 }}>
          One sale and you're off the board. For good.
        </Body>
      </div>
    </HookFrame>
  );
}

/** 2. Out-hold No. 1. Take the core. */
export function HKHookCore() {
  return (
    <HookFrame plate={{ scale: 1.35, left: 780 }}>
      <div style={{ position: "absolute", left: 100, top: 120, width: 860 }}>
        <Caps size={24}>Warning · No. 1 is contestable</Caps>
        <Head size={124} style={{ marginTop: 18 }}>
          Out-hold No. 1.
        </Head>
        <Head size={124} color={V.orange}>
          Take the core.
        </Head>
        <Body size={36} color={V.paper} style={{ marginTop: 30 }}>
          The biggest $HAWK holder sits at the core, live. Biggest dose of every emission.
        </Body>
      </div>
    </HookFrame>
  );
}

/** 3. Ten doses every emission. */
export function HKHookTen() {
  return (
    <HookFrame>
      <div style={{ position: "absolute", left: 100, top: 100, width: 860 }}>
        <Head size={112}>10 doses.</Head>
        <Head size={112}>Every emission.</Head>
        <Head size={112} color={V.orange}>
          Are you on the board?
        </Head>
        <Body size={32} color={V.muted} style={{ marginTop: 28, maxWidth: 780 }}>
          Every 0.02 ETH of trading fees is paid to the ten biggest holders. Ranked by balance, live.
        </Body>
      </div>
      <div style={{ position: "absolute", right: 80, top: 150 }}>
        <Zones size={560} filled={10} />
      </div>
    </HookFrame>
  );
}

/* ───────── GIF: a holder out-holds No. 1 and takes the core ───────── */
export const HK_GIF_LENGTH = 150;
export function HKGif() {
  const f = useCurrentFrame();
  const a = 9.4;
  const b = 7.1 + easeInOut(ramp(f, 14, 70)) * 3.3;
  const swap = b > a && f > 72;
  const hop = ramp(f, 72, 104);
  const shout = back(ramp(f, 100, 112)) * (1 - ramp(f, 134, 146));
  const fade = Math.min(ramp(f, 0, 8), 1 - ramp(f, 140, 150));
  const S = 720;
  const c = S / 2;
  const rA = swap ? 70 + 50 * easeInOut(hop) : 70;
  const rb = swap ? 120 - 50 * easeInOut(hop) : 220 - easeInOut(ramp(f, 14, 70)) * 100;
  const tA = f * 0.06;
  const tB = f * 0.035 + 2.4;
  const one = swap && hop > 0.6;
  return (
    <AbsoluteFill style={{ background: V.void, opacity: fade, overflow: "hidden" }}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", inset: 0 }}>
        <circle cx={c} cy={c + 30} r={300} fill="none" stroke="#121212" strokeWidth="16" />
        <circle cx={c} cy={c + 30} r={300} fill="none" stroke={V.orange} strokeWidth="16" strokeDasharray="14 14" strokeDashoffset={-f * 1.2} />
        {[70, 120, 170, 220, 270].map((r, i) => (
          <circle key={r} cx={c} cy={c + 30} r={r} fill="none" stroke={i < 2 ? V.red : V.glow} strokeOpacity={0.75} strokeWidth="1.8" />
        ))}
        <circle cx={c} cy={c + 30} r={40} fill="#000" stroke="#fff4d0" strokeWidth="2.4" />
        <circle cx={c + Math.cos(tA) * rA} cy={c + 30 + Math.sin(tA) * rA} r={12} fill={V.paper} stroke="#121212" strokeWidth="2" />
        <circle cx={c + Math.cos(tB) * rb} cy={c + 30 + Math.sin(tB) * rb} r={12} fill={V.orange} stroke="#121212" strokeWidth="2" />
        <text x={c + Math.cos(tA) * rA + 18} y={c + 30 + Math.sin(tA) * rA - 10} fontFamily={VF.mono} fontWeight={700} fontSize={20} fill={V.paper}>
          @corewhale {a.toFixed(1)}M
        </text>
        <text x={c + Math.cos(tB) * rb + 18} y={c + 30 + Math.sin(tB) * rb + 28} fontFamily={VF.mono} fontWeight={700} fontSize={20} fill={V.orange}>
          0x2f8c…6a9f {b.toFixed(1)}M
        </text>
      </svg>
      <div style={{ position: "absolute", left: 40, top: 30 }}>
        <Head size={62} color={one ? V.orange : V.paper}>
          {one ? "New core." : "Race for the core"}
        </Head>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: shout, transform: `scale(${0.6 + shout * 0.4}) rotate(-4deg)` }}>
        <div style={{ padding: "10px 28px", background: V.orange, color: "#121212", border: "6px solid #121212", fontFamily: VF.display, fontWeight: 900, fontSize: 64, letterSpacing: "0.04em" }}>AT THE CORE</div>
      </div>
      <Mono size={20} color={V.paper} style={{ position: "absolute", left: 40, bottom: 30 }}>
        $HAWK · {SITE}
      </Mono>
      <div style={{ position: "absolute", right: 30, bottom: 22 }}>
        <Tri size={56} />
      </div>
    </AbsoluteFill>
  );
}

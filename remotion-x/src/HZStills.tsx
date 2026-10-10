/** Horizon stills for X: avatar, header, posts, hooks, and the "New Singularity" GIF. */
import type React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Body, Caps, Fig, Funnel, Head, Hole, Mark, Mono, Rule, SITE, Sig, V, VF, back, easeInOut, ramp } from "./HZTheme";

/** The real render of the black hole from the site, framed on a point (px of the 1920x1080 plate). */
function Render({ src = "hz/plate-hero.png", cx = 1343, cy = 492, scale = 1, w, h, dark = 0 }: { src?: string; cx?: number; cy?: number; scale?: number; w: number; h: number; dark?: number }) {
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: V.void }}>
      <Img src={staticFile(src)} style={{ position: "absolute", width: 1920 * scale, height: 1080 * scale, left: w / 2 - cx * scale, top: h / 2 - cy * scale }} />
      {dark ? <AbsoluteFill style={{ background: V.void, opacity: dark }} /> : null}
    </AbsoluteFill>
  );
}

/* ───────── avatar: the black hole, centred for X's round crop ───────── */
export function HZLogo() {
  return (
    <AbsoluteFill style={{ background: V.void }}>
      <Render w={1080} h={1080} scale={1.9} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(5,5,6,0) 52%, rgba(5,5,6,0.85) 74%)" }} />
    </AbsoluteFill>
  );
}

/* ───────── header: 1500x500, the avatar covers the lower left ───────── */
export function HZBanner() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 820, top: -40, width: 900, height: 600 }}>
        <Render w={900} h={600} scale={0.92} cx={1343} cy={500} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #050506 0%, #050506 56%, rgba(5,5,6,0) 78%)" }} />
      <div style={{ position: "absolute", left: 450, top: 70 }}>
        <Head size={104}>
          Fall
          <br />
          closer.
        </Head>
        <Body size={24} color={V.paper} style={{ marginTop: 22, maxWidth: 420 }}>
          The biggest $VOID holder is the Singularity. Every trade pays the ten closest in ETH.
        </Body>
        <Mono size={20} color={V.orange} style={{ marginTop: 16, letterSpacing: "0.1em" }}>
          {SITE.toUpperCase()} · ROBINHOOD CHAIN
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the orbit, from the site ───────── */
export function HZPostOrbit() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, top: 58, right: 80 }}>
        <Head size={70}>
          Ten in orbit. <span style={{ color: V.orange }}>One Singularity.</span>
        </Head>
      </div>
      <div style={{ position: "absolute", left: 80, top: 170, width: 1440, height: 610, overflow: "hidden", border: `1px solid ${V.hair2}` }}>
        <Img src={staticFile("hz/s-_ladder_0.png")} style={{ position: "absolute", width: 1920 * 0.92, left: -230 * 0.92 + 0, top: -60 * 0.92 }} />
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 34, right: 80, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Fig n={2} size={24}>
          No. 1-5 share 0.014 ETH and No. 6-10 share 0.006 ETH of every 0.02 ETH Pull.
        </Fig>
        <Mono size={17} color={V.muted}>
          illustration
        </Mono>
      </div>
    </AbsoluteFill>
  );
}

/* ───────── post: the laws, numbered like equations ───────── */
export function HZPostLaws() {
  const laws: [React.ReactNode, string][] = [
    [<>m ≥ 100,000 $VOID</>, "you are in orbit."],
    [<>max(m)</>, "is the Singularity."],
    [<>the ten closest</>, "share every Pull."],
    [<>one sale</>, "spaghettified. For good."],
  ];
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -260, bottom: -120, opacity: 0.9 }}>
        <Funnel width={1100} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 80, width: 1180 }}>
        <Head size={110}>The laws.</Head>
        <div style={{ marginTop: 40 }}>
          {laws.map(([k, v], i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 22, padding: "22px 0", borderTop: `1px solid ${V.hair2}`, borderBottom: i === laws.length - 1 ? `1px solid ${V.hair2}` : undefined }}>
              <span style={{ fontFamily: VF.serifItalic, fontSize: 52, color: V.paper }}>{k}</span>
              <span style={{ fontFamily: VF.serif, fontSize: 52, color: V.orange }}>⟶</span>
              <span style={{ fontFamily: VF.serif, fontSize: 52, color: i === 3 ? V.orange : V.paper }}>{v}</span>
              <span style={{ marginLeft: "auto", fontFamily: VF.serif, fontSize: 32, color: V.muted }}>({i + 1})</span>
            </div>
          ))}
        </div>
      </div>
      <Sig style={{ left: 100, bottom: 56 }} />
    </AbsoluteFill>
  );
}

/* ───────── post: right now, the Singularity is unclaimed ───────── */
export function HZPostEmpty() {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 560, top: -30, width: 1100, height: 960 }}>
        <Render w={1100} h={960} scale={1.25} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #050506 0%, #050506 34%, rgba(5,5,6,0) 64%)" }} />
      <div style={{ position: "absolute", left: 100, top: 110, width: 760 }}>
        <Caps size={22}>The Singularity · No. 1</Caps>
        <Head size={124} style={{ marginTop: 22 }}>
          Unclaimed.
        </Head>
        <Body size={36} color={V.paper} style={{ marginTop: 30 }}>
          Hold the most $VOID and you sit at the centre. The first 0.02 ETH Pull goes to the ten closest.
        </Body>
        <div style={{ marginTop: 44, width: 620 }}>
          <Rule label="toward the first Pull" />
          <Mono size={44} style={{ marginTop: 16 }}>
            0.0000 <span style={{ color: V.muted, fontSize: 30 }}>/ 0.02 ETH</span>
          </Mono>
        </div>
      </div>
      <Mono size={22} color={V.orange} style={{ position: "absolute", left: 100, bottom: 64 }}>
        {SITE}
      </Mono>
    </AbsoluteFill>
  );
}

/* ───────── post: who falls in first? ───────── */
export function HZPostWho() {
  const S = 760;
  const c = S / 2;
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 100, top: 110, width: 760 }}>
        <Head size={118}>Who falls in</Head>
        <Head size={118} color={V.orange}>
          first?
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 32 }}>
          Round one. The biggest holder becomes the Singularity. The ten closest split the first 0.02 ETH Pull.
        </Body>
        <Mono size={24} color={V.orange} style={{ marginTop: 40 }}>
          {SITE}
        </Mono>
      </div>
      {/* the polar figure, every orbit open */}
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", right: 90, top: 70 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={c} cy={c} r={80 + i * 28} fill="none" stroke={i < 5 ? V.orange : V.paper} strokeOpacity={i < 5 ? 0.7 : 0.3} strokeWidth="1.4" strokeDasharray={i === 0 ? "6 8" : undefined} />
        ))}
        <circle cx={c} cy={c} r={56} fill="#000" stroke="#fff1dc" strokeWidth="2" />
        <text x={c} y={c + 26} textAnchor="middle" fontFamily={VF.display} fontWeight={900} fontSize={76} fill={V.orange}>
          ?
        </text>
        <text x={c} y={S - 18} textAnchor="middle" fontFamily={VF.serifItalic} fontSize={24} fill={V.muted}>
          Fig. 2. Ten orbits, all open.
        </text>
      </svg>
    </AbsoluteFill>
  );
}

/* ───────── hook posts: one line that stops the scroll ───────── */
function HookFrame({ children, plate, dark = 0.2 }: { children: React.ReactNode; plate?: { cx: number; cy: number; scale: number; left: number }; dark?: number }) {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      {plate ? (
        <>
          <div style={{ position: "absolute", left: plate.left, top: 0, width: 1600 - plate.left + 200, height: 900 }}>
            <Render w={1600 - plate.left + 200} h={900} scale={plate.scale} cx={plate.cx} cy={plate.cy} dark={dark} />
          </div>
          <AbsoluteFill style={{ background: `linear-gradient(90deg, #050506 0%, #050506 ${(plate.left / 1600) * 100 + 6}%, rgba(5,5,6,0) ${(plate.left / 1600) * 100 + 32}%)` }} />
        </>
      ) : null}
      {children}
      <Mono size={22} color={V.paper} style={{ position: "absolute", left: 100, bottom: 60 }}>
        $VOID · <span style={{ color: V.orange }}>{SITE}</span>
      </Mono>
      <div style={{ position: "absolute", right: 80, bottom: 46 }}>
        <Mark size={60} />
      </div>
    </AbsoluteFill>
  );
}

/** 1. Paper hands get spaghettified. */
export function HZHookPaper() {
  // a body stretched into a thread as it falls
  return (
    <HookFrame plate={{ cx: 1343, cy: 492, scale: 1.1, left: 700 }}>
      <div style={{ position: "absolute", left: 100, top: 130, width: 880 }}>
        <Head size={100}>Paper hands get</Head>
        <Head size={100} color={V.orange}>
          spaghettified.
        </Head>
        <Body size={38} color={V.paper} style={{ marginTop: 34 }}>
          One sale and you fall out of orbit. For good.
        </Body>
      </div>
    </HookFrame>
  );
}

/** 2. Out-mass the Singularity. */
export function HZHookOutmass() {
  return (
    <HookFrame plate={{ cx: 1343, cy: 492, scale: 1.35, left: 760 }}>
      <div style={{ position: "absolute", left: 100, top: 130, width: 860 }}>
        <Head size={96}>Out-mass the</Head>
        <Head size={96}>Singularity.</Head>
        <Head size={96} color={V.orange}>
          Take the centre.
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 30 }}>
          The biggest $VOID holder sits at No. 1, live.
        </Body>
      </div>
    </HookFrame>
  );
}

/** 3. Ten orbits. Are you in one? */
export function HZHookTen() {
  const S = 640;
  const c = S / 2;
  return (
    <HookFrame>
      <div style={{ position: "absolute", left: 100, top: 110, width: 860 }}>
        <Head size={116}>10 orbits</Head>
        <Head size={116}>split every Pull.</Head>
        <Head size={116} color={V.orange}>
          Are you in one?
        </Head>
        <Body size={32} color={V.muted} style={{ marginTop: 30 }}>
          Every 0.02 ETH in trading fees goes to the ten closest holders. Ranked by balance, live.
        </Body>
      </div>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", right: 90, top: 110 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const r = 70 + i * 24;
          const a = -Math.PI / 2 + i * 0.63 + 0.3;
          return (
            <g key={i}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={i < 5 ? V.orange : V.paper} strokeOpacity={i < 5 ? 0.75 : 0.32} strokeWidth="1.4" />
              <circle cx={c + Math.cos(a) * r} cy={c + Math.sin(a) * r} r={i === 0 ? 9 : 6} fill={i < 5 ? V.orange : V.paper} />
            </g>
          );
        })}
        <circle cx={c} cy={c} r={46} fill="#000" stroke="#fff1dc" strokeWidth="2" />
      </svg>
    </HookFrame>
  );
}

/* ───────── GIF: a holder out-masses No. 1 and falls into the centre ───────── */
export const HZ_GIF_LENGTH = 150;
export function HZGif() {
  const f = useCurrentFrame();
  const a = 9.4;
  const b = 7.1 + easeInOut(ramp(f, 14, 70)) * 3.3;
  const swap = b > a && f > 72;
  const hop = ramp(f, 72, 104);
  const shout = back(ramp(f, 100, 112)) * (1 - ramp(f, 134, 146));
  const fade = Math.min(ramp(f, 0, 8), 1 - ramp(f, 140, 150));
  const S = 720;
  const c = S / 2;
  // two bodies on the polar figure: the closer one is No. 1. B spirals inward as its mass grows.
  const rA = swap ? 70 + 50 * easeInOut(hop) : 70;
  const rb = swap ? 120 - 50 * easeInOut(hop) : 220 - easeInOut(ramp(f, 14, 70)) * 100;
  const tA = f * 0.06;
  const tB = f * 0.035 + 2.4;
  const one = swap && hop > 0.6;
  return (
    <AbsoluteFill style={{ background: V.void, opacity: fade, overflow: "hidden" }}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", inset: 0 }}>
        {[70, 120, 170, 220, 270].map((r, i) => (
          <circle key={r} cx={c} cy={c + 30} r={r} fill="none" stroke={i === 0 ? V.orange : V.paper} strokeOpacity={i === 0 ? 0.8 : 0.22} strokeWidth="1.3" />
        ))}
        <circle cx={c} cy={c + 30} r={40} fill="#000" stroke="#fff1dc" strokeWidth="2" />
        <circle cx={c + Math.cos(tA) * rA} cy={c + 30 + Math.sin(tA) * rA} r={12} fill={V.paper} />
        <circle cx={c + Math.cos(tB) * rb} cy={c + 30 + Math.sin(tB) * rb} r={12} fill={V.orange} />
        <text x={c + Math.cos(tA) * rA + 18} y={c + 30 + Math.sin(tA) * rA - 10} fontFamily={VF.mono} fontSize={20} fill={V.paper}>
          @voidwhale {a.toFixed(1)}M
        </text>
        <text x={c + Math.cos(tB) * rb + 18} y={c + 30 + Math.sin(tB) * rb + 28} fontFamily={VF.mono} fontSize={20} fill={V.orange}>
          0x2f8c…6a9f {b.toFixed(1)}M
        </text>
      </svg>
      <div style={{ position: "absolute", left: 40, top: 34 }}>
        <Head size={50}>{one ? "New Singularity." : "Race for No. 1"}</Head>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: shout, transform: `scale(${0.6 + shout * 0.4})` }}>
        <div style={{ padding: "12px 26px", background: V.orange, color: V.void, fontFamily: VF.display, fontWeight: 900, fontSize: 52, letterSpacing: "-0.02em" }}>FELL IN.</div>
      </div>
      <Mono size={20} color={V.paper} style={{ position: "absolute", left: 40, bottom: 34 }}>
        $VOID · {SITE}
      </Mono>
      <div style={{ position: "absolute", right: 30, bottom: 24 }}>
        <Mark size={54} />
      </div>
    </AbsoluteFill>
  );
}

export { Hole };

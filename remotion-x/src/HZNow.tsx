/**
 * "Right now" posters for X, from the live board on 11 Oct 2026 (~01:40 WIB): 7 of 10 orbits
 * taken, the first Pull 40% charged, 3 wallets spaghettified. Numbers are baked in at render time.
 */
import type React from "react";
import { AbsoluteFill } from "remotion";
import { Body, Caps, Head, Hole, Mark, Mono, SITE, V, VF } from "./HZTheme";
import { Gauge } from "./HZGauge";

const STAMP = "LIVE · 11 OCT 2026, 01:40 WIB";
const TEN: [string, number][] = [
  ["0x2a70…0051", 27.39],
  ["0xf761…b2fd", 25.89],
  ["0x9773…a23e", 24.0],
  ["0x2416…58ad", 22.35],
  ["0x35ca…b7e6", 21.01],
  ["0x8387…7c16", 19.37],
  ["0xfb80…0798", 5.31],
];
const ESCROW = 0.008;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill style={{ background: V.void, overflow: "hidden" }}>
      {children}
      <Caps size={18} color={V.orange} style={{ position: "absolute", left: 90, top: 56 }}>
        ● {STAMP}
      </Caps>
      <Mono size={22} color={V.paper} style={{ position: "absolute", left: 90, bottom: 56 }}>
        $VOID · <span style={{ color: V.orange }}>{SITE}</span>
      </Mono>
      <div style={{ position: "absolute", right: 80, bottom: 42 }}>
        <Mark size={58} />
      </div>
    </AbsoluteFill>
  );
}

/* 1. three orbits are still open */
export function HZNowOpen() {
  const S = 800;
  const c = S / 2;
  return (
    <Frame>
      <div style={{ position: "absolute", left: 90, top: 120, width: 640 }}>
        <Head size={150}>3 orbits</Head>
        <Head size={150} color={V.orange}>
          still open.
        </Head>
        <Body size={36} color={V.paper} style={{ marginTop: 34 }}>
          7 of the 10 closest orbits are taken. The ten closest split every 0.02 ETH Pull.
        </Body>
        <Body size={36} color={V.paper} style={{ marginTop: 16 }}>
          Hold <b style={{ color: V.orange }}>100,000 $VOID</b> to fall in.
        </Body>
        <Mono size={22} color={V.orange} style={{ marginTop: 26, letterSpacing: "0.06em" }}>
          No. 8 · No. 9 · No. 10 → OPEN
        </Mono>
      </div>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: "absolute", right: -10, top: 50 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const r = 76 + i * 30;
          const open = i >= TEN.length;
          const a = -Math.PI / 2 + i * 0.71 + 0.5;
          const x = c + Math.cos(a) * r;
          const y = c + Math.sin(a) * r;
          return (
            <g key={i}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={open ? V.orange : V.paper} strokeOpacity={open ? 0.95 : i < 5 ? 0.45 : 0.28} strokeWidth={open ? 2.4 : 1.3} strokeDasharray={open ? "8 9" : undefined} />
              {open ? null : <circle cx={x} cy={y} r={i === 0 ? 10 : 7} fill={i === 0 ? V.orange : V.paper} />}
            </g>
          );
        })}
        <circle cx={c} cy={c} r={52} fill="#000" stroke="#fff1dc" strokeWidth="2.4" />
      </svg>
    </Frame>
  );
}

/* 2. the first Pull is 40% charged */
export function HZNowCharge() {
  return (
    <Frame>
      <div style={{ position: "absolute", left: 90, top: 120, width: 820 }}>
        <Head size={112}>The first Pull</Head>
        <Head size={112} color={V.orange}>
          is 40% charged.
        </Head>
        <Body size={34} color={V.paper} style={{ marginTop: 34, maxWidth: 700 }}>
          Every trade feeds the escrow. At 0.02 ETH the engine pays the ten closest holders, on-chain.
        </Body>
        <Body size={36} color={V.muted} style={{ marginTop: 16 }}>
          Not in the ten when it fires? You get nothing.
        </Body>
      </div>
      <div style={{ position: "absolute", right: 70, top: 200 }}>
        <Gauge fill={ESCROW / 0.02} target={0.02} size={540} label="FIRST PULL" />
      </div>
    </Frame>
  );
}

/* 3. three wallets already spaghettified */
export function HZNowOut() {
  return (
    <Frame>
      <div style={{ position: "absolute", right: -200, top: 120 }}>
        <Hole size={820} spin={0.6} />
      </div>
      {/* three bodies stretched into threads on the way in */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 960 + i * 30, top: 380 + i * 110, width: 380 - i * 50, height: 14 - i * 3, borderRadius: 20, background: `linear-gradient(90deg, rgba(243,243,239,0.95), ${V.orange})`, transform: `rotate(${-8 + i * 7}deg)`, transformOrigin: "100% 50%" }} />
      ))}
      <div style={{ position: "absolute", left: 90, top: 120, width: 820 }}>
        <Head size={130}>3 sold.</Head>
        <Head size={104} color={V.orange} style={{ marginTop: 8 }}>
          3 spaghettified.
        </Head>
        <Body size={36} color={V.paper} style={{ marginTop: 34 }}>
          One sale and you fall out of orbit. For good. They never get paid again.
        </Body>
        <Body size={36} color={V.paper} style={{ marginTop: 16 }}>
          7 holders are still in orbit.
        </Body>
      </div>
    </Frame>
  );
}

export const NOW_TOP = TEN;

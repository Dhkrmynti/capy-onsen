/**
 * The opening: the doorway of the bathhouse. A noren hangs over it with the headline; under it is
 * the bath, and the ten capybaras in the water are the live top ten. No. 1 has the yuzu. The dev
 * wallet minds the counter and never gets in. Scrolling lifts the noren off the mural, then the
 * water rises over the whole doorway and you are in the bath (the next section).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEMO, STEP, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { BuyButton, useMedia } from "./Bits";
import { CapyHead, Soaker, capyOf, type Traits } from "./Capy";
import { openTag } from "./Tag";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Where each rank soaks, in percent of the pool, and how big: [x, y, scale]. Front five are the hot pool. */
const WIDE: [number, number, number][] = [
  [50, 78, 1.25],
  [31, 74, 1.05],
  [69, 74, 1.05],
  [13, 78, 0.98],
  [87, 78, 0.98],
  [36, 37, 0.78],
  [64, 37, 0.78],
  [21, 39, 0.74],
  [79, 39, 0.74],
  [50, 27, 0.72],
];
const NARROW: [number, number, number][] = [
  [50, 84, 1.25],
  [29, 60, 1],
  [71, 60, 1],
  [14, 84, 0.9],
  [86, 84, 0.9],
  [31, 34, 0.72],
  [69, 34, 0.72],
  [13, 36, 0.7],
  [87, 36, 0.7],
  [50, 32, 0.72],
];

type Soak = { id: string; addr: string; name: string; traits: Traits };

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const spots = narrow ? NARROW : WIDE;
  const live = !!status?.tokenAddress;
  const top = live ? (pond?.rows ?? []).slice(0, 10) : [];
  const rows: Soak[] = useMemo(() => top.map((r) => ({ id: r.addr.toLowerCase(), addr: r.addr, name: nameFor(r.addr, r.nickname, r.x).name, traits: capyOf(r.addr, r.pp) })), [pond, live]);
  const house = live ? pond?.house : null;
  // the token is live but the board has not arrived yet: say nothing about an empty bath until it has
  const empty = rows.length === 0 && !(live && !pond);

  // everyone the engine ever reported as sold stays in the set, so a late board update still sends the right capybara out
  const soldSet = useRef(new Set<string>());
  for (const a of pond?.sold ?? []) soldSet.current.add(a.toLowerCase());
  for (const o of pond?.out ?? []) soldSet.current.add(o.addr.toLowerCase());

  // a capybara that sold and dropped off the ten gets one last moment: it bolts out of the water
  const prev = useRef<{ row: Soak; at: number }[]>([]);
  const [leaving, setLeaving] = useState<{ row: Soak; at: number }[]>([]);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);
  useEffect(() => {
    const now = new Set(rows.map((r) => r.id));
    const gone = prev.current.filter((p) => !now.has(p.row.id) && soldSet.current.has(p.row.id));
    prev.current = rows.map((row, at) => ({ row, at }));
    if (!gone.length) return;
    setLeaving((l) => [...l, ...gone]);
    // not cleared when the board updates again: a second update must not leave the capybara hanging in the air
    window.setTimeout(() => alive.current && setLeaving((l) => l.filter((x) => !gone.includes(x))), 1500);
  }, [rows]);

  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = live ? parseFloat(status?.escrowETH ?? "0") : 0;
  const target = parseFloat(next.thresholdETH);
  const pct = target > 0 ? Math.max(0, Math.min(1, escrow / target)) : 0;

  // when ranks move, each capybara wades to its new spot (FLIP, keyed by wallet)
  // Measured inside the pool (offsets), not on screen: the scroll zoom and a resize must not look like a move.
  const last = useRef(new Map<string, { x: number; y: number; w: number }>());
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const now = new Map<string, { x: number; y: number; w: number }>();
    const poolW = el.querySelector<HTMLElement>(".spots")?.offsetWidth ?? 0;
    el.querySelectorAll<HTMLElement>(".spot[data-key]").forEach((n) => {
      const b = { x: n.offsetLeft, y: n.offsetTop, w: poolW };
      now.set(n.dataset.key!, b);
      const a = last.current.get(n.dataset.key!);
      if (!a || a.w !== b.w || prefersReducedMotion() || (Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2)) return;
      gsap.fromTo(n, { x: a.x - b.x, y: a.y - b.y }, { x: 0, y: 0, duration: 1.1, ease: "power3.inOut" });
    });
    last.current = now;
  });

  // once the water has covered the doorway the scene stops moving
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    const on = () => setCovered(window.scrollY > window.innerHeight * 0.95);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // arriving: the noren drops onto its rod, the capybaras surface one by one
      gsap
        .timeline({ delay: 0.15 })
        .from(".noren__cloth", { yPercent: -105, duration: 0.9, ease: "back.out(1.15)" })
        .from(".noren__hem i", { scaleY: 0.2, transformOrigin: "50% 0%", duration: 0.7, ease: "elastic.out(1, 0.5)", stagger: 0.05 }, "-=0.5")
        .from(".beam > *", { y: 18, opacity: 0, duration: 0.45, ease: "power2.out", stagger: 0.08 }, "-=0.5");
      // leaving: scroll lifts the noren off the mural, then the water comes up over everything
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: wrap.current, start: "top top", end: "bottom bottom", scrub: 0.5 } })
        .to(".noren", { yPercent: -118, duration: 0.5 }, 0)
        .to(".noren__hem i", { rotate: (i) => (i % 2 ? 7 : -7), yPercent: -30, duration: 0.3, stagger: 0.02 }, 0)
        .to(".mural__fuji", { yPercent: -5, duration: 0.6 }, 0)
        .to(".mural__sun", { yPercent: -22, duration: 0.6 }, 0)
        .to(".pool__in", { scale: 1.06, duration: 0.6 }, 0.1)
        .fromTo(".rise", { yPercent: 112 }, { yPercent: 0, duration: 0.48 }, 0.52);
    },
    { scope: wrap },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rows.length) return;
      gsap.from(".spot .soaker__head", { y: 34, duration: 0.8, ease: "back.out(1.8)", stagger: { each: 0.06, from: "end" }, delay: 0.5 });
    },
    { scope: wrap, dependencies: [rows.length > 0] },
  );

  return (
    <div className="herowrap" ref={wrap}>
      <section className={`hero ${covered ? "is-covered" : ""}`} id="top" aria-label="The bathhouse doorway">
        <svg className="mural" viewBox="0 0 1600 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <rect width="1600" height="640" fill="#c5e1e6" />
          <circle className="mural__sun" cx="1210" cy="250" r="74" fill="#e4472b" />
          <g className="mural__fuji">
            <path d="M330 640 L700 250 Q760 214 820 250 L1230 640 Z" fill="#35518f" />
            <path d="M700 250 Q760 214 820 250 L890 316 L838 296 L792 336 L748 298 L700 338 L664 300 L626 328 Z" fill="#fffaf0" />
          </g>
          <g fill="#fffaf0">
            <rect x="120" y="330" width="330" height="26" rx="13" />
            <rect x="60" y="372" width="250" height="26" rx="13" />
            <rect x="1180" y="390" width="320" height="26" rx="13" />
            <rect x="1300" y="432" width="240" height="26" rx="13" />
          </g>
          <rect y="540" width="1600" height="100" fill="#f3ead8" />
          <path d="M0 540 H1600 M0 590 H1600 M100 540 V640 M300 540 V640 M500 540 V640 M700 540 V640 M900 540 V640 M1100 540 V640 M1300 540 V640 M1500 540 V640 M200 590 V640 M400 590 V640 M600 590 V640 M800 590 V640 M1000 590 V640 M1200 590 V640 M1400 590 V640" stroke="#1a1814" strokeOpacity="0.18" strokeWidth="2" fill="none" />
        </svg>

        <div className="noren">
          <div className="noren__cloth">
            <h1 className="noren__h">{empty ? <>The bath is empty.</> : <>Stay in the bath.</>}</h1>
            <p className="noren__sub">
              {offline
                ? "The bathhouse is offline for a moment."
                : empty
                  ? live
                    ? `The first holder of 100,000 ${TICKER} gets in, and gets the yuzu.`
                    : `Opens at launch. The first holder of 100,000 ${TICKER} gets in, and gets the yuzu.`
                  : `Ten spots in the water for the ten biggest holders of ${TICKER}, paid in ETH from trading fees. Get out once and you stay out.`}
              {DEMO ? <em className="demo"> Demo data.</em> : null}
            </p>
            <div className="noren__hem" aria-hidden="true">
              {Array.from({ length: narrow ? 4 : 7 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="hero__wall">
          {house ? (
            <button type="button" className="attendant" onClick={() => openTag(house.addr)} aria-label={`The attendant, ${nameFor(house.addr, house.nickname, house.x).name}. Open the tag`}>
              <svg viewBox="0 0 120 100" aria-hidden="true">
                <g transform="translate(22 -4) scale(0.76)">
                  <CapyHead traits={capyOf(house.addr, house.pp)} />
                  <path d="M17 34 Q50 22 83 34 L83 41 Q50 30 17 41 Z" fill="#fffaf0" stroke="#1a1814" strokeWidth="2.6" strokeLinejoin="round" />
                  <path d="M40 30.5 L44 37 M52 29.5 L55 36" stroke="#1c2d5a" strokeWidth="3" strokeLinecap="round" />
                </g>
                <rect x="6" y="58" width="108" height="42" fill="#c58b52" stroke="#1a1814" strokeWidth="3" />
                <path d="M6 72 H114 M42 58 V100 M78 58 V100" stroke="#1a1814" strokeOpacity="0.35" strokeWidth="2" />
              </svg>
              <span className="attendant__tag">
                Attendant <b>{nameFor(house.addr, house.nickname, house.x).name}</b>
              </span>
            </button>
          ) : null}
        </div>

        <div className="beam">
          <div className="thermo" role="status">
            <span className="thermo__k">
              Heating up <b>{STEP[next.kind].name}</b>
            </span>
            <span className="thermo__tube" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={escrow} aria-label={`Fees collected toward the next ${STEP[next.kind].name.toLowerCase()}`}>
              <i style={{ width: `${pct * 100}%` }} />
            </span>
            <span className="thermo__read num">
              <b>{escrow.toFixed(4)}</b> / {next.thresholdETH} ETH
            </span>
          </div>
          <div className="beam__acts">
            <BuyButton status={status} />
            <a className="btn is-line" href="#bath">
              See the bath <ArrowDown weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="pool">
          <div className="pool__in">
            {[12, 30, 47, 66, 84].map((x, i) => (
              <svg key={x} className="steam" style={{ left: `${x}%`, animationDelay: `${-i * 1.7}s` }} viewBox="0 0 40 120" aria-hidden="true">
                <path d="M20 118 C 4 96, 36 80, 20 58 C 6 38, 32 24, 20 4" fill="none" stroke="#fffaf0" strokeWidth="7" strokeLinecap="round" />
              </svg>
            ))}
            <ol className="spots" aria-label="The ten in the water">
              {spots.map(([x, y, s], i) => {
                const r = rows[i];
                const style = { "--x": `${x}%`, "--y": `${y}%`, "--s": s, "--d": `${-(i * 0.47).toFixed(2)}s`, zIndex: Math.round(y) } as CSSProperties;
                return r ? (
                  <li key={r.id} data-key={r.id} className={`spot ${i === 0 ? "is-one" : ""} ${i < 5 ? "is-hot" : "is-warm"}`} style={style}>
                    <button type="button" onClick={() => openTag(r.addr)} aria-label={`No. ${i + 1}, ${r.name}. Open the tag`}>
                      <Soaker traits={r.traits} yuzu={i === 0} />
                      <span className="spot__tag">
                        <b className="num">{i + 1}</b>
                        <span>{r.name}</span>
                      </span>
                    </button>
                  </li>
                ) : (
                  <li key={`open-${i}`} className="spot is-open" style={style}>
                    <svg className="soaker" viewBox="0 -6 100 106" aria-hidden="true">
                      <ellipse className="soaker__ring" cx="50" cy="88" rx="40" ry="8" fill="none" stroke="#fffaf0" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="6 7" />
                    </svg>
                    <span className="spot__tag">
                      <b className="num">{i + 1}</b>
                      <span>open</span>
                    </span>
                  </li>
                );
              })}
              {leaving.map(({ row, at }) => {
                const [x, y, s] = spots[at] ?? spots[9];
                return (
                  <li key={`out-${row.id}`} className="spot is-leaving" style={{ "--x": `${x}%`, "--y": `${y}%`, "--s": s, zIndex: 200 } as CSSProperties} aria-hidden="true">
                    <Soaker traits={row.traits} startled />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="rise" aria-hidden="true">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path d="M0 60 V30 Q75 0 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30 V60 Z" fill="#9fd3cc" />
            <path d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30" fill="none" stroke="#1a1814" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </section>
    </div>
  );
}

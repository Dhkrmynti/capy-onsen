/**
 * The opening: the waiting room in 3D. The ten chairs are the live top ten, the ape behind the
 * desk is the dev wallet, and nobody is drawn who is not on the board. The room stays pinned
 * while the page starts to scroll: the camera pushes in on the gold chair and the next section
 * slides over it. Without WebGL the same ten are shown as a flat row of portraits.
 */
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEMO, STEP, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, useMedia } from "../components/Bits";
import { CrewFace } from "../components/Face";
import { validTraits } from "../components/Mugshot";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(useGSAP);

const WaitingRoom = lazy(() => import("./WaitingRoom"));
const SEGS = 20;

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const scroll = useRef(0);
  const narrow = useMedia("(max-width: 760px)");
  const [gl] = useState(canWebGL);
  // the ambient-occlusion and bloom pass is for desktops; ?fx=0 turns it off anywhere (slow machines, tests)
  const fx = !narrow && !window.location.search.includes("fx=0");
  const live = !!status?.tokenAddress;
  // the room is built once the board is known: the ten on it are seated, an empty board is an empty room
  const ready = offline || (!!status && (!live || !!pond));
  const top = live ? (pond?.rows ?? []).slice(0, 10) : [];
  const rows = useMemo(
    () => top.map((r) => ({ id: r.addr.toLowerCase(), name: nameFor(r.addr, r.nickname, r.x).name, balance: parseFloat(r.balance), traits: validTraits(r.pp) ? r.pp : null })),
    [pond, live],
  );
  // everyone the engine ever reported as sold stays in the set, so a late board update still throws the right ape out
  const soldSet = useRef(new Set<string>());
  const sold = useMemo(() => {
    for (const a of pond?.sold ?? []) soldSet.current.add(a.toLowerCase());
    for (const o of pond?.out ?? []) soldSet.current.add(o.addr.toLowerCase());
    return [...soldSet.current];
  }, [pond]);
  const house = live ? pond?.house : null;
  const dev = useMemo(
    () => (house ? { id: house.addr.toLowerCase(), name: nameFor(house.addr, house.nickname, house.x).name, balance: parseFloat(house.balance), traits: validTraits(house.pp) ? house.pp : null } : undefined),
    [house?.addr, house?.balance, house?.nickname, house?.x?.username, house?.pp?.join(".")],
  );

  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = live ? parseFloat(status?.escrowETH ?? "0") : 0;
  const target = parseFloat(next.thresholdETH);
  const pct = target > 0 ? Math.max(0, Math.min(1, escrow / target)) : 0;
  const empty = top.length === 0;

  // the first 70% of a screen of scrolling pushes the camera in and fades the copy
  // once the sheet has covered the room completely, the room stops drawing
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    const still = prefersReducedMotion();
    const on = () => {
      setCovered(window.scrollY > window.innerHeight * 1.75);
      if (still) return;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.7)));
      scroll.current = p;
      root.current?.style.setProperty("--p", p.toFixed(3));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "back.out(1.6)" }, delay: 0.25 })
        .from(".st-hero__h .ln", { yPercent: 110, duration: 0.8, stagger: 0.08 })
        .from(".st-hero__sub", { y: 14, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(".st-serving", { y: 40, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".st-hero__acts > *", { y: 30, opacity: 0, duration: 0.5, stagger: 0.07 }, "-=0.45");
    },
    { scope: root },
  );

  return (
    <section className="st-hero" id="top" ref={root} aria-label="The waiting room">
      <div className="st-hero__stage" aria-hidden={gl ? "true" : undefined}>
        {gl && ready ? (
          <Suspense fallback={null}>
            <WaitingRoom rows={rows} sold={sold} dev={dev} scroll={scroll} paused={covered} fx={fx} />
          </Suspense>
        ) : !gl ? (
          <ol className="st-flat">
            {Array.from({ length: 10 }, (_, i) => {
              const r = top[i];
              return (
                <li key={i} className={i === 0 ? "is-gold" : ""}>
                  {r ? <CrewFace addr={r.addr} pp={r.pp} x={r.x} size={64} /> : <span className="st-flat__open" />}
                  <b>#{i + 1}</b>
                  <span>{r ? nameFor(r.addr, r.nickname, r.x).name : "empty"}</span>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
      <div className="st-hero__copy">
        <h1 className="st-hero__h">
          {empty ? (
            <>
              <span className="mask"><span className="ln">Seat No. 1</span></span>
              <span className="mask"><span className="ln">is empty.</span></span>
            </>
          ) : (
            <>
              <span className="mask"><span className="ln">Fight for the</span></span>
              <span className="mask"><span className="ln">gold chair.</span></span>
            </>
          )}
        </h1>
        <p className="st-hero__sub">
          {offline
            ? "The board is offline for a moment."
            : empty
              ? live
                ? `The first holder of 100,000 ${TICKER} takes it.`
                : `Opens at launch. The first holder of 100,000 ${TICKER} takes it.`
              : `Ten chairs for the ten biggest holders of ${TICKER}. Sell once and you go out the window.`}
          {DEMO ? <em className="st-demo">Demo data</em> : null}
        </p>
      </div>
      <div className="st-hero__foot">
        <div className="st-serving" role="status">
          <span className="st-serving__k">Now filling</span>
          <b className="st-serving__name">{STEP[next.kind].name}</b>
          <span className="st-serving__bar" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={escrow} aria-label={`Fees toward the next ${STEP[next.kind].name.toLowerCase()}`}>
            {Array.from({ length: SEGS }, (_, i) => (
              <i key={i} className={i < Math.round(pct * SEGS) ? "is-lit" : ""} />
            ))}
          </span>
          <span className="st-serving__read tabular">
            <b>{escrow.toFixed(4)}</b> / {next.thresholdETH} ETH
          </span>
        </div>
        <div className="st-hero__acts">
          <BuyButton status={status} />
          <a className="st-btn" href="#row">
            See the row <ArrowDown weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="st-hero__dim" aria-hidden="true" />
    </section>
  );
}


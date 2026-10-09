import { Suspense, lazy, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, STEP, amount, eth, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Certificate, Rosette } from "./Engrave";
import { BuyButton, CaCoupon, useMedia } from "./Bits";

gsap.registerPlugin(useGSAP);

// The 3D coin (three.js) loads after the page, so the first paint never waits for it.
const Coin3D = lazy(() => import("./Coin3D"));
const Vault3D = lazy(() => import("./Vault3D"));

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Mounts the coin once the browser is idle, and only where WebGL works. */
function useCoin() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!canWebGL()) return;
    const w = window as unknown as { requestIdleCallback?: (f: () => void) => number };
    const go = () => setShow(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go);
    else setTimeout(go, 300);
  }, []);
  return show;
}

/** The house's opening line is the engine's state, in plain words. */
function story(status: Status | null, offline: boolean) {
  if (offline) return { head: ["The office is", "closed for now."], deck: "The engine isn't answering. The house shows nothing rather than yesterday's figures." };
  if (!status || !status.tokenAddress)
    return {
      head: ["Patient money,", "paid in ETH."],
      deck: "Old Money pays a dividend to its ten largest holders out of every trade. Sell once and the account is closed, for good.",
    };
  if (status.rounds === 0)
    return { head: ["The doors", "are open."], deck: "Every trade adds to the first dividend. It is paid the moment the escrow fills. Hold large, never sell." };
  return {
    head: ["The dividend", "is paid, again."],
    deck: `Old Money has paid its Preferred Ten ${eth(status.totals.fedETH)} so far. ${status.counts.hopped} closed accounts were paid nothing.`,
  };
}

export function FrontPage({ status, offline }: { status: Status | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const { head, deck } = story(status, offline);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const target = parseFloat(next.thresholdETH);
  const live = !!status?.tokenAddress;
  const pct = target > 0 ? Math.min(1, escrow / target) : 0;
  const coin = useCoin();

  useGSAP(
    () => {
      gsap.set(".rate__fill", { scaleX: pct });
      if (prefersReducedMotion()) return;
      // The doors open: the line is set, the certificate is laid on the desk, the board lights up.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero__eyebrow", { opacity: 0, y: 14, duration: 0.7 })
        .from(".hero__line", { yPercent: 105, duration: 1.1, stagger: 0.12 }, "-=0.45")
        .from(".hero__deck, .hero__deal", { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, "-=0.7")
        .from(".cert", { opacity: 0, y: 60, rotate: 6, scale: 0.94, duration: 1.3 }, "-=1.1")
        .from(".rate__cell", { opacity: 0, y: 16, duration: 0.6, stagger: 0.07 }, "-=0.8")
        .fromTo(".rate__fill", { scaleX: 0 }, { scaleX: pct, duration: 1.4, ease: "power3.out" }, "-=0.4");
    },
    { scope: root, dependencies: [pct] },
  );

  const cells = [
    { k: "Accounts", v: live ? amount(status!.counts.sitters) : "—" },
    { k: "Dividends paid", v: live ? String(status!.rounds) : "0" },
    { k: "Closed accounts", v: live ? String(status!.counts.hopped) : "0", warn: true },
  ];

  return (
    <section className="hero" id="top" ref={root} aria-label="Old Money, the Private Office">
      {/* the vault door behind everything; the engraved rosette stands in where there is no WebGL */}
      {coin ? (
        <div className="vault3d" aria-hidden="true">
          <Suspense fallback={null}>
            <Vault3D still={prefersReducedMotion()} />
          </Suspense>
        </div>
      ) : (
        <Rosette className="hero__rosette" size={980} petals={36} />
      )}
      <div className="h-wrap hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow">The Private Office · Robinhood Chain</p>
          <h1 className="hero__head">
            <span className="hero__mask">
              <span className="hero__line">{head[0]}</span>
            </span>
            <span className="hero__mask">
              <span className="hero__line is-gilt">{head[1]}</span>
            </span>
          </h1>
          <p className="hero__deck">{deck}</p>
          <div className="hero__deal">
            <BuyButton status={status} />
            <a className="h-btn is-ghost" href="#card">
              Check your standing
            </a>
          </div>
          <div className="hero__deal">
            <CaCoupon status={status} compact={narrow} />
          </div>
        </div>
        <div className="hero__art">
          <Certificate no={(status?.rounds ?? 0) + 1} />
          {coin ? (
            <div className="coin3d" aria-hidden="true">
              <Suspense fallback={null}>
                <Coin3D still={prefersReducedMotion()} />
              </Suspense>
            </div>
          ) : null}
        </div>
      </div>

      <div className="h-wrap">
        <dl className="rate" aria-label="The counting room">
          <div className="rate__cell is-next">
            <dt>Next payment · {offline ? "no signal" : STEP[next.kind].name}</dt>
            <dd className="tabular">
              {live ? `${escrow.toFixed(4)} / ${next.thresholdETH} ETH` : `Pays at ${next.thresholdETH} ETH`}
              <span className="rate__meter" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={escrow} aria-label={`Escrow toward ${STEP[next.kind].name}`}>
                <span className="rate__fill" />
              </span>
            </dd>
          </div>
          {cells.map((c) => (
            <div key={c.k} className={`rate__cell ${c.warn ? "is-warn" : ""}`}>
              <dt>{c.k}</dt>
              <dd className="tabular">{c.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

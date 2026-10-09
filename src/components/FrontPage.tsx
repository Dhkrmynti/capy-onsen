import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, STEP, amount, eth, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "./Bits";

gsap.registerPlugin(useGSAP);

/** The opening line is the engine's state, in plain words. */
function story(status: Status | null, offline: boolean) {
  if (offline) return { head: "The office is closed for now.", deck: "The engine isn't answering. Nothing is shown rather than old figures." };
  if (!status || !status.tokenAddress) return { head: "Patient money, paid in ETH.", deck: "Every trade pays a dividend to the ten largest holders. Sell once and the account closes." };
  if (status.rounds === 0) return { head: "The vault is open.", deck: "Every trade adds to the first dividend. It is paid the moment the escrow fills." };
  return { head: "The dividend is paid, again.", deck: `${eth(status.totals.fedETH)} paid to the Preferred Ten so far. ${status.counts.hopped} closed accounts got nothing.` };
}

/** The escrow as a brass pressure gauge: the needle climbs toward the next payment. */
function Gauge({ pct, label, value, due }: { pct: number; label: string; value: string; due: boolean }) {
  const a0 = -225;
  const a1 = 45;
  const ang = a0 + (a1 - a0) * pct;
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / 20) * Math.PI) / 180;
    const long = i % 5 === 0;
    return <line key={i} x1={60 + Math.cos(a) * 46} y1={60 + Math.sin(a) * 46} x2={60 + Math.cos(a) * (long ? 38 : 42)} y2={60 + Math.sin(a) * (long ? 38 : 42)} strokeWidth={long ? 2 : 1} />;
  });
  return (
    <div className={`gauge ${due ? "is-due" : ""}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label={`${label}: ${value}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" className="gauge__bezel" />
        <circle cx="60" cy="60" r="50" className="gauge__face" />
        <g className="gauge__ticks">{ticks}</g>
        <g className="gauge__needle" style={{ transform: `rotate(${ang + 90}deg)` }}>
          <path d="M60 60 L 57.5 62 L 60 18 L 62.5 62 Z" />
        </g>
        <circle cx="60" cy="60" r="5" className="gauge__hub" />
      </svg>
      <div className="gauge__read">
        <span className="gauge__k">{label}</span>
        <span className="gauge__v tabular">{value}</span>
        {due ? <span className="gauge__due">About to be paid</span> : null}
      </div>
    </div>
  );
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
  const pct = live && target > 0 ? Math.min(1, escrow / target) : 0;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The plaque is lit first, then the words are set on it; the gauge needle settles last.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".plaque--door", { clipPath: "inset(0 0 100% 0)", duration: 1.1 })
        .from(".door__head, .door__deck, .door__deal, .door__ledger", { y: 22, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.6")
        .from(".gauge__needle", { rotate: -135, duration: 1.6, ease: "elastic.out(1, 0.5)" }, "-=0.8");
      gsap.to(".door__cue svg", { y: 6, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: root },
  );

  return (
    <section className="stop stop--door" id="top" ref={root} aria-label="Old Money: the vault door">
      <div className="h-wrap stop__inner">
        <div className="plaque plaque--door">
          <h1 className="door__head">{head}</h1>
          <p className="door__deck">{deck}</p>
          <div className="door__deal">
            <BuyButton status={status} />
            <a className="h-btn is-ghost" href="#card">
              Check your standing
            </a>
          </div>
          <div className="door__deal">
            <CaCoupon status={status} compact={narrow} />
          </div>
          <div className="door__ledger">
            <Gauge pct={pct} label={offline ? "No signal" : `Next: ${STEP[next.kind].name}`} value={live ? `${escrow.toFixed(4)} / ${next.thresholdETH} ETH` : `Pays at ${next.thresholdETH} ETH`} due={pct >= 0.85} />
            <dl className="door__facts">
              <div>
                <dt>Accounts</dt>
                <dd className="tabular">{live ? amount(status!.counts.sitters) : "—"}</dd>
              </div>
              <div>
                <dt>Dividends paid</dt>
                <dd className="tabular">{live ? status!.rounds : 0}</dd>
              </div>
              <div className="is-closed">
                <dt>Closed</dt>
                <dd className="tabular">{live ? status!.counts.hopped : 0}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <a className="door__cue" href="#payout">
        Turn the wheel <ArrowDown weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}

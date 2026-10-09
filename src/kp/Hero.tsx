/**
 * The opening, over the cave: who sleeps on the biggest pile right now, and how full the escrow is
 * on its way to the next Haul. The 3D cave behind does the rest.
 */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, STEP, compact, usd, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton } from "../components/Bits";
import { CrewFace } from "../components/Face";

gsap.registerPlugin(useGSAP);

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const target = parseFloat(next.thresholdETH);
  const pct = target > 0 ? Math.min(1, escrow / target) : 0;
  const top = live ? pond?.rows[0] : undefined;
  const who = top ? nameFor(top.addr, top.nickname, top.x) : null;
  const px = status?.price?.tokenUSD ?? 0;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero__h .ln", { yPercent: 110, duration: 1.1, stagger: 0.09, delay: 0.3 })
        .from(".hero__panel > *:not(.hero__h)", { y: 22, opacity: 0, duration: 0.8, stagger: 0.07 }, "-=0.7");
    },
    { scope: root },
  );

  return (
    <section className="hero stop" id="top" ref={root} aria-label="The Hoard">
      <div className="hero__panel">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">Guard</span>
          </span>
          <span className="mask">
            <span className="ln is-gold">the hoard.</span>
          </span>
        </h1>
        <p className="hero__read" role="status">
          {offline ? (
            "The cave is quiet for a moment."
          ) : top && who ? (
            <>
              <CrewFace addr={top.addr} pp={top.pp} x={top.x} size={26} className="hero__face" />
              <span>
                <b>{who.name}</b> sleeps on the biggest pile · {compact(top.balance)} $HOARD{px > 0 ? ` (${usd(parseFloat(top.balance) * px)})` : ""}
              </span>
            </>
          ) : (
            "The ten biggest holders guard the gold. Every trade pays them in ETH."
          )}
        </p>
        <div className="hero__meter" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={escrow} aria-label={`Escrow toward ${STEP[next.kind].name}`}>
          <span className="hero__meter-bar">
            <i style={{ width: `${(live ? pct : 0) * 100}%` }} />
          </span>
          <span className="hero__meter-read tabular">
            {live ? escrow.toFixed(4) : "0.0000"} / {next.thresholdETH} ETH to {STEP[next.kind].name.replace(/^The /, "the ")}
          </span>
        </div>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="kp-btn is-ghost" href="#ladder">
            See the Keepers
          </a>
        </div>
      </div>
      <a className="hero__cue" href="#ladder">
        Walk into the cave ↓
      </a>
    </section>
  );
}

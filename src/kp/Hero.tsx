/**
 * The opening: the ship dressed in signal flags behind, and in front who flies the Captain's
 * black flag right now and how far the escrow has climbed toward the next hoist.
 */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, STEP, compact, usd, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton } from "../components/Bits";
import { CrewFace } from "../components/Face";
import { Flag } from "../components/Flag";

gsap.registerPlugin(useGSAP);

/** Ten flag cells that fill toward the next step; the reading carries mass, so it overshoots and settles. */
function Meter({ value, target, label }: { value: number; target: number; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pct = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
  useGSAP(
    () => {
      const to = { "--fill": pct } as gsap.TweenVars;
      if (prefersReducedMotion()) gsap.set(root.current, to);
      else gsap.to(root.current, { ...to, duration: 1.8, ease: "elastic.out(1, 0.42)", delay: 0.6 });
    },
    { scope: root, dependencies: [pct] },
  );
  return (
    <div className="meter" ref={root} role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value} aria-label={label}>
      <span className="meter__cells" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </span>
    </div>
  );
}

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = live ? parseFloat(status?.escrowETH ?? "0") : 0;
  const target = parseFloat(next.thresholdETH);
  const top = live ? pond?.rows[0] : undefined;
  const who = top ? nameFor(top.addr, top.nickname, top.x) : null;
  const px = status?.price?.tokenUSD ?? 0;
  const stepName = STEP[next.kind].name.replace(/^The /, "the ");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero__h .ln", { yPercent: 105, duration: 1.2, stagger: 0.1, delay: 0.25 })
        .from(".captain", { clipPath: "inset(0 100% 0 0)", duration: 1, ease: "power4.out" }, "-=0.7")
        .from(".captain .flag", { rotate: -70, transformOrigin: "0% 0%", duration: 1.4, ease: "elastic.out(1, 0.4)" }, "<")
        .from(".meter, .meter__read, .hero__acts", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=1.1");
    },
    { scope: root },
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Plunders">
      <div className="hero__copy">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">Take the</span>
          </span>
          <span className="mask">
            <span className="ln">helm.</span>
          </span>
        </h1>
        <div className="captain" role="status">
          <Flag code="J" size={92} className="captain__flag" />
          {offline ? (
            <p className="captain__line">The ship is quiet for a moment. Back shortly.</p>
          ) : top && who ? (
            <p className="captain__line">
              <span className="captain__k">Captain</span>
              <span className="captain__who">
                <CrewFace addr={top.addr} pp={top.pp} x={top.x} size={30} className="captain__face" />
                <b>{who.name}</b>
              </span>
              <span className="captain__bal tabular">
                {compact(top.balance)} $LOOT{px > 0 ? ` · ${usd(parseFloat(top.balance) * px)}` : ""}
              </span>
            </p>
          ) : (
            <p className="captain__line">
              <span className="captain__k">Captain</span>
              <span className="captain__who">
                <b>The helm is free.</b>
              </span>
              <span className="captain__bal">Biggest holder flies this flag. The top ten get paid in ETH.</span>
            </p>
          )}
        </div>
        <Meter value={escrow} target={target} label={`Escrow toward ${stepName}`} />
        <p className="meter__read tabular">
          <b>{escrow.toFixed(4)}</b> / {next.thresholdETH} ETH to {stepName}
        </p>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="sig-btn is-white" href="#ladder">
            See the Crew
          </a>
        </div>
      </div>
      <a className="hero__cue" href="#ladder">
        Come aboard <ArrowDown weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}

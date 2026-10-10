/**
 * The opening: the rocket on its pad behind, and in front who commands the mission right now and
 * how much fuel the escrow holds toward the next stage.
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

gsap.registerPlugin(useGSAP);

/** A poster dial: the needle carries mass, so a new reading swings past and settles. */
function Gauge({ value, target, label }: { value: number; target: number; label: string }) {
  const root = useRef<SVGSVGElement>(null);
  const pct = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
  useGSAP(
    () => {
      const to = { rotate: -90 + pct * 180, svgOrigin: "100 100" };
      if (prefersReducedMotion()) gsap.set(".gauge__needle", to);
      else gsap.fromTo(".gauge__needle", { rotate: -90, svgOrigin: "100 100" }, { ...to, duration: 2, ease: "elastic.out(1, 0.45)", delay: 0.7 });
    },
    { scope: root, dependencies: [pct] },
  );
  return (
    <svg className="gauge" ref={root} viewBox="0 0 200 112" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value} aria-label={label}>
      <path className="gauge__track" d="M 14 100 A 86 86 0 0 1 186 100" />
      <path className="gauge__fill" d="M 14 100 A 86 86 0 0 1 186 100" pathLength={100} style={{ strokeDasharray: `${pct * 100} 100` }} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI - (i / 10) * Math.PI;
        const r1 = i % 5 ? 70 : 64;
        return <line key={i} className="gauge__tick" x1={100 + Math.cos(a) * r1} y1={100 - Math.sin(a) * r1} x2={100 + Math.cos(a) * 76} y2={100 - Math.sin(a) * 76} />;
      })}
      <g className="gauge__needle">
        <path d="M 97 100 L 100 30 L 103 100 Z" />
      </g>
      <circle className="gauge__hub" cx="100" cy="100" r="8" />
    </svg>
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
  const stepName = STEP[next.kind].name;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero__h .ln", { yPercent: 105, duration: 1.2, stagger: 0.1, delay: 0.25 })
        .from(".cmdr", { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", duration: 1, ease: "power4.inOut" }, "-=0.8")
        .from(".fuel, .hero__acts", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.5");
    },
    { scope: root },
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Orbiters">
      <div className="hero__copy">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">Take</span>
          </span>
          <span className="mask">
            <span className="ln">command.</span>
          </span>
        </h1>
        <div className="cmdr" role="status">
          {offline ? (
            <p className="cmdr__line">Mission control is quiet for a moment. Back shortly.</p>
          ) : top && who ? (
            <p className="cmdr__line">
              <span className="cmdr__k">Commander</span>
              <span className="cmdr__who">
                <CrewFace addr={top.addr} pp={top.pp} x={top.x} size={34} className="cmdr__face" />
                <b>{who.name}</b>
              </span>
              <span className="cmdr__bal tabular">
                {compact(top.balance)} $ORBIT{px > 0 ? ` · ${usd(parseFloat(top.balance) * px)}` : ""}
              </span>
            </p>
          ) : (
            <p className="cmdr__line">
              <span className="cmdr__k">Commander</span>
              <span className="cmdr__who">
                <b>The seat is empty.</b>
              </span>
              <span className="cmdr__bal">The biggest holder commands. The top ten get paid in ETH.</span>
            </p>
          )}
        </div>
        <div className="fuel">
          <Gauge value={escrow} target={target} label={`Fuel toward ${stepName}`} />
          <p className="fuel__read tabular">
            <span className="fuel__k">Fuel</span>
            <b>{escrow.toFixed(4)}</b>
            <span>/ {next.thresholdETH} ETH to {stepName}</span>
          </p>
        </div>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="sr-btn is-line" href="#ladder">
            Meet the crew
          </a>
        </div>
      </div>
      <a className="hero__cue" href="#ladder">
        Begin countdown <ArrowDown weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}

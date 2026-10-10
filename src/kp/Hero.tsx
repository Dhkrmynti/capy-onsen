/**
 * The opening: the contained black hole behind, and in front the facility's warning placard: who
 * sits at the core right now, and the radiation level climbing toward the next emission.
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
import { Warn } from "./Signs";

gsap.registerPlugin(useGSAP);

const SEGS = 24;

/** A Geiger bar: lit segments climb toward the next emission, yellow into red near the top. */
function Level({ value, target, label }: { value: number; target: number; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pct = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
  useGSAP(
    () => {
      const lit = Math.round(pct * SEGS);
      const segs = root.current?.querySelectorAll<HTMLElement>(".level__seg");
      if (!segs) return;
      if (prefersReducedMotion()) return segs.forEach((s, i) => s.classList.toggle("is-lit", i < lit));
      // the needle overshoots like a real counter, then settles on the reading
      const st = { n: 0 };
      gsap
        .timeline({ delay: 0.6 })
        .to(st, { n: Math.min(SEGS, lit + 3), duration: 0.9, ease: "power2.out", onUpdate: () => segs.forEach((s, i) => s.classList.toggle("is-lit", i < Math.round(st.n))) })
        .to(st, { n: lit, duration: 0.6, ease: "power2.inOut", onUpdate: () => segs.forEach((s, i) => s.classList.toggle("is-lit", i < Math.round(st.n))) });
    },
    { scope: root, dependencies: [pct] },
  );
  return (
    <div className="level" ref={root} role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value} aria-label={label}>
      {Array.from({ length: SEGS }, (_, i) => (
        <i key={i} className={`level__seg ${i >= SEGS * 0.75 ? "is-hot" : ""}`} />
      ))}
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
  const stepName = STEP[next.kind].name;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero__h .ln", { yPercent: 105, duration: 1.1, stagger: 0.09, delay: 0.2 })
        .from(".placard", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power4.inOut" }, "-=0.7")
        .from(".placard .sign", { rotate: -25, scale: 0.6, duration: 1, ease: "back.out(2.2)" }, "-=0.5")
        .from(".hero__acts", { y: 16, opacity: 0, duration: 0.7 }, "-=0.6");
    },
    { scope: root },
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Hawking">
      <div className="hero__copy">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">Hold</span>
          </span>
          <span className="mask">
            <span className="ln">closer.</span>
          </span>
        </h1>
        <div className="placard" role="status">
          <p className="placard__band">
            <Warn kind="hole" size={30} /> Warning
          </p>
          <div className="placard__body">
            <p className="placard__lead">Hawking radiation. The ten holders nearest the core are paid in ETH.</p>
            <p className="placard__core">
              <span className="placard__k">At the core</span>
              {offline ? (
                <span>Facility offline for a moment.</span>
              ) : top && who ? (
                <span className="placard__who">
                  <CrewFace addr={top.addr} pp={top.pp} x={top.x} size={28} className="placard__face" />
                  <b>{who.name}</b>
                  <em className="tabular">
                    {compact(top.balance)} $HAWK{px > 0 ? ` · ${usd(parseFloat(top.balance) * px)}` : ""}
                  </em>
                </span>
              ) : (
                <span className="placard__who">
                  <b>Nobody yet.</b> The biggest holder takes the core.
                </span>
              )}
            </p>
            <div className="placard__level">
              <span className="placard__k">Radiation level</span>
              <Level value={escrow} target={target} label={`Fees toward ${stepName}`} />
              <span className="placard__read tabular">
                <b>{escrow.toFixed(4)}</b> / {next.thresholdETH} ETH to {stepName}
              </span>
            </div>
          </div>
        </div>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="hz-btn" href="#ladder">
            Exposure board
          </a>
        </div>
      </div>
      <a className="hero__cue" href="#ladder">
        Enter the facility <ArrowDown weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}

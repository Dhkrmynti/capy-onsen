/**
 * The chess clock: the escrow filling toward the next move. The flag rises as the fee gathers;
 * at the line the move is played and the clock starts again from zero.
 */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { STEP, type RoundKind } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(useGSAP);

export function Clock({ value, target, kind, live }: { value: number; target: number; kind: RoundKind; live: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const pct = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
  const angle = -120 + pct * 240;
  useGSAP(
    () => {
      const to = { rotate: angle, transformOrigin: "50px 58px" };
      if (prefersReducedMotion()) gsap.set(".clock__hand", to);
      else gsap.to(".clock__hand", { ...to, duration: 1.2, ease: "back.out(1.6)" });
    },
    { scope: root, dependencies: [angle] },
  );
  return (
    <div className="clock" ref={root} role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value} aria-label={`Escrow ${value.toFixed(4)} of ${target} ETH toward ${STEP[kind].name}`}>
      <span className="clock__button" aria-hidden="true" />
      <svg className="clock__face" viewBox="0 0 100 80" aria-hidden="true">
        <path d="M14 66 A 40 40 0 1 1 86 66" fill="none" stroke="var(--grape-2)" strokeWidth="9" strokeLinecap="round" />
        <path d="M14 66 A 40 40 0 1 1 86 66" fill="none" stroke="var(--crown)" strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray={`${pct * 100} 100`} />
        <g className="clock__hand">
          <path d="M50 58 L 50 22" stroke="var(--cream)" strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="58" r="6" fill="var(--cream)" stroke="var(--ink)" strokeWidth="3" />
      </svg>
      <p className="clock__read tabular">
        <b>{live ? value.toFixed(4) : "0.0000"}</b>
        <span>/ {target} ETH</span>
      </p>
      <p className="clock__to">to {STEP[kind].name.replace(/^The /, "the ")}</p>
    </div>
  );
}

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, STEP, stepShare, type RoundKind, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Band } from "./Engrave";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ORDER: RoundKind[] = ["feeding", "keeper", "sink"];
const WHO: Record<RoundKind, (top: number) => string> = {
  feeding: (top) => `Paid in ETH to the Preferred Ten, the ${top} largest holders, in proportion to each holding.`,
  keeper: () => "Kept by the house in its reserve wallet. Every transfer is entered on the statement.",
  sink: () => "Spent buying $OLDM back from the market. The notes bought are retired: sent to the dead address.",
};

/** One arc of the allocation ring, drawn as a stroked circle segment. */
function arc(start: number, share: number) {
  const C = 2 * Math.PI * 80;
  return { strokeDasharray: `${(share / 100) * C} ${C}`, strokeDashoffset: `${-(start / 100) * C}` };
}

export function TheTake({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const at = (k: RoundKind) => steps.find((s) => s.kind === k)?.thresholdETH ?? "0.01";
  const top = status?.rules.topN ?? 10;
  const total = steps.reduce((t, s) => t + parseFloat(s.thresholdETH), 0);
  let start = 0;
  const arcs = ORDER.map((k) => {
    const share = stepShare(steps, k);
    const a = { k, share, ...arc(start, share) };
    start += share;
    return a;
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The terms are laid out on the desk: the ring is drawn arc by arc, each clause follows.
      gsap.from(".ring__arc", { strokeDasharray: "0 1000", duration: 1.4, ease: "power3.inOut", stagger: 0.25, scrollTrigger: { trigger: ".ring", start: "top 78%" } });
      gsap.from(".terms__item", { opacity: 0, x: 30, duration: 0.8, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".terms__list", start: "top 80%" } });
    },
    { scope: root },
  );

  return (
    <section className="h-sec terms" id="payout" ref={root} aria-labelledby="terms-head">
      <div className="h-wrap">
        <header className="h-sec__head">
          <p className="h-eyebrow">§ I · The dividend</p>
          <h2 className="h-title" id="terms-head">
            Every trade pays the house. <em>The house pays the ten.</em>
          </h2>
          <p className="h-lede">Fees from every $OLDM trade gather in escrow. Each time it fills, the next payment is made, always in this order, then the round begins again.</p>
        </header>

        <div className="terms__grid">
          <figure className="ring" aria-label={`Over one full round: ${ORDER.map((k) => `${STEP[k].name} ${stepShare(steps, k)} percent`).join(", ")}`}>
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="80" className="ring__track" />
              {arcs.map((a) => (
                <circle key={a.k} cx="100" cy="100" r="80" className={`ring__arc is-${a.k}`} style={{ strokeDasharray: a.strokeDasharray, strokeDashoffset: a.strokeDashoffset }} />
              ))}
              <circle cx="100" cy="100" r="62" className="ring__inner" />
            </svg>
            <figcaption className="ring__mid">
              <span className="tabular">{total.toFixed(2)} ETH</span>
              <small>one full round</small>
            </figcaption>
          </figure>

          <ol className="terms__list">
            {ORDER.map((k, i) => (
              <li key={k} className={`terms__item is-${k}`}>
                <span className="terms__no">{["i", "ii", "iii"][i]}.</span>
                <div>
                  <p className="terms__name">
                    {STEP[k].name}
                    <span className="tabular">
                      {at(k)} ETH · {stepShare(steps, k)}%
                    </span>
                  </p>
                  <p className="terms__what">{WHO[k](top)}</p>
                </div>
              </li>
            ))}
            <li className="terms__again">Then the round begins again.</li>
          </ol>
        </div>

        <Band className="terms__band" />
        <blockquote className="maxim">
          <p>Sell once, and the account is closed. No dividend, ever.</p>
        </blockquote>
      </div>
    </section>
  );
}

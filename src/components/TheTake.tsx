import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, STEP, stepShare, type RoundKind, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ORDER: RoundKind[] = ["feeding", "keeper", "sink"];
const WHERE: Record<RoundKind, string> = { feeding: "to the ten largest holders", keeper: "to the house wallet", sink: "bought back and burned" };

/** Station two: the three pedestals. The plaque names what the camera is looking at. */
export function TheTake({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const at = (k: RoundKind) => steps.find((s) => s.kind === k)?.thresholdETH ?? "0.01";

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".tags__row", { x: -24, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".tags", start: "top 78%" } });
      gsap.from(".split__part", { scaleX: 0, transformOrigin: "0% 50%", duration: 1, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".split", start: "top 85%" } });
    },
    { scope: root },
  );

  return (
    <section className="stop stop--tall" id="payout" ref={root} aria-labelledby="payout-head">
      <div className="h-wrap stop__inner">
        <div className="plaque">
          <h2 className="plaque__head" id="payout-head">
            Where every fee goes.
          </h2>
          <ol className="tags">
            {ORDER.map((k) => (
              <li className={`tags__row is-${k}`} key={k}>
                <span className="tags__name">{STEP[k].name}</span>
                <span className="tags__eth tabular">{at(k)} ETH</span>
                <span className="tags__where">{WHERE[k]}</span>
              </li>
            ))}
          </ol>
          <div className="split" role="img" aria-label={`Over one full round: ${ORDER.map((k) => `${STEP[k].name} ${stepShare(steps, k)} percent`).join(", ")}`}>
            {ORDER.map((k) => (
              <span key={k} className={`split__part is-${k}`} style={{ flex: `${stepShare(steps, k)} 1 0%` }}>
                <b className="tabular">{stepShare(steps, k)}%</b>
              </span>
            ))}
          </div>
          <p className="plaque__rule">Then the round begins again. Sell once and the account closes.</p>
        </div>
      </div>
    </section>
  );
}

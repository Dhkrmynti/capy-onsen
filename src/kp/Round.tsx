/**
 * The Flight Plan: one round is a four-stage rocket. Each stage is as tall as its share of the
 * fees and fires in order from the bottom; the stage the engine is on is the one burning.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const at = status?.tokenAddress ? status.cycle.index : -1;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the stages stack from the bottom, then the labels draw their leader lines out
      gsap
        .timeline({ scrollTrigger: { trigger: ".stack", start: "top 85%", end: "center 55%", scrub: 0.8 } })
        .from(".stage__body", { scaleY: 0, transformOrigin: "50% 100%", ease: "power2.out", stagger: { each: 0.22, from: "end" } })
        .from(".stage__lead", { scaleX: 0, transformOrigin: "0% 50%", ease: "power2.out", stagger: { each: 0.22, from: "end" } }, 0.2)
        .from(".stage__text", { opacity: 0, x: 20, ease: "power2.out", stagger: { each: 0.22, from: "end" } }, 0.3);
    },
    { scope: root },
  );
  const look: Record<string, { name: string; line: string }> = {
    feeding: { name: "Supply Drop", line: `ETH to the ten crew. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance.` },
    keeper: { name: "Mission Fund", line: "To the treasury wallet. Every transfer is in the Mission Log." },
    sink: { name: "The Burn", line: "Buys $ORBIT back, then burns exactly what it bought." },
  };
  const total = steps.reduce((a, s) => a + parseFloat(s.thresholdETH), 0) || 1;
  // stage 1 fires first, so it sits at the bottom of the rocket
  const order = steps.map((s, i) => ({ s, i })).reverse();
  return (
    <section className="plan" id="round" ref={root} aria-labelledby="round-head">
      <div className="plan__head">
        <h2 className="sr-h2" id="round-head">
          Every trade fuels the next stage.
        </h2>
        <p className="plan__deck">Each fee flows into the escrow. When it holds the next stage's fuel, the engine fires that stage and pays it out. Then the next, then the round starts over.</p>
      </div>
      <div className="stack">
        <div className="stack__nose" aria-hidden="true" />
        <ol className="stack__stages" reversed>
          {order.map(({ s, i }) => {
            const l = look[s.kind];
            const h = parseFloat(s.thresholdETH) / total;
            return (
              <li key={i} className={`stage is-${s.kind} ${at === i ? "is-now" : ""}`} style={{ flexGrow: h }}>
                <span className="stage__body" aria-hidden="true">
                  <span className="stage__no tabular">{i + 1}</span>
                </span>
                <span className="stage__lead" aria-hidden="true" />
                <span className="stage__text">
                  <span className="stage__name">
                    Stage {i + 1} · {l.name}
                  </span>
                  <span className="stage__eth tabular">{s.thresholdETH} ETH</span>
                  <span className="stage__line">{i === 3 ? "Treasury again. Then the round starts over." : l.line}</span>
                  {at === i ? <span className="stage__now">burning now</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="stack__fins" aria-hidden="true" />
      </div>
      <p className="plan__sum tabular">
        Over a full round: <b>{stepShare(steps, "feeding")}%</b> to the crew, <b>{stepShare(steps, "keeper")}%</b> to the Mission Fund, <b>{stepShare(steps, "sink")}%</b> burned.
      </p>
    </section>
  );
}

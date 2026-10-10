/**
 * The Cycle: one round drawn as a closed orbit. Each arc is as long as its share of the fees and
 * is traced in order as you scroll; the step the engine is on burns in the hot colour.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const S = 440;
const C = S / 2;
const RR = 150;
const polar = (a: number, r = RR) => [C + Math.cos(a) * r, C + Math.sin(a) * r] as const;
function arc(a0: number, a1: number) {
  const [x0, y0] = polar(a0);
  const [x1, y1] = polar(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A ${RR} ${RR} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const at = status?.tokenAddress ? status.cycle.index : -1;
  const total = steps.reduce((a, s) => a + parseFloat(s.thresholdETH), 0) || 1;
  const look: Record<string, { name: string; line: string }> = {
    feeding: { name: "The Pull", line: `ETH to the ten closest. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by mass.` },
    keeper: { name: "Dark Matter", line: "To the treasury wallet. Every transfer is in the observations." },
    sink: { name: "Into the Void", line: "Buys $VOID back, then burns exactly what it bought." },
  };
  let a = -Math.PI / 2;
  const segs = steps.map((s, i) => {
    const span = (parseFloat(s.thresholdETH) / total) * Math.PI * 2;
    const a0 = a + 0.035;
    const a1 = a + span - 0.035;
    a += span;
    return { s, i, a0, a1, mid: (a0 + a1) / 2 };
  });
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the orbit is traced step by step as you scroll, then the notes appear
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".cycle__fig", start: "top 80%", end: "center 50%", scrub: 0.8 } });
      root.current?.querySelectorAll<SVGPathElement>(".cycle__arc").forEach((p) => {
        const len = p.getTotalLength();
        tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none" });
      });
      gsap.from(".step", { opacity: 0, y: 16, duration: 0.7, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".steps", start: "top 85%" } });
    },
    { scope: root },
  );
  return (
    <section className="cycle" id="round" ref={root} aria-labelledby="round-head">
      <div className="frame">
        <div className="frame__head">
          <h2 className="vd-h2" id="round-head">
            Every trade feeds the well.
          </h2>
          <p className="frame__deck">Each fee falls into the escrow. When it holds the next step's mass, the engine fires that step and pays it out. Then the next, and the orbit closes and starts again.</p>
        </div>
        <div className="cycle__grid">
          <figure className="cycle__fig">
            <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label="One round of four steps, each arc sized by its share of the fees">
              <circle className="cycle__guide" cx={C} cy={C} r={RR} />
              <circle className="cycle__hole" cx={C} cy={C} r={54} />
              {segs.map(({ s, i, a0, a1, mid }) => {
                const [lx, ly] = polar(mid, RR + 34);
                return (
                  <g key={i} className={`cycle__seg is-${s.kind} ${at === i ? "is-now" : ""}`}>
                    <path className="cycle__arc" d={arc(a0, a1)} />
                    <text className="cycle__n" x={lx} y={ly + 5} textAnchor="middle">
                      {i + 1}
                    </text>
                  </g>
                );
              })}
              <text className="cycle__c" x={C} y={C - 4} textAnchor="middle">
                one round
              </text>
              <text className="cycle__c is-sub" x={C} y={C + 16} textAnchor="middle">
                {total.toFixed(2)} ETH
              </text>
            </svg>
            <figcaption className="caption">
              <i>Fig. 3.</i> One round of the engine. Arc length is each step's share: {stepShare(steps, "feeding")}% pulled to the ten, {stepShare(steps, "keeper")}% dark matter, {stepShare(steps, "sink")}% into the void.
            </figcaption>
          </figure>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={i} className={`step is-${s.kind} ${at === i ? "is-now" : ""}`}>
                <span className="step__n tabular">{i + 1}</span>
                <span className="step__name">{look[s.kind].name}</span>
                <span className="step__eth tabular">{s.thresholdETH} ETH</span>
                <span className="step__line">{i === 3 ? "Treasury again. Then the orbit closes and starts over." : look[s.kind].line}</span>
                {at === i ? <span className="step__now">firing now</span> : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

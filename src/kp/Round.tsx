/**
 * The Plunder: one round is four hoists on one line, each flag as wide as its share of the fees.
 * As you scroll, the flags run up the line in order; the step the engine is on flies highest.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import type { FlagCode } from "../lib/flags";
import { prefersReducedMotion } from "../lib/motion";
import { Flag } from "../components/Flag";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const at = status?.tokenAddress ? status.cycle.index : -1;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ".hoists", start: "top 95%", end: "top 50%", scrub: 0.8 } })
        .from(".run", { yPercent: 110, ease: "power2.out", stagger: 0.25 })
        .from(".run .flag", { rotate: -18, transformOrigin: "0% 0%", ease: "back.out(2)", stagger: 0.25 }, 0);
    },
    { scope: root },
  );
  const look: Record<string, { code: FlagCode; name: string; line: string }> = {
    feeding: { code: "P", name: "The Plunder", line: `ETH to the ten Crew. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance.` },
    keeper: { code: "T", name: "The Chest", line: "To the treasury wallet. Every transfer is in the Log." },
    sink: { code: "B", name: "Cannonfire", line: "Buys $LOOT back, then burns exactly what it bought." },
  };
  const total = steps.reduce((a, s) => a + parseFloat(s.thresholdETH), 0) || 1;
  return (
    <section className="plunder" id="round" ref={root} aria-labelledby="round-head">
      <div className="plunder__head">
        <h2 className="sig-h2" id="round-head">
          Every trade fills the chest.
        </h2>
        <p className="plunder__deck">Each fee drops into the escrow. When it reaches the next flag's size, the engine runs that flag up and pays it out. Then the next.</p>
      </div>
      <ol className="hoists">
        {steps.map((s, i) => {
          const l = look[s.kind];
          const w = parseFloat(s.thresholdETH) / total;
          return (
            <li key={i} className={`run is-${s.kind} ${at === i ? "is-now" : ""}`} style={{ flexGrow: w, flexBasis: 0 }}>
              <Flag code={l.code} size={220} className="run__flag" />
              <span className="run__n tabular">{i + 1}</span>
              <span className="run__name">{l.name}</span>
              <span className="run__eth tabular">{s.thresholdETH} ETH</span>
              <span className="run__line">{i === 3 ? "Treasury again. Then the round starts over." : l.line}</span>
              {at === i ? <span className="run__now">flying now</span> : null}
            </li>
          );
        })}
      </ol>
      <p className="plunder__sum tabular">
        Over a full round: <b>{stepShare(steps, "feeding")}%</b> to the Crew, <b>{stepShare(steps, "keeper")}%</b> to the Chest, <b>{stepShare(steps, "sink")}%</b> to Cannonfire.
      </p>
    </section>
  );
}

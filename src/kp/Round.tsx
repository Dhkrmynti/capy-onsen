/**
 * The Emission Cycle: one round as four placards posted in a row, the way a plant posts its
 * procedure. Each placard's width is its share of the fees; the step running now has its beacon on.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Mandatory, Prohibit, Warn, type Pict } from "./Signs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const at = status?.tokenAddress ? status.cycle.index : -1;
  const total = steps.reduce((a, s) => a + parseFloat(s.thresholdETH), 0) || 1;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // placards are posted one after another as you scroll, swinging on their top screws
      gsap
        .timeline({ scrollTrigger: { trigger: ".placards", start: "top 85%", end: "center 55%", scrub: 0.7 } })
        .from(".post", { rotate: -12, y: 60, opacity: 0, transformOrigin: "50% 0%", ease: "back.out(1.6)", stagger: 0.25 });
    },
    { scope: root },
  );
  const look: Record<string, { name: string; line: string; sign: "warn" | "mand" | "proh"; pict: Pict }> = {
    feeding: { name: "The Emission", line: `ETH to the ten nearest the core. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance.`, sign: "warn", pict: "core" },
    keeper: { name: "Containment Fund", line: "To the treasury wallet. Every transfer is in the incident log.", sign: "mand", pict: "vault" },
    sink: { name: "Evaporation", line: "Buys $HAWK back on Pons, then burns exactly what it bought.", sign: "proh", pict: "flame" },
  };
  return (
    <section className="cycle" id="round" ref={root} aria-labelledby="round-head">
      <div className="slab is-wide">
        <div className="slab__head">
          <h2 className="hz-h2" id="round-head">
            Every trade charges the core.
          </h2>
          <p className="slab__deck">Each trade's creator fee builds up in the Pons fee escrow. When it reaches the next step's level, the engine collects it and runs that step. Then the next, then the cycle starts over.</p>
        </div>
        <ol className="placards">
          {steps.map((s, i) => {
            const l = look[s.kind];
            const Sign = l.sign === "warn" ? Warn : l.sign === "mand" ? Mandatory : Prohibit;
            return (
              <li key={i} className={`post is-${s.kind} ${at === i ? "is-now" : ""}`} style={{ flexGrow: parseFloat(s.thresholdETH) / total, flexBasis: 0 }}>
                <span className="post__screws" aria-hidden="true" />
                <span className="post__head">
                  <span className="post__n tabular">Step {i + 1}</span>
                  {at === i ? <span className="post__beacon">Running</span> : null}
                </span>
                <Sign kind={l.pict} size={86} />
                <span className="post__name">{l.name}</span>
                <span className="post__sol tabular">{s.thresholdETH} ETH</span>
                <span className="post__line">{i === 3 ? "Treasury again. Then the cycle starts over." : l.line}</span>
              </li>
            );
          })}
        </ol>
        <p className="cycle__sum tabular">
          Over a full cycle: <b>{stepShare(steps, "feeding")}%</b> emitted to the ten, <b>{stepShare(steps, "keeper")}%</b> to containment, <b>{stepShare(steps, "sink")}%</b> evaporated.
        </p>
      </div>
    </section>
  );
}

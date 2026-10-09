/** The Haul: the four moves the engine plays with the fees, on one panel over the lava river. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Fire, Archive, Coins } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const eth = (k: string) => steps.find((s) => s.kind === k)?.thresholdETH ?? "0";
  const at = status?.tokenAddress ? status.cycle.index : -1;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".move", { x: -40, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".moves", start: "top 80%" } });
    },
    { scope: root },
  );
  const moves = [
    { cls: "is-haul", Icon: Coins, name: "The Haul", eth: eth("feeding"), line: `To the ten Keepers. No. 1–5 split ${tiers[0]?.eth ?? "0.014"}, No. 6–10 split ${tiers[1]?.eth ?? "0.006"}, by balance.` },
    { cls: "is-chest", Icon: Archive, name: "The Chest", eth: eth("keeper"), line: "To the treasury wallet. Every transfer is in the Chronicle." },
    { cls: "is-fire", Icon: Fire, name: "Dragonfire", eth: eth("sink"), line: "Buys $HOARD back, then burns exactly what it bought." },
    { cls: "is-chest", Icon: Archive, name: "The Chest", eth: eth("keeper"), line: "Treasury again. Then the round starts over." },
  ];
  return (
    <section className="stop" id="round" ref={root} aria-labelledby="round-head">
      <div className="panel panel--right">
        <h2 className="kp-h2" id="round-head">
          Every trade feeds the hoard.
        </h2>
        <p className="panel__deck">Each fee drops into the escrow. When it reaches the next move's size, the engine plays it.</p>
        <ol className="moves">
          {moves.map((m, i) => (
            <li key={i} className={`move ${m.cls} ${at === i ? "is-now" : ""}`}>
              <m.Icon className="move__icon" weight="fill" aria-hidden="true" />
              <span className="move__name">
                {i + 1}. {m.name}
              </span>
              <span className="move__eth tabular">{m.eth} ETH</span>
              <span className="move__line">{m.line}</span>
            </li>
          ))}
        </ol>
        <div className="tally" role="img" aria-label={`Haul ${stepShare(steps, "feeding")} percent, Chest ${stepShare(steps, "keeper")} percent, Dragonfire ${stepShare(steps, "sink")} percent`}>
          <span className="tally__part is-haul" style={{ flexGrow: stepShare(steps, "feeding") }}>
            <b className="tabular">{stepShare(steps, "feeding")}%</b> Haul
          </span>
          <span className="tally__part is-chest" style={{ flexGrow: stepShare(steps, "keeper") }}>
            <b className="tabular">{stepShare(steps, "keeper")}%</b> Chest
          </span>
          <span className="tally__part is-fire" style={{ flexGrow: stepShare(steps, "sink") }}>
            <b className="tabular">{stepShare(steps, "sink")}%</b> Fire
          </span>
        </div>
      </div>
    </section>
  );
}

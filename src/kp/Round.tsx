/**
 * The loop: two steps and nothing else. Trading fees fill the escrow; at the first level the ten
 * seated holders are paid, at the next the treasury is, then round again. No buyback, no burn.
 * The step being filled now is lit and shows the escrow climbing toward its level.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ArrowsClockwise, Coins, Vault } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, addrUrl, short, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const live = !!status?.tokenAddress;
  const at = live ? status!.cycle.index : -1;
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const treasury = live ? status?.treasuryAddress : "";
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: ".st-loop", start: "top 80%" };
      gsap.from(".st-step", { y: 70, rotate: (i) => (i ? 5 : -5), opacity: 0, duration: 0.7, ease: "back.out(1.5)", stagger: 0.14, scrollTrigger: st });
      gsap.from(".st-loop__arrow", { scale: 0, rotate: -180, duration: 0.7, ease: "back.out(2)", delay: 0.3, scrollTrigger: st });
    },
    { scope: root },
  );
  const look = {
    feeding: { n: "01", name: "Reward", icon: Coins, line: `ETH straight to the ten seated holders. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance inside each row.` },
    keeper: { n: "02", name: "Treasury", icon: Vault, line: "ETH to the treasury wallet. Every transfer is listed in the receipts below." },
  } as const;
  return (
    <section className="st-sec st-cycle is-paper" id="round" ref={root} aria-labelledby="round-head">
      <div className="st-wrap">
        <div className="st-sec__head">
          <h2 className="st-h2" id="round-head">
            Two steps. Round and round.
          </h2>
          <p className="st-deck">Each trade's creator fee builds up in the Pons fee escrow. When it reaches the next step's level, the engine collects it and runs that step. Then the other one, then again.</p>
        </div>
        <ol className="st-loop">
          {steps.map((s, i) => {
            const l = look[s.kind];
            const Icon = l.icon;
            const now = at === i;
            const level = parseFloat(s.thresholdETH);
            const fill = now ? Math.min(1, escrow / level) : 0;
            return (
              <li key={i} className={`st-step is-${s.kind} ${now ? "is-now" : live ? "is-idle" : ""}`} aria-current={now ? "step" : undefined}>
                <span className="st-step__n tabular">{l.n}</span>
                <span className="st-step__state">{now ? "Filling now" : live ? "Next" : "At launch"}</span>
                <Icon className="st-step__icon" weight="fill" aria-hidden="true" />
                <span className="st-step__name">{l.name}</span>
                <span className="st-step__eth tabular">{level} ETH</span>
                <span className="st-step__line">{l.line}</span>
                {now ? (
                  <span className="st-step__meter" role="img" aria-label={`${escrow.toFixed(4)} of ${level} ETH collected`}>
                    <span className="st-step__bar">
                      <span style={{ width: `${fill * 100}%` }} />
                    </span>
                    <span className="st-step__read tabular">
                      {escrow.toFixed(4)} / {level} ETH
                    </span>
                  </span>
                ) : null}
                {i === 0 ? (
                  <span className="st-loop__arrow" aria-hidden="true">
                    <ArrowsClockwise weight="bold" />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="st-sum tabular">
          Of every full loop: <b>{stepShare(steps, "feeding")}%</b> to the ten seated holders, <b>{stepShare(steps, "keeper")}%</b> to the treasury.
        </p>
        <p className="st-plain">
          No buyback and no burn: the engine never buys, sells or destroys {TICKER}.
          {treasury ? (
            <>
              {" "}
              Treasury wallet:{" "}
              <a href={addrUrl(treasury)} target="_blank" rel="noreferrer" className="tabular">
                {short(treasury)} <ArrowUpRight weight="bold" aria-hidden="true" />
              </a>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}

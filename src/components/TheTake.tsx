import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowsClockwise, Bank, Coins, Fire, UsersThree } from "@phosphor-icons/react";
import { DEFAULT_STEPS, STEP, stepShare, type RoundKind, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { slamHead } from "../lib/press";
import { Folio } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ORDER: RoundKind[] = ["feeding", "keeper", "sink"];

export function TheTake({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const at = (k: RoundKind) => steps.find((s) => s.kind === k)?.thresholdETH ?? "0.01";
  const top = status?.rules.topN ?? 10;

  useGSAP(
    () => {
      slamHead(root.current!);
      if (prefersReducedMotion()) return;
      // The payout is laid out panel by panel, like a prospectus.
      gsap.from(".plan__panel, .plan__arrow", {
        opacity: 0,
        y: 26,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: ".plan", start: "top 82%" },
      });
      // The take is counted out: each part of the fees is laid on the table in order.
      gsap.from(".take__share", {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.18,
        scrollTrigger: { trigger: ".take__bar", start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section className="page take" id="payout" ref={root} aria-labelledby="take-head">
      <div className="wrap">
        <Folio page={2} label="Dividend desk" />
        <h2 className="page__head" id="take-head">
          How the dividend pays
        </h2>
        <p className="page__deck">Every trade pays a fee into the escrow. Old Money pays it out three ways, always in this order.</p>
        <p className="page__byline">By the Gazette dividend desk</p>

        <ol className="plan" aria-label="The payout, step by step">
          <li className="plan__panel is-loot">
            <Coins className="plan__icon" weight="duotone" aria-hidden="true" />
            <span className="plan__big">Every trade</span>
            <span className="plan__what">pays a fee into the escrow</span>
          </li>
          <li className="plan__arrow" aria-hidden="true">
            <ArrowRight weight="bold" />
          </li>
          <li className="plan__panel is-feeding">
            <UsersThree className="plan__icon" weight="duotone" aria-hidden="true" />
            <span className="plan__big tabular">{at("feeding")} ETH</span>
            <span className="plan__what">to the top {top} holders</span>
          </li>
          <li className="plan__arrow" aria-hidden="true">
            <ArrowRight weight="bold" />
          </li>
          <li className="plan__panel is-keeper">
            <Bank className="plan__icon" weight="duotone" aria-hidden="true" />
            <span className="plan__big tabular">{at("keeper")} ETH</span>
            <span className="plan__what">to the reserve</span>
          </li>
          <li className="plan__arrow" aria-hidden="true">
            <ArrowRight weight="bold" />
          </li>
          <li className="plan__panel is-sink">
            <Fire className="plan__icon" weight="duotone" aria-hidden="true" />
            <span className="plan__big tabular">{at("sink")} ETH</span>
            <span className="plan__what">buys $OLDM, retires it</span>
          </li>
          <li className="plan__again" aria-label="then it repeats">
            <ArrowsClockwise weight="bold" aria-hidden="true" />
            <span>repeat</span>
          </li>
        </ol>

        <div className="take__bar" role="img" aria-label={`Over one full round: ${ORDER.map((k) => `${STEP[k].name} ${stepShare(steps, k)} percent`).join(", ")}`}>
          {ORDER.map((k) => (
            <div key={k} className={`take__share is-${k}`} style={{ flex: `${stepShare(steps, k)} 1 0%` }}>
              <span className="take__pct tabular">{stepShare(steps, k)}%</span>
              <span className="take__name">{STEP[k].name}</span>
              <span className="take__eth tabular">{at(k)} ETH</span>
            </div>
          ))}
        </div>

        <blockquote className="take__quote">
          <p>Sell once = account closed. No dividend, ever.</p>
        </blockquote>
      </div>
    </section>
  );
}

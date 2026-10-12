/** House rules: four cards, and the count of wallets thrown out so far. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Armchair, Crown, HandCoins, SignOut } from "@phosphor-icons/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Rules({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const out = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".st-rule", { y: 60, rotate: (i) => [-4, 3, -3, 4][i % 4], opacity: 0, duration: 0.65, ease: "back.out(1.7)", stagger: 0.1, scrollTrigger: { trigger: ".st-rulegrid", start: "top 80%" } });
    },
    { scope: root },
  );
  return (
    <section className="st-sec st-rules" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="st-wrap">
        <h2 className="st-h2" id="rules-head">
          House rules
        </h2>
        <ul className="st-rulegrid">
          <li className="st-rule">
            <Armchair weight="fill" aria-hidden="true" />
            <b>Hold {min} {TICKER}</b>
            <span>to be let into the room.</span>
          </li>
          <li className="st-rule">
            <Crown weight="fill" aria-hidden="true" />
            <b>Biggest holder</b>
            <span>sits on the gold chair.</span>
          </li>
          <li className="st-rule">
            <HandCoins weight="fill" aria-hidden="true" />
            <b>The ten seated</b>
            <span>share every reward, in ETH.</span>
          </li>
          <li className="st-rule is-red">
            <SignOut weight="fill" aria-hidden="true" />
            <b>No selling</b>
            <span>One sale and you are thrown out. For good.</span>
          </li>
        </ul>
        <p className="st-rules__out">
          <b className="tabular">{out}</b> thrown out so far. Moving between your own wallets is not a sale.
        </p>
      </div>
    </section>
  );
}

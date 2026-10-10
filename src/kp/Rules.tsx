/** Safety rules: four signs on the wall, the way a site posts them, and the count spaghettified so far. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Mandatory, Prohibit, Safe, Warn } from "./Signs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Rules({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const out = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".rule-sign", { scale: 0.7, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.12, scrollTrigger: { trigger: ".rule-signs", start: "top 78%" } });
    },
    { scope: root },
  );
  return (
    <section className="safety" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="slab">
        <h2 className="hz-h2" id="rules-head">
          Safety rules
        </h2>
        <ul className="rule-signs">
          <li className="rule-sign">
            <Mandatory kind="coins" size={92} />
            <b>Hold {min} $HAWK</b>
            <span>to enter the site.</span>
          </li>
          <li className="rule-sign">
            <Warn kind="core" size={92} />
            <b>Biggest holder</b>
            <span>sits at the core.</span>
          </li>
          <li className="rule-sign">
            <Safe kind="hand" size={92} />
            <b>The top ten</b>
            <span>share every emission.</span>
          </li>
          <li className="rule-sign is-red">
            <Prohibit kind="sell" size={92} />
            <b>No selling</b>
            <span>One sale and you are spaghettified. For good.</span>
          </li>
        </ul>
        <p className="safety__out">
          <b className="tabular">{out}</b> spaghettified so far. Moving between your own wallets is not a sale.
        </p>
      </div>
    </section>
  );
}

/** The Laws: four rules set as numbered equations, and the count spaghettified so far. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Rules({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const out = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".law", { opacity: 0, x: -24, duration: 0.8, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".laws__list", start: "top 78%" } });
    },
    { scope: root },
  );
  const laws: [string, string][] = [
    [`m ≥ ${min} $VOID`, "you are in orbit."],
    ["max(m)", "is the Singularity."],
    ["the ten closest", "share every Pull."],
    ["one sale", "spaghettified. For good."],
  ];
  return (
    <section className="laws" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="frame laws__frame">
        <h2 className="vd-h2" id="rules-head">
          The laws.
        </h2>
        <ol className="laws__list">
          {laws.map(([k, v], i) => (
            <li key={k} className="law">
              <span className="law__eq">
                <i>{k}</i>
                <span className="law__to" aria-hidden="true">
                  {" "}
                  ⟹{" "}
                </span>
                <span className="sr-only"> means </span>
                {v}
              </span>
              <span className="law__n tabular">({i + 1})</span>
            </li>
          ))}
        </ol>
        <p className="laws__out">
          <b className="tabular">{out}</b> spaghettified so far. Moving between your own wallets is not a sale.
        </p>
      </div>
    </section>
  );
}

/** Flight Rules: four lines on the red diagonal, and the count ejected so far. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Eject } from "@phosphor-icons/react";
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
      gsap.from(".rules__field", { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", duration: 1.2, ease: "power4.inOut", scrollTrigger: { trigger: ".rules__field", start: "top 75%" } });
      gsap.from(".rule", { x: -40, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.1, delay: 0.4, scrollTrigger: { trigger: ".rules__field", start: "top 75%" } });
    },
    { scope: root },
  );
  const rules: [string, string][] = [
    [`${min} $ORBIT`, "gets you a seat."],
    ["The biggest holder", "commands the mission."],
    ["The top ten", "split every Supply Drop."],
    ["One sale", "and you're ejected. For good."],
  ];
  return (
    <section className="rules" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="rules__field">
        <h2 className="sr-h2" id="rules-head">
          Flight rules.
        </h2>
        <ol className="rules__list">
          {rules.map(([k, v], i) => (
            <li key={k} className="rule">
              <span className="rule__n tabular">{i + 1}</span>
              <span>
                <b>{k}</b> {v}
              </span>
            </li>
          ))}
        </ol>
        <p className="rules__out">
          <Eject weight="bold" aria-hidden="true" />
          <span>
            <b className="tabular">{out}</b> ejected so far. Moving between your own wallets is not a sale.
          </span>
        </p>
      </div>
    </section>
  );
}

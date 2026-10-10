/** The Pirate Code: four lines on the K flag's yellow half, and the count thrown overboard. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Flag } from "../components/Flag";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Rules({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const over = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // each article is stencilled on, left to right
      gsap.from(".article", { clipPath: "inset(0 100% 0 0)", duration: 0.9, ease: "power3.inOut", stagger: 0.14, scrollTrigger: { trigger: ".code__list", start: "top 78%" } });
    },
    { scope: root },
  );
  const rules: [string, string][] = [
    [`${min} $LOOT`, "gets you aboard."],
    ["The biggest stash", "takes the helm."],
    ["The top ten", "split every Plunder."],
    ["One sale", "and you walk the plank. For good."],
  ];
  return (
    <section className="code" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="code__half">
        <h2 className="sig-h2" id="rules-head">
          The Pirate Code.
        </h2>
        <ol className="code__list">
          {rules.map(([k, v], i) => (
            <li key={k} className="article">
              <span className="article__n tabular">{["I", "II", "III", "IV"][i]}</span>
              <span>
                <b>{k}</b> {v}
              </span>
            </li>
          ))}
        </ol>
        <p className="code__over">
          <Flag code="O" size={44} />
          <span>
            <b className="tabular">{over}</b> overboard so far. Moving between your own wallets is not a sale.
          </span>
        </p>
      </div>
    </section>
  );
}

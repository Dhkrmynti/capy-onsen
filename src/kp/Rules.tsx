/** The Law of the Hoard: four lines, and the count of the burned. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Piece } from "./Pieces";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Rules({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const burned = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".rule", { y: 24, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".rules__list", start: "top 80%" } });
    },
    { scope: root },
  );
  const rules: [string, string][] = [
    [`${min} $HOARD`, "lets you stand watch."],
    ["The biggest pile", "belongs to the dragon."],
    ["The top ten", "split every Haul."],
    ["One sale", "and you're burned. For good."],
  ];
  return (
    <section className="stop" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="panel panel--left">
        <h2 className="kp-h2" id="rules-head">
          The Law of the Hoard.
        </h2>
        <ol className="rules__list">
          {rules.map(([k, v]) => (
            <li key={k} className="rule">
              <b>{k}</b> {v}
            </li>
          ))}
        </ol>
        <p className="rules__burned">
          <Piece kind="pawn" lying size={30} />
          <span>
            <b className="tabular">{burned}</b> burned so far. Moving between your own wallets is not a sale.
          </span>
        </p>
      </div>
    </section>
  );
}

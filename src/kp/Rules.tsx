/** The rules of the board, five lines on one colour, each one a move you can make or lose. */
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
  const closed = status?.tokenAddress ? status.counts.hopped : 0;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".rule", { xPercent: -8, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: ".rules__list", start: "top 78%" } });
      gsap.from(".rules__tray .piece", { y: -60, rotate: -90, opacity: 0, duration: 0.7, ease: "bounce.out", stagger: 0.05, scrollTrigger: { trigger: ".rules__tray", start: "top 90%" } });
    },
    { scope: root },
  );

  const rules: [string, string][] = [
    [`${min} $KING`, "puts you on the board."],
    ["Most $KING", "wears the crown."],
    ["Top 10", "split every Tribute."],
    ["One sale", "and you're captured. For good."],
    ["Founder", "is on the board, never paid."],
  ];

  return (
    <section className="kp-section rules" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="kp-wrap">
        <h2 className="kp-h2 is-huge" id="rules-head">
          Rules of the board.
        </h2>
        <ol className="rules__list">
          {rules.map(([k, v]) => (
            <li key={k} className="rule">
              <b>{k}</b> <span>{v}</span>
            </li>
          ))}
        </ol>
        <div className="rules__tray" aria-label={`${closed} wallets captured for selling`}>
          <div className="rules__pieces" aria-hidden="true">
            {Array.from({ length: Math.min(12, Math.max(3, closed)) }, (_, i) => (
              <Piece key={i} kind={i % 5 === 0 ? "knight" : "pawn"} tone="violet" size={34} lying />
            ))}
          </div>
          <p>
            <b className="tabular">{closed}</b> captured so far. Moving between your own wallets is not a sale.
          </p>
        </div>
      </div>
    </section>
  );
}

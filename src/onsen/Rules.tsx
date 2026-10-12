/**
 * House rules: four wooden tags on a rail, the way a bathhouse hangs its notices, and the count
 * of wallets that got out so far. Two paper doors slide apart as you arrive.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
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
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root.current, start: "top 88%", end: "top 22%", scrub: 0.5 } })
        .to(".door__l", { xPercent: -101 }, 0)
        .to(".door__r", { xPercent: 101 }, 0);
      // each tag is hung on its peg and swings to rest
      gsap.from(".plaque", { rotate: (i) => [-16, 12, -10, 15][i % 4], opacity: 0, duration: 1.5, ease: "elastic.out(1, 0.35)", stagger: 0.12, scrollTrigger: { trigger: ".rail", start: "top 70%" } });
    },
    { scope: root },
  );
  return (
    <section className="sec rules" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="door" aria-hidden="true">
        <i className="door__l" />
        <i className="door__r" />
      </div>
      <div className="wrap">
        <h2 className="h2" id="rules-head">
          House rules
        </h2>
        <ul className="rail">
          <li className="plaque">
            <span className="plaque__n">1</span>
            <b>
              Hold {min} {TICKER}
            </b>
            <span>to be let into the bathhouse.</span>
          </li>
          <li className="plaque">
            <span className="plaque__n">2</span>
            <b>The biggest holder</b>
            <span>wears the yuzu.</span>
          </li>
          <li className="plaque">
            <span className="plaque__n">3</span>
            <b>The ten in the water</b>
            <span>share every reward, in ETH.</span>
          </li>
          <li className="plaque is-red">
            <span className="plaque__n">4</span>
            <b>No getting out</b>
            <span>Sell once and you are out in the cold. For good.</span>
          </li>
        </ul>
        <p className="rules__out">
          <b className="num">{out}</b> got out so far. Moving between your own wallets is not a sale.
        </p>
      </div>
    </section>
  );
}

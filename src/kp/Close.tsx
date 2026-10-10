/** The close: liftoff. One line, the buy, the address, the way out. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "../components/Bits";
import { Mark } from "./Pieces";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Close({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const ca = DEMO ? "" : status?.tokenAddress;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".close__h .ln", { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".close__h", start: "top 85%" } });
    },
    { scope: root },
  );
  return (
    <footer className="close" id="closing" ref={root} aria-label="Closing">
      <div className="close__field">
        <p className="close__h">
          <span className="mask">
            <span className="ln">We have</span>
          </span>
          <span className="mask">
            <span className="ln">liftoff.</span>
          </span>
        </p>
        <div className="close__acts">
          <BuyButton status={status} />
          <CaCoupon status={status} compact={narrow} />
        </div>
        <nav className="close__links" aria-label="Elsewhere">
          {X_URL ? (
            <a href={X_URL} target="_blank" rel="noreferrer">
              <XLogo weight="bold" aria-hidden="true" /> Orbiters on X <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href="#rules">Flight rules</a>
          <a href="#record">Mission log</a>
        </nav>
        <p className="close__sig">
          <Mark size={22} /> Orbiters · $ORBIT · Robinhood Chain
        </p>
      </div>
    </footer>
  );
}

/** The close: the dragon is awake. One line, the buy, the address, the way out. */
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
    <footer className="stop stop--close" id="closing" ref={root} aria-label="Closing">
      <div className="panel panel--close">
        <p className="close__h">
          <span className="mask">
            <span className="ln">The dragon</span>
          </span>
          <span className="mask">
            <span className="ln is-gold">is watching.</span>
          </span>
        </p>
        <div className="close__acts">
          <BuyButton status={status} />
          <CaCoupon status={status} compact={narrow} />
        </div>
        <nav className="close__links" aria-label="Elsewhere">
          {X_URL ? (
            <a href={X_URL} target="_blank" rel="noreferrer">
              <XLogo weight="bold" aria-hidden="true" /> The Hoard on X <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href="#rules">The Law</a>
          <a href="#record">Chronicle</a>
        </nav>
        <p className="close__sig">
          <Mark size={22} /> The Hoard · $HOARD · Robinhood Chain
        </p>
      </div>
    </footer>
  );
}

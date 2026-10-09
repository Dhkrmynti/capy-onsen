/** The close: one line, the buy, the address, and the way out. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "../components/Bits";
import { Mark, Piece } from "./Pieces";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Close({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const ca = DEMO ? "" : status?.tokenAddress;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".close__h .ln", { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".close__h", start: "top 85%" } });
      gsap.from(".close__king", { y: 120, rotate: 20, duration: 1.2, ease: "back.out(1.6)", scrollTrigger: { trigger: ".close__h", start: "top 85%" } });
    },
    { scope: root },
  );
  return (
    <footer className="close" ref={root} aria-label="Closing">
      <div className="kp-wrap">
        <Piece kind="king" tone="crown" size={narrow ? 120 : 180} className="close__king" />
        <p className="close__h">
          <span className="mask">
            <span className="ln">Hold the</span>
          </span>
          <span className="mask">
            <span className="ln">board.</span>
          </span>
        </p>
        <div className="close__acts">
          <BuyButton status={status} />
          <CaCoupon status={status} compact={narrow} />
        </div>
        <nav className="close__links" aria-label="Elsewhere">
          <a href={X_URL} target="_blank" rel="noreferrer">
            <XLogo weight="bold" aria-hidden="true" /> Kingpin on X <ArrowUpRight weight="bold" aria-hidden="true" />
          </a>
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href="#rules">Rules</a>
          <a href="#record">Record</a>
        </nav>
        <p className="close__sig">
          <Mark size={22} /> Kingpin · $KING · Robinhood Chain
        </p>
      </div>
    </footer>
  );
}

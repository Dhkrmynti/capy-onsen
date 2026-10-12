/** The close: one line, the buy, the address, the way out. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "../components/Bits";
import { CHAIN, NAME, TICKER } from "../lib/brand";
import { Mark } from "./Pieces";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Close({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const ca = DEMO ? "" : status?.tokenAddress;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".st-close__h .ln", { yPercent: 110, duration: 0.9, ease: "back.out(1.5)", stagger: 0.1, scrollTrigger: { trigger: ".st-close__h", start: "top 88%" } });
    },
    { scope: root },
  );
  return (
    <footer className="st-sec st-close" id="closing" ref={root} aria-label="Closing">
      <div className="st-wrap">
        <p className="st-close__h">
          <span className="mask">
            <span className="ln">Take a seat.</span>
          </span>
          <span className="mask">
            <span className="ln">Keep it.</span>
          </span>
        </p>
        <div className="st-close__acts">
          <BuyButton status={status} className="is-ink" />
          <CaCoupon status={status} compact={narrow} />
        </div>
        <nav className="st-close__links" aria-label="Elsewhere">
          {X_URL ? (
            <a href={X_URL} target="_blank" rel="noreferrer">
              <XLogo weight="bold" aria-hidden="true" /> {NAME} on X <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href="#rules">House rules</a>
          <a href="#record">Receipts</a>
        </nav>
        <p className="st-close__sig">
          <Mark size={22} /> {NAME} · {TICKER} · {CHAIN}
        </p>
      </div>
    </footer>
  );
}

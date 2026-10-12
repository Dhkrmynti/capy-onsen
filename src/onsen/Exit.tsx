/** The way out, which nobody takes: one line, the buy, the address, and a capybara that will not move. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { CHAIN, NAME, TICKER } from "../lib/brand";
import { BuyButton, CaCopy, useMedia } from "./Bits";
import { CapyHead, Mark } from "./Capy";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Exit({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const ca = DEMO ? "" : status?.tokenAddress;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the last capybara surfaces as the page runs out, and the line is spoken a word at a time
      gsap.from(".exit__capy", { yPercent: 62, ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom bottom", scrub: 0.5 } });
      gsap.from(".exit__h span", { yPercent: 60, opacity: 0, duration: 0.6, ease: "back.out(1.6)", stagger: 0.09, scrollTrigger: { trigger: ".exit__h", start: "top 85%" } });
    },
    { scope: root },
  );
  return (
    <footer className="sec exit" id="closing" ref={root} aria-label="Closing">
      <div className="wrap">
        <p className="exit__h">
          <span>Don't</span> <span>get</span> <span>out.</span>
        </p>
        <div className="exit__acts">
          <BuyButton status={status} className="is-ink" />
          <CaCopy status={status} compact={narrow} />
        </div>
        <nav className="exit__links" aria-label="Elsewhere">
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
          <a href="#ledger">Ledger</a>
        </nav>
        <p className="exit__sig">
          <Mark size={22} /> {NAME} · {TICKER} · {CHAIN}
        </p>
      </div>
      <svg className="exit__capy" viewBox="0 -14 100 112" aria-hidden="true">
        <CapyHead traits={[0, 0, 0, 0]} yuzu />
      </svg>
      <svg className="exit__water" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 V20 Q75 0 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20 V40 Z" fill="#9fd3cc" />
        <path d="M0 20 Q75 0 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20" fill="none" stroke="#1a1814" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
    </footer>
  );
}

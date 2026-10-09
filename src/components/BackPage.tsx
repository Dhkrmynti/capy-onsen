import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "./Bits";
import { Band, Monogram } from "./Engrave";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function BackPage({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const ca = DEMO ? "" : status?.tokenAddress;
  const narrow = useMedia("(max-width: 760px)");
  const min = Number(status?.rules.minBalance ?? "100000").toLocaleString("en-US");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".closing__line", { yPercent: 100, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".closing", start: "top 82%" } });
    },
    { scope: root },
  );

  return (
    <footer className="stop stop--close foot" ref={root} aria-label="Closing">
      <div className="h-wrap">
        <div className="closing" id="closing">
          <Monogram size={84} className="closing__mono" />
          <p className="closing__head">
            <span className="closing__mask">
              <span className="closing__line">An heirloom</span>
            </span>
            <span className="closing__mask">
              <span className="closing__line is-gilt">is never sold.</span>
            </span>
          </p>
          <p className="closing__deck">Hold {min} $HEIR and join the family. The door closes behind you.</p>
          <div className="closing__deal">
            <BuyButton status={status} />
            <CaCoupon status={status} compact={narrow} />
          </div>
        </div>

        <Band className="foot__band" />

        <nav className="foot__links" aria-label="Elsewhere">
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart on DexScreener <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href={X_URL} target="_blank" rel="noreferrer">
            <XLogo weight="bold" aria-hidden="true" /> The house on X <ArrowUpRight weight="bold" aria-hidden="true" />
          </a>
          <a href="#rules">The will</a>
          <a href="#blotter">Statement</a>
        </nav>

      </div>
    </footer>
  );
}

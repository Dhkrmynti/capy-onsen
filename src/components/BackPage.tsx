import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEMO, X_URL, dexUrl, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "./Bits";
import { Band, Monogram } from "./Engrave";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function BackPage({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const ca = DEMO ? "" : status?.tokenAddress;
  const narrow = useMedia("(max-width: 760px)");
  const keep = stepShare(status?.cycle.steps ?? DEFAULT_STEPS, "keeper");
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
              <span className="closing__line">Old money</span>
            </span>
            <span className="closing__mask">
              <span className="closing__line is-gilt">never sells.</span>
            </span>
          </p>
          <p className="closing__deck">Open an account with {min} $OLDM. The door closes behind you.</p>
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
          <a href="#rules">Conditions of account</a>
          <a href="#blotter">Statement</a>
        </nav>

        <p className="foot__fine">
          <strong>Important.</strong> $OLDM is a memecoin with no promise of value. It is not a security, a deposit or an investment, and there is no company behind it. &ldquo;The dividend&rdquo; is only this site&rsquo;s name for trading fees passed to the ten largest holders, and those fees can fall to nothing. The reserve ({keep}% of all fees) goes to the creator&rsquo;s wallet; every transfer is listed on the statement. Old Money is not a bank and holds no one&rsquo;s funds.
        </p>
      </div>
    </footer>
  );
}

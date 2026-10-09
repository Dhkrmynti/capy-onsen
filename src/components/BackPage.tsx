import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEMO, X_URL, dexUrl, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, Folio, useMedia } from "./Bits";
import { Halftone } from "./Halftone";

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
      // The classifieds are pasted in, smallest last; the closing line slams like the front.
      gsap.from(".ad", { y: 30, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: ".ads", start: "top 80%" } });
      gsap.from(".back__close span", { scale: 1.2, filter: "blur(8px)", opacity: 0, transformOrigin: "50% 70%", duration: 0.9, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".back__close", start: "top 85%" } });
    },
    { scope: root },
  );

  return (
    <footer className="page back" ref={root} aria-label="Back page">
      <div className="wrap">
        <h2 className="sr-only">Classifieds</h2>
        <Folio page={7} label="Classifieds" />
        <div className="ads">
          <article className="ad ad--lead">
            <h3>Now opening: accounts</h3>
            <p>
              Hold {min} $OLDM. Never sell. Paid in ETH, every dividend.
            </p>
            <div className="ad__deal">
              <BuyButton status={status} />
              <CaCoupon status={status} compact={narrow} />
            </div>
          </article>
          <article className="ad ad--lost">
            <h3>Lost</h3>
            <p>One bag, sold at the bottom. Account closed.</p>
          </article>
          <article className="ad ad--sale">
            <h3>For sale</h3>
            <p>Nothing. Old money doesn&rsquo;t sell.</p>
          </article>
          <article className="ad ad--notice">
            <h3>Public notice</h3>
            <p>Not a security. The &ldquo;dividend&rdquo; is trading fees, not company profit.</p>
          </article>
        </div>

        <div className="back__end">
          <Halftone className="back__photo" label="The banded notes, still held." />
          <p className="back__close">
            <span>Still</span> <span>holding.</span>
          </p>
        </div>

        <nav className="back__links" aria-label="Elsewhere">
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart on DexScreener <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href={X_URL} target="_blank" rel="noreferrer">
            <XLogo weight="bold" aria-hidden="true" /> The Gazette on X <ArrowUpRight weight="bold" aria-hidden="true" />
          </a>
          <a href="#rules">Read the terms again</a>
        </nav>

        <p className="back__fine">
          <strong>Corrections and clarifications.</strong> $OLDM is a memecoin with no promise of value. It is not a security, a deposit or an investment, and there is no company behind it. &ldquo;The dividend&rdquo; is only the paper&rsquo;s name for trading fees passed to the 10 biggest holders, and those fees can drop to nothing. The reserve ({keep}% of all fees) goes to the creator&rsquo;s wallet, and every transfer is entered on the statement. Old Money is not a bank.
        </p>
      </div>
    </footer>
  );
}

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Status } from "../lib/api";
import { BuyButton } from "./Bits";
import { ConnectButton } from "./Connect";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PAGES = [
  ["#payout", "The dividend"],
  ["#rules", "Terms"],
  ["#card", "Your account"],
  ["#register", "The register"],
  ["#blotter", "Statement"],
] as const;

/** The running head: appears once the big front-page masthead has scrolled away. */
export function Masthead({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ".masthead", start: "bottom top", end: "max", toggleClass: { targets: root.current!, className: "is-shown" } });
  });
  return (
    <header className="runhead" ref={root}>
      <div className="wrap runhead__inner">
        <a className="runhead__name" href="#top" aria-label="The Old Money Gazette, back to the front page">
          <span className="runhead__long">The Old Money Gazette</span>
          <span className="runhead__short">Old Money</span>
        </a>
        <nav className="runhead__index" aria-label="Pages">
          {PAGES.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="runhead__acts">
          <ConnectButton />
          <BuyButton status={status} className="is-small" />
        </div>
      </div>
    </header>
  );
}

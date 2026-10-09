import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Status } from "../lib/api";
import { BuyButton } from "./Bits";
import { ConnectButton } from "./Connect";
import { Monogram } from "./Engrave";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PAGES = [
  ["#payout", "The dividend"],
  ["#rules", "Conditions"],
  ["#register", "The ledger"],
  ["#card", "Your account"],
  ["#blotter", "Statement"],
] as const;

/** The office's brass nameplate: clear over the hero, set on leather once you scroll. */
export function Masthead({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    ScrollTrigger.create({ start: 80, end: "max", toggleClass: { targets: root.current!, className: "is-solid" } });
  });
  return (
    <header className="plate" ref={root}>
      <div className="h-wrap plate__inner">
        <a className="plate__name" href="#top" aria-label="Old Money, back to the top">
          <Monogram size={34} className="plate__mono" />
          <span>
            <b>Old Money</b>
            <i>Private Office</i>
          </span>
        </a>
        <nav className="plate__nav" aria-label="Sections">
          {PAGES.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="plate__acts">
          <ConnectButton />
          <BuyButton status={status} className="is-small" />
        </div>
      </div>
    </header>
  );
}

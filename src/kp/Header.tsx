/** The masthead: a floating bar with the name, the five sections and the way in. */
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { NAME, TICKER } from "../lib/brand";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Mark } from "./Pieces";

export const NAV: [string, string][] = [
  ["row", "The row"],
  ["round", "The loop"],
  ["rules", "House rules"],
  ["card", "Your ticket"],
  ["record", "Receipts"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }));
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  return (
    <header className="st-head">
      <a className="st-head__brand" href="#top" aria-label={`${NAME}, back to the top`}>
        <Mark size={34} />
        <span className="st-head__word">{NAME}</span>
        <span className="st-head__tick">{TICKER}</span>
      </a>
      <nav className="st-nav" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-on" : ""} aria-current={on === id ? "location" : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <div className="st-head__acts">
        {X_URL ? (
          <a className="st-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label={`${NAME} on X`} title={`${NAME} on X`}>
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

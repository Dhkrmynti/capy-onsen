/** The masthead: the mark, the name, the five figures of the page, and the way in. */
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Mark } from "./Pieces";

export const NAV: [string, string][] = [
  ["ladder", "The orbit"],
  ["round", "The cycle"],
  ["rules", "The laws"],
  ["card", "Your orbit"],
  ["record", "Observations"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }));
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  return (
    <header className="vd-head">
      <a className="vd-head__brand" href="#top" aria-label="Horizon, back to the top">
        <Mark size={34} />
        <span className="vd-head__word">Horizon</span>
      </a>
      <nav className="vd-nav" aria-label="Sections">
        {NAV.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-on" : ""} aria-current={on === id ? "location" : undefined}>
            <span className="vd-nav__n tabular">{i + 2}</span>
            {label}
          </a>
        ))}
      </nav>
      <div className="vd-head__acts">
        {X_URL ? (
          <a className="vd-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label="Horizon on X" title="Horizon on X">
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

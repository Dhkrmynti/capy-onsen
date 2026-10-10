/** The masthead: the mark, the mission name, the five sections, and the way in. */
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Mark } from "./Pieces";

export const NAV: [string, string][] = [
  ["ladder", "Crew"],
  ["round", "Flight plan"],
  ["rules", "Flight rules"],
  ["card", "Your seat"],
  ["record", "Mission log"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }));
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  return (
    <header className="sr-head">
      <a className="sr-head__brand" href="#top" aria-label="Orbiters, back to the top">
        <Mark size={38} />
        <span className="sr-head__word">Orbiters</span>
      </a>
      <nav className="sr-nav" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-on" : ""} aria-current={on === id ? "location" : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <div className="sr-head__acts">
        {X_URL ? (
          <a className="sr-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label="Orbiters on X" title="Orbiters on X">
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

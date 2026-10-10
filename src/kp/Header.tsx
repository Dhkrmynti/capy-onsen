/** The masthead: black bar on a strip of hazard tape, the facility's name, its five areas, the way in. */
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Mark } from "./Pieces";

export const NAV: [string, string][] = [
  ["ladder", "Exposure"],
  ["round", "Emission"],
  ["rules", "Safety"],
  ["card", "Dosimeter"],
  ["record", "Incidents"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }));
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  return (
    <header className="hz-head">
      <a className="hz-head__brand" href="#top" aria-label="Hawking, back to the top">
        <Mark size={34} />
        <span className="hz-head__word">Hawking</span>
        <span className="hz-head__tick">$HAWK</span>
      </a>
      <nav className="hz-nav" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-on" : ""} aria-current={on === id ? "location" : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <div className="hz-head__acts">
        {X_URL ? (
          <a className="hz-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label="Hawking on X" title="Hawking on X">
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

/**
 * The halyard: every section flies as its own signal flag on one line across the top. The flag
 * of the section you are in is hoisted; tap any flag to go there.
 */
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import type { FlagCode } from "../lib/flags";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Flag } from "../components/Flag";

export const NAV: [string, FlagCode, string][] = [
  ["ladder", "C", "Crew"],
  ["round", "P", "Plunder"],
  ["rules", "K", "Code"],
  ["card", "S", "Your share"],
  ["record", "L", "Log"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) =>
      ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }),
    );
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  return (
    <header className="sig-head">
      <a className="sig-head__brand" href="#top" aria-label="Plunders, back to the top">
        <span className="sig-head__hoist" aria-hidden="true">
          {(["L", "O", "O", "T"] as FlagCode[]).map((c, i) => (
            <Flag key={i} code={c} size={22} />
          ))}
        </span>
        <span className="sig-head__word">Plunders</span>
      </a>
      <nav className="halyard" aria-label="Sections">
        {NAV.map(([id, code, label]) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-up" : ""} aria-current={on === id ? "location" : undefined}>
            <Flag code={code} size={26} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="sig-head__acts">
        {X_URL ? (
          <a className="sig-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label="Plunders on X" title="Plunders on X">
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

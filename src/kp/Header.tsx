import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Mark } from "./Pieces";

const NAV = [
  ["#ladder", "Ladder"],
  ["#round", "Round"],
  ["#rules", "Rules"],
  ["#card", "Your seat"],
  ["#record", "Record"],
];

export function Header({ status }: { status: Status | null }) {
  return (
    <header className="kp-head">
      <a className="kp-head__brand" href="#top" aria-label="Kingpin, back to the top">
        <Mark size={36} />
        <span className="kp-head__word">KINGPIN</span>
      </a>
      <nav className="kp-head__nav" aria-label="Sections">
        {NAV.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="kp-head__acts">
        <a className="kp-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label="Kingpin on X" title="Kingpin on X">
          <XLogo weight="bold" aria-hidden="true" />
        </a>
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

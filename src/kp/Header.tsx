import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { BuyButton } from "../components/Bits";
import { ConnectButton } from "../components/Connect";
import { Mark } from "./Pieces";

const NAV = [
  ["#ladder", "Keepers"],
  ["#round", "The Haul"],
  ["#rules", "The Law"],
  ["#card", "Your hoard"],
  ["#record", "Chronicle"],
];

export function Header({ status }: { status: Status | null }) {
  return (
    <header className="kp-head">
      <a className="kp-head__brand" href="#top" aria-label="The Hoard, back to the top">
        <Mark size={36} />
        <span className="kp-head__word">THE HOARD</span>
      </a>
      <nav className="kp-head__nav" aria-label="Sections">
        {NAV.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="kp-head__acts">
        {X_URL ? (
          <a className="kp-x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label="The Hoard on X" title="The Hoard on X">
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

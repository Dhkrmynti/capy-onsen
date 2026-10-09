import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Copy, Check } from "@phosphor-icons/react";
import { DEMO, ponsUrl, short, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(useGSAP);

export function useNow(everyMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** The one primary action on the page. Same label everywhere. */
export function BuyButton({ status, className = "" }: { status: Status | null; className?: string }) {
  // The illustration edition never prints a buy link or a contract address: a made-up CA is a trap.
  const ca = DEMO ? "" : status?.tokenAddress;
  if (!ca)
    return (
      <span className={`press-btn is-waiting ${className}`} aria-disabled="true">
        <span className="btn__long">Opens at launch</span>
        <span className="btn__short">Soon</span>
      </span>
    );
  return (
    <a className={`press-btn ${className}`} href={ponsUrl(ca)} target="_blank" rel="noreferrer">
      <span className="btn__long">Buy $HOARD</span>
      <span className="btn__short">Buy</span> <ArrowUpRight weight="bold" aria-hidden="true" />
    </a>
  );
}

/** The contract address as a clip-out coupon. Tap to copy. */
export function CaCoupon({ status, compact = false }: { status: Status | null; compact?: boolean }) {
  const ca = DEMO ? "" : status?.tokenAddress || "";
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!ca) return;
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the address is still selectable */
    }
  };
  return (
    <button type="button" className={`coupon ${compact ? "is-compact" : ""}`} onClick={copy} disabled={!ca} aria-label={ca ? `Copy contract address ${ca}` : "Contract address not live yet"}>
      
      <span className="coupon__k">CA</span>
      <span className="coupon__v tabular">{ca ? (compact ? short(ca) : ca) : "at launch"}</span>
      <span className="coupon__a" aria-hidden="true">
        {copied ? <Check weight="bold" /> : <Copy weight="bold" />}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}

/** Running page head on the inner pages: paper name left, page number right. */
export function Folio({ page, label }: { page: number; label: string }) {
  return (
    <p className="folio" aria-hidden="true">
      <span>Heirloom</span>
      <span>{label}</span>
      <span className="tabular">Page {page}</span>
    </p>
  );
}

/**
 * The escrow as a lit fuse: a twisted cord burning from the left. The charred length is
 * how much fee has gathered toward the next step; the flame sits on the burning end.
 */
export function Fuse({ value, target, label }: { value: number; target: number; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pct = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
  useGSAP(
    () => {
      const to = { "--burn": `${pct * 100}%` } as gsap.TweenVars;
      if (prefersReducedMotion()) gsap.set(root.current, to);
      else gsap.to(root.current, { ...to, duration: 1.4, ease: "power3.out" });
    },
    { scope: root, dependencies: [pct] },
  );
  return (
    <div className="fuse" ref={root} role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value} aria-label={label}>
      <div className="fuse__cord" aria-hidden="true">
        <span className="fuse__ash" />
        <span className="fuse__char" />
        <svg className="fuse__flame" viewBox="0 0 24 32">
          <path className="fuse__flame-out" d="M12 1 C 17 9 22 13 20 22 C 18.5 28 15 31 12 31 C 9 31 5.5 28 4 22 C 2 13 7 9 12 1 Z" />
          <path className="fuse__flame-in" d="M12 12 C 14.5 16 17 18 16 23 C 15.3 26 13.8 28 12 28 C 10.2 28 8.7 26 8 23 C 7 18 9.5 16 12 12 Z" />
        </svg>
      </div>
    </div>
  );
}

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, STEP, amount, eth, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton, CaCoupon, useMedia } from "./Bits";

gsap.registerPlugin(useGSAP);

/** The opening line is the engine's state, in plain words. */
function story(status: Status | null, offline: boolean) {
  if (offline) return { head: "The office is closed for now.", deck: "The engine isn't answering. Nothing is shown rather than old figures." };
  if (!status || !status.tokenAddress) return { head: "Patient money, paid in ETH.", deck: "Every trade pays an inheritance to the ten largest holders. Sell once and you are written out of the will." };
  if (status.rounds === 0) return { head: "The vault is open.", deck: "Every trade adds to the first inheritance. It is paid the moment the escrow fills." };
  return { head: "The inheritance is paid, again.", deck: `${eth(status.totals.fedETH)} paid to the Ten Heirs so far. ${status.counts.hopped} disinherited got nothing.` };
}

export function FrontPage({ status, offline }: { status: Status | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const { head, deck } = story(status, offline);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const target = parseFloat(next.thresholdETH);
  const live = !!status?.tokenAddress;
  const pct = live && target > 0 ? Math.min(1, escrow / target) : 0;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The plaque is lit first, then the words are set on it; the gauge needle settles last.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".plaque--door", { clipPath: "inset(0 0 100% 0)", duration: 1.1 })
        .from(".door__head, .door__deck, .door__deal, .door__line", { y: 22, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.6");
      gsap.to(".door__cue svg", { y: 6, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: root },
  );

  return (
    <section className="stop stop--door" id="top" ref={root} aria-label="Heirloom: the vault door">
      <div className="h-wrap stop__inner">
        <div className="plaque plaque--door">
          <h1 className="door__head">{head}</h1>
          <p className="door__deck">{deck}</p>
          <div className="door__deal">
            <BuyButton status={status} />
            <a className="h-btn is-ghost" href="#card">
              Check your standing
            </a>
          </div>
          <div className="door__deal">
            <CaCoupon status={status} compact={narrow} />
          </div>
          <p className="door__line tabular" role="status">
            <span>{offline ? "No signal from the engine" : `Next ${STEP[next.kind].name.toLowerCase().replace(/^the /, "")}: ${live ? `${escrow.toFixed(4)} of ${next.thresholdETH} ETH` : `at ${next.thresholdETH} ETH`}`}</span>
            {pct >= 0.85 ? <b> · about to be paid</b> : null}
            <span className="door__sep"> · </span>
            <span>{live ? `${amount(status!.counts.sitters)} in the family, ${status!.counts.hopped} disinherited` : "the gauge on the door shows the escrow"}</span>
          </p>
        </div>
      </div>
      <a className="door__cue" href="#payout">
        Turn the wheel <ArrowDown weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}

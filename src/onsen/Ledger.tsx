/** The ledger at the counter: every step the engine ran, newest first, each with the transaction that proves it. */
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { STEP, dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Ledger({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed" && STEP[r.kind]).slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);
  const t = status?.totals;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the totals are written in one after the other, like a brush down the page
      gsap.from(".totals > *", { clipPath: "inset(0 100% 0 0)", duration: 0.9, ease: "power3.out", stagger: 0.14, scrollTrigger: { trigger: ".totals", start: "top 80%" } });
    },
    { scope: root },
  );

  return (
    <section className="sec ledger" id="ledger" ref={root} aria-labelledby="ledger-head">
      <div className="wrap">
        <h2 className="h2" id="ledger-head">
          The ledger
        </h2>
        <p className="totals">
          <span>
            <b className="num">{eth(t?.fedETH ?? "0")}</b> paid to the ten in the bath
          </span>
          <span>
            <b className="num">{eth(t?.keeperETH ?? "0")}</b> to the treasury
          </span>
        </p>
        {shown.length ? (
          <ol className="entries">
            {shown.map((r) => {
              const done = r.stage === "done";
              const what = r.kind === "feeding" ? `paid to ${r.recipients || 10} holders` : "to the treasury wallet";
              const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
              const tx = r.kind === "feeding" ? r.claimTx : r.treasuryTx;
              return (
                <li key={r.n} className={`entry is-${r.kind} ${done ? "" : "is-open"}`}>
                  <span className="entry__n num">#{r.n}</span>
                  <span className="entry__what">
                    <b>{STEP[r.kind].name}</b> {what}
                  </span>
                  <span className="entry__eth num">{parseFloat(value).toFixed(4)} ETH</span>
                  <span className="entry__when num">{dateWib(r.at)}</span>
                  {done && tx ? (
                    <a className="entry__tx num" href={txUrl(tx)} target="_blank" rel="noreferrer">
                      {tx.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="entry__tx is-pending">pending</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="ledger__empty">Nothing yet. The first reward runs when the creator fees reach {status?.cycle.steps[0].thresholdETH ?? "0.02"} ETH.</p>
        )}
        {all.length > shown.length ? (
          <button type="button" className="btn is-paperline ledger__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier
          </button>
        ) : null}
      </div>
    </section>
  );
}

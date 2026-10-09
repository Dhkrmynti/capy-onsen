import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { DEFAULT_STEPS, amount, dateWib, demoRounds, eth, stepShare, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const KIND: Record<RoundRow["kind"], string> = { feeding: "Inheritance", keeper: "Upkeep", sink: "Hearth" };

/** One line of the statement: what moved, where to, and the transaction that proves it. */
function Line({ r }: { r: RoundRow }) {
  const done = r.stage === "done";
  const what =
    r.kind === "feeding"
      ? `Paid to ${r.recipients ? `${r.recipients} of the Ten Heirs` : "the Ten Heirs"}`
      : r.kind === "keeper"
        ? "Transferred to the reserve"
        : done
          ? `${amount(r.tokensBurned)} $HEIR bought and burned`
          : "Buying back";
  const value = r.kind === "sink" ? r.spentETH : done && r.kind === "feeding" ? r.fedETH : r.spentETH;
  return (
    <tr className={`stmt__line is-${r.kind} ${done ? "" : "is-open"}`}>
      <td className="tabular stmt__date">{dateWib(r.at)}</td>
      <td className="tabular stmt__ref">No. {r.n}</td>
      <td>
        <span className="stmt__kind">{KIND[r.kind]}</span>
        <span className="stmt__what">{what}</span>
      </td>
      <td className="num tabular stmt__amt">{parseFloat(value).toFixed(4)} ETH</td>
      <td className="num">
        {done && r.tx ? (
          <a className="stmt__tx tabular" href={txUrl(r.tx)} target="_blank" rel="noreferrer">
            {r.tx.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
          </a>
        ) : (
          <span className="stmt__pending">pending</span>
        )}
      </td>
    </tr>
  );
}

export function Blotter({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const t = status?.totals;
  const keep = stepShare(status?.cycle.steps ?? DEFAULT_STEPS, "keeper");
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  // A failed claim is retried as a new round, so it never shows here.
  const all = (rounds ?? []).filter((r) => r.stage !== "failed").slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !shown.length) return;
      gsap.from(".stmt__line", { opacity: 0, y: 10, duration: 0.5, ease: "power3.out", stagger: 0.05, scrollTrigger: { trigger: ".stmt", start: "top 82%" } });
      gsap.from(".totals__cell", { opacity: 0, y: 18, duration: 0.7, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".totals", start: "top 85%" } });
    },
    { scope: root, dependencies: [shown.length > 0] },
  );

  return (
    <section className="stop stop--tall statement" id="blotter" ref={root} aria-labelledby="stmt-head">
      <div className="h-wrap stop__inner">
        <div className="plaque plaque--slip">
          <h2 className="plaque__head" id="stmt-head">
            The statement.
          </h2>
          <p className="plaque__deck">Every payment carries its transaction. No transaction, no payment.</p>

        <dl className="totals">
          <div className="totals__cell">
            <dt>Inherited</dt>
            <dd className="tabular">{eth(t?.fedETH ?? "0")}</dd>
          </div>
          <div className="totals__cell">
            <dt>To the reserve ({keep}%)</dt>
            <dd className="tabular">{eth(t?.keeperETH ?? "0")}</dd>
          </div>
          <div className="totals__cell">
            <dt>Notes retired</dt>
            <dd className="tabular">{amount(t?.tokensBurned ?? "0")} $HEIR</dd>
          </div>
        </dl>

        <div className="stmt-sheet">
          {shown.length ? (
            <table className="stmt">
              <caption className="sr-only">Statement of payments made by the house, newest first</caption>
              <thead>
                <tr>
                  <th scope="col">Date (WIB)</th>
                  <th scope="col">Ref.</th>
                  <th scope="col">Description</th>
                  <th scope="col" className="num">
                    Amount
                  </th>
                  <th scope="col" className="num">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <Line key={r.n} r={r} />
                ))}
              </tbody>
            </table>
          ) : (
            <p className="book__empty">Nothing entered yet. The first line is written when the escrow reaches {status?.cycle.steps[0].thresholdETH ?? "0.01"} ETH and the first inheritance is paid.</p>
          )}
          {shown.length && all.length > shown.length ? (
            <button type="button" className="h-btn is-ink is-small book__more" onClick={() => setMore(true)}>
              Show {all.length - shown.length} earlier lines
            </button>
          ) : null}
        </div>
        </div>
      </div>
    </section>
  );
}

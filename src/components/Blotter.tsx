import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { DEFAULT_STEPS, amount, dateWib, demoRounds, eth, stepShare, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { slamHead } from "../lib/press";
import { Folio, useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Tx({ hash }: { hash: string }) {
  if (!hash) return null;
  return (
    <a className="entry__tx tabular" href={txUrl(hash)} target="_blank" rel="noreferrer">
      tx {hash.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
    </a>
  );
}

/** One payout, carved into the ledger the way a city scribe would. */
function Entry({ r }: { r: RoundRow }) {
  const done = r.stage === "done";
  const what =
    r.kind === "feeding"
      ? `${parseFloat(done ? r.fedETH : r.spentETH).toFixed(4)} ETH to ${r.recipients ? `${r.recipients} of the Ten` : "the Ten"}`
      : r.kind === "keeper"
        ? `${parseFloat(r.spentETH).toFixed(4)} ETH to the treasury`
        : done
          ? `${amount(r.tokensBurned)} $TRPZ burned`
          : `buying back`;
  const label = r.kind === "feeding" ? "The Share" : r.kind === "keeper" ? "Treasury" : "The Offering";
  return (
    <li className={`entry is-${r.kind} ${done ? "" : "is-open"}`}>
      <p className="entry__meta tabular">
        <span>No. {r.n}</span>
        <span>{dateWib(r.at)} WIB</span>
      </p>
      <p className="entry__what">
        <strong>{label}</strong> {what}
      </p>
      {done ? <Tx hash={r.tx} /> : <span className="entry__open">sending</span>}
    </li>
  );
}

export function Blotter({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const t = status?.totals;
  const keep = stepShare(status?.cycle.steps ?? DEFAULT_STEPS, "keeper");
  // A failed claim is retried as a new round, so it never shows here.
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed").slice(0, 12);
  // The book opens on the latest few; the rest are one press away.
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);

  useGSAP(
    () => {
      slamHead(root.current!);
      if (prefersReducedMotion() || !shown.length) return;
      // Each entry is stamped into the book as it scrolls under the desk lamp.
      ScrollTrigger.batch(".entry", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.from(els, { opacity: 0, scale: 1.06, rotate: -0.6, duration: 0.45, ease: "power4.out", stagger: 0.06 }),
      });
    },
    { scope: root, dependencies: [shown.length > 0] },
  );

  return (
    <section className="page blotter" id="blotter" ref={root} aria-labelledby="blotter-head">
      <div className="wrap">
        <Folio page={6} label="The ledger" />
        <h2 className="page__head" id="blotter-head">
          The stone ledger
        </h2>
        <p className="page__deck">Every payout, carved with its tx. No tx, didn&rsquo;t happen.</p>

        <dl className="tally">
          <div>
            <dt>Shared to the Ten</dt>
            <dd className="tabular">{eth(t?.fedETH ?? "0")}</dd>
          </div>
          <div>
            <dt>Treasury ({keep}%)</dt>
            <dd className="tabular">{eth(t?.keeperETH ?? "0")}</dd>
          </div>
          <div>
            <dt>Burned</dt>
            <dd className="tabular">{amount(t?.tokensBurned ?? "0")} $TRPZ</dd>
          </div>
        </dl>

        {shown.length ? (
          <ol className="blotter__book" reversed>
            {shown.map((r) => (
              <Entry key={r.n} r={r} />
            ))}
          </ol>
        ) : null}
        {shown.length && all.length > shown.length ? (
          <button type="button" className="more-btn" onClick={() => setMore(true)}>
            Show {all.length - shown.length} older entries
          </button>
        ) : null}
        {shown.length ? null : (
          <p className="blotter__empty">
            Nothing on the books yet. The first entry is written when the escrow reaches {status?.cycle.steps[0].thresholdETH ?? "0.01"} ETH and Glaux pays the first Share.
          </p>
        )}
      </div>
    </section>
  );
}

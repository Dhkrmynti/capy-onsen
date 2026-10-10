/** The Observations: every step the engine fired, newest first, each with the transaction that proves it. */
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { amount, dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { useMedia } from "../components/Bits";

const NAME: Record<RoundRow["kind"], string> = { feeding: "The Pull", keeper: "Dark Matter", sink: "Into the Void" };
/** Each kind gets a drawn mark: a filled body (paid out), a half body (held), a ring (burned away). */
function KindIcon({ kind }: { kind: RoundRow["kind"] }) {
  return (
    <svg className="entry__icon" viewBox="0 0 20 20" aria-hidden="true">
      {kind === "feeding" ? <circle cx="10" cy="10" r="6" className="is-fill" /> : null}
      {kind === "keeper" ? (
        <>
          <circle cx="10" cy="10" r="6" className="is-ring" />
          <path d="M10 4 A 6 6 0 0 1 10 16 Z" className="is-fill" />
        </>
      ) : null}
      {kind === "sink" ? <circle cx="10" cy="10" r="6" className="is-ring is-hot" /> : null}
    </svg>
  );
}

export function Record({ status }: { status: Status | null }) {
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed").slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);
  const t = status?.totals;

  return (
    <section className="log" id="record" aria-labelledby="record-head">
      <div className="frame">
        <h2 className="vd-h2" id="record-head">
          Observations.
        </h2>
        <p className="log__sum tabular">
          <span>
            <b>{eth(t?.fedETH ?? "0")}</b> pulled to the ten
          </span>
          <span>
            <b>{eth(t?.keeperETH ?? "0")}</b> dark matter
          </span>
          <span>
            <b>{amount(t?.tokensBurned ?? "0")}</b> $VOID burned
          </span>
        </p>
        {shown.length ? (
          <ol className="log__list">
            {shown.map((r) => {
              const done = r.stage === "done";
              const what = r.kind === "feeding" ? `pulled to ${r.recipients || 10} in orbit` : r.kind === "keeper" ? "to the treasury wallet" : done ? `${amount(r.tokensBurned)} $VOID burned` : "buying back";
              const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
              const tx = r.kind === "feeding" ? r.claimTx : r.kind === "keeper" ? r.treasuryTx : r.burnTx || r.buyTx;
              return (
                <li key={r.n} className={`entry is-${r.kind} ${done ? "" : "is-open"}`}>
                  <span className="entry__n tabular">{r.n}.</span>
                  <KindIcon kind={r.kind} />
                  <span className="entry__what">
                    <b>{NAME[r.kind]}</b> {what}
                  </span>
                  <span className="entry__eth tabular">{parseFloat(value).toFixed(4)} ETH</span>
                  <span className="entry__when tabular">{dateWib(r.at)}</span>
                  {done && tx ? (
                    <a className="entry__tx tabular" href={txUrl(tx)} target="_blank" rel="noreferrer">
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
          <p className="log__empty">No moves yet. The first is played when the escrow reaches {status?.cycle.steps[0].thresholdETH ?? "0.02"} ETH.</p>
        )}
        {all.length > shown.length ? (
          <button type="button" className="vd-btn log__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier moves
          </button>
        ) : null}
      </div>
    </section>
  );
}

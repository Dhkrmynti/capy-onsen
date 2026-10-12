/** Receipts: every step the engine ran, newest first, each with the transaction that proves it. */
import { useState } from "react";
import { ArrowUpRight, Coins, Vault } from "@phosphor-icons/react";
import { dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { useMedia } from "../components/Bits";

const NAME: Record<RoundRow["kind"], string> = { feeding: "Reward", keeper: "Treasury" };

export function Record({ status }: { status: Status | null }) {
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed" && NAME[r.kind]).slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);
  const t = status?.totals;

  return (
    <section className="st-sec st-log is-paper" id="record" aria-labelledby="record-head">
      <div className="st-wrap">
        <h2 className="st-h2" id="record-head">
          Receipts
        </h2>
        <p className="st-log__sum tabular">
          <span>
            <b>{eth(t?.fedETH ?? "0")}</b> paid to seated holders
          </span>
          <span>
            <b>{eth(t?.keeperETH ?? "0")}</b> to the treasury
          </span>
        </p>
        {shown.length ? (
          <ol className="st-log__list">
            {shown.map((r) => {
              const done = r.stage === "done";
              const what = r.kind === "feeding" ? `paid to ${r.recipients || 10} holders` : "to the treasury wallet";
              const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
              const tx = r.kind === "feeding" ? r.claimTx : r.treasuryTx;
              const Icon = r.kind === "feeding" ? Coins : Vault;
              return (
                <li key={r.n} className={`st-entry is-${r.kind} ${done ? "" : "is-open"}`}>
                  <span className="st-entry__n tabular">#{r.n}</span>
                  <Icon className="st-entry__icon" weight="fill" aria-hidden="true" />
                  <span className="st-entry__what">
                    <b>{NAME[r.kind]}</b> {what}
                  </span>
                  <span className="st-entry__eth tabular">{parseFloat(value).toFixed(4)} ETH</span>
                  <span className="st-entry__when tabular">{dateWib(r.at)}</span>
                  {done && tx ? (
                    <a className="st-entry__tx tabular" href={txUrl(tx)} target="_blank" rel="noreferrer">
                      {tx.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="st-entry__tx is-pending">pending</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="st-log__empty">Nothing yet. The first reward runs when the creator fees reach {status?.cycle.steps[0].thresholdETH ?? "0.02"} ETH.</p>
        )}
        {all.length > shown.length ? (
          <button type="button" className="st-btn is-ink st-log__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier
          </button>
        ) : null}
      </div>
    </section>
  );
}

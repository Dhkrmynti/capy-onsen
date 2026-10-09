/** The Record: every move the engine played, newest first, each with the transaction that proves it. */
import { useState } from "react";
import { ArrowUpRight, Coins, Fire, Archive } from "@phosphor-icons/react";
import { amount, dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { useMedia } from "../components/Bits";

const NAME: Record<RoundRow["kind"], string> = { feeding: "Haul", keeper: "Chest", sink: "Dragonfire" };
const ICON = { feeding: Coins, keeper: Archive, sink: Fire };

export function Record({ status }: { status: Status | null }) {
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed").slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);
  const t = status?.totals;

  return (
    <section className="stop" id="record" aria-labelledby="record-head">
      <div className="panel panel--wide">
        <h2 className="kp-h2" id="record-head">
          The Chronicle.
        </h2>
        <p className="record__sum tabular">
          <span>
            <b>{eth(t?.fedETH ?? "0")}</b> paid to the Keepers
          </span>
          <span>
            <b>{eth(t?.keeperETH ?? "0")}</b> to the Chest
          </span>
          <span>
            <b>{amount(t?.tokensBurned ?? "0")}</b> $HOARD burned
          </span>
        </p>
        {shown.length ? (
          <ol className="moves-list">
            {shown.map((r) => {
              const Icon = ICON[r.kind];
              const done = r.stage === "done";
              const what = r.kind === "feeding" ? `paid to ${r.recipients || 10} keepers` : r.kind === "keeper" ? "to the treasury wallet" : done ? `${amount(r.tokensBurned)} $HOARD burned` : "buying back";
              const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
              const tx = r.kind === "feeding" ? r.claimTx : r.kind === "keeper" ? r.treasuryTx : r.burnTx || r.buyTx;
              return (
                <li key={r.n} className={`mv is-${r.kind} ${done ? "" : "is-open"}`}>
                  <span className="mv__n tabular">{r.n}.</span>
                  <Icon className="mv__icon" weight="fill" aria-hidden="true" />
                  <span className="mv__what">
                    <b>{NAME[r.kind]}</b> {what}
                  </span>
                  <span className="mv__eth tabular">{parseFloat(value).toFixed(4)} ETH</span>
                  <span className="mv__when tabular">{dateWib(r.at)}</span>
                  {done && tx ? (
                    <a className="mv__tx tabular" href={txUrl(tx)} target="_blank" rel="noreferrer">
                      {tx.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="mv__tx is-pending">pending</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="record__empty">No moves yet. The first is played when the escrow reaches {status?.cycle.steps[0].thresholdETH ?? "0.02"} ETH.</p>
        )}
        {all.length > shown.length ? (
          <button type="button" className="kp-btn is-ghost record__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier moves
          </button>
        ) : null}
      </div>
    </section>
  );
}

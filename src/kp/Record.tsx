/** The Captain's Log: every flag the engine ran up, newest first, each with the transaction that proves it. */
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { amount, dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { useMedia } from "../components/Bits";
import { Flag } from "../components/Flag";
import type { FlagCode } from "../lib/flags";

const NAME: Record<RoundRow["kind"], string> = { feeding: "Plunder", keeper: "Chest", sink: "Cannonfire" };
const CODE: Record<RoundRow["kind"], FlagCode> = { feeding: "P", keeper: "T", sink: "B" };

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
      <div className="log__sheet">
        <h2 className="sig-h2" id="record-head">
          The Captain's Log.
        </h2>
        <p className="log__sum tabular">
          <span>
            <b>{eth(t?.fedETH ?? "0")}</b> paid to the Crew
          </span>
          <span>
            <b>{eth(t?.keeperETH ?? "0")}</b> to the Chest
          </span>
          <span>
            <b>{amount(t?.tokensBurned ?? "0")}</b> $LOOT burned
          </span>
        </p>
        {shown.length ? (
          <ol className="log__list">
            {shown.map((r) => {
              const done = r.stage === "done";
              const what = r.kind === "feeding" ? `paid to ${r.recipients || 10} crew` : r.kind === "keeper" ? "to the treasury wallet" : done ? `${amount(r.tokensBurned)} $LOOT burned` : "buying back";
              const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
              const tx = r.kind === "feeding" ? r.claimTx : r.kind === "keeper" ? r.treasuryTx : r.burnTx || r.buyTx;
              return (
                <li key={r.n} className={`entry is-${r.kind} ${done ? "" : "is-open"}`}>
                  <span className="entry__n tabular">{r.n}.</span>
                  <Flag code={CODE[r.kind]} size={34} className="entry__icon" />
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
          <button type="button" className="sig-btn is-white log__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier moves
          </button>
        ) : null}
      </div>
    </section>
  );
}

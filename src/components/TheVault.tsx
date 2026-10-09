import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SealCheck } from "@phosphor-icons/react";
import { DEFAULT_TIERS, compact, demoPond, splitInheritance, tierOf, usd, usePoll, type PondRow, type Status } from "../lib/api";
import { useAccount } from "../lib/wallet";
import { prefersReducedMotion } from "../lib/motion";
import { nameFor } from "../lib/alias";
import { openCard } from "./CrewCard";
import { CrewFace, XCheck, XLink } from "./Face";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The first fifty in the family, ten to a column, the Ten Heirs' column marked as the inheritance zone. */
const COLS = 5;
const PER_COL = 10;

export function TheVault({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data } = usePoll<{ total: number; topN: number; rows: PondRow[] }>(live ? `/api/pond?limit=${COLS * PER_COL}` : null, 30000, demoPond);
  const me = useAccount()?.toLowerCase();
  const all = (data?.rows ?? []).slice(0, COLS * PER_COL);
  const top = status?.rules.topN ?? data?.topN ?? 10;
  const family = status?.counts.sitters ?? data?.total ?? 0;
  // The balance to beat: the last heir's. Anyone below needs a little more than that to enter the zone.
  const bar = all.length >= top ? parseFloat(all[top - 1].balance) : 0;
  const cols = Array.from({ length: COLS }, (_, c) => all.slice(c * PER_COL, (c + 1) * PER_COL)).filter((c) => c.length);
  const mine = me ? all.find((r) => r.addr.toLowerCase() === me) : undefined;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const next = parseFloat(status?.cycle.steps.find((s) => s.kind === "feeding")?.thresholdETH ?? "0.02");
  // Each heir's part of the next inheritance, worked out the engine's way.
  const px = status?.price?.tokenUSD ?? 0;
  const worth = (bal: string) => (px > 0 ? ` · ${usd(parseFloat(bal) * px)}` : "");
  const share = splitInheritance(next, all.filter((r) => r.inTop).map((r) => parseFloat(r.balance)), tiers);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !all.length) return;
      // Each column is inked in turn, as a clerk would fill the book.
      gsap.from(".heirs__col", { opacity: 0, y: 14, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".heirs", start: "top 80%" } });
    },
    { scope: root, dependencies: [all.length > 0] },
  );

  return (
    <section className="stop stop--tall register" id="register" ref={root} aria-labelledby="ledger-head">
      <div className="h-wrap stop__inner">
        <div className="plaque plaque--ledger plaque--wide" style={{ "--cols": Math.max(1, cols.length) } as React.CSSProperties}>
          <div className="heirs__top">
            <h2 className="plaque__head" id="ledger-head">
              The Ten Heirs.
            </h2>
            <p className="plaque__deck">
              {family.toLocaleString("en-US")} in the family, ranked by balance. No. 1–5 and 6–10 inherit{px > 0 ? <> · 1 $HEIR ≈ ${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}</> : null}
              {mine ? (
                <>
                  {" "}
                  · <b className="heirs__you">you are No. {mine.rank}</b>
                </>
              ) : null}
              .
            </p>
          </div>

          {all.length ? (
            <div className="heirs" role="list" aria-label={`The first ${all.length} holders by balance. The top ${top} share the next inheritance.`}>
              {cols.map((col, c) => (
                <div className={`heirs__col ${c === 0 ? "is-zone" : ""}`} role="listitem" key={c}>
                  <p className="heirs__label">{c === 0 ? <>Inheritance zone</> : `No. ${c * PER_COL + 1}–${c * PER_COL + col.length}`}</p>
                  <ol className="heirs__list" start={c * PER_COL + 1}>
                    {col.map((r) => {
                      const who = nameFor(r.addr, r.nickname, r.x);
                      const tier = r.inTop ? (r.tier ?? tierOf(r.rank, tiers)) : 0;
                      const band = tier ? tiers[tier - 1] : null;
                      const gap = bar - parseFloat(r.balance);
                      const isMe = me === r.addr.toLowerCase();
                      return (
                        <li key={r.addr} className={`heir ${r.inTop ? "is-heir" : ""} ${tier ? `is-tier${tier}` : ""} ${isMe ? "is-me" : ""}`}>
                          {band && r.rank === band.from ? (
                            <span className="heir__band">
                              {tier === 1 ? "I" : "II"} · No. {band.from}–{band.to} · {band.eth} ETH
                            </span>
                          ) : null}
                          <span className="heir__rank tabular">{r.rank}</span>
                          <span className="heir__open">
                            <button type="button" className="heir__face" onClick={() => openCard(r.addr)} tabIndex={-1} aria-hidden="true">
                              <CrewFace addr={r.addr} pp={r.pp} x={r.x} size={20} className="heir__seal" />
                            </button>
                            <span className="heir__id">
                              <span className="heir__name">
                                {/* a linked X account: its logo first, opening the holder's X profile */}
                                {r.x ? <XLink x={r.x} className="heir__xlink" /> : null}
                                <button type="button" className="heir__namebtn" onClick={() => openCard(r.addr)} aria-label={`Open the card of ${who.name}, number ${r.rank}, ${r.addr}`}>
                                  {who.name}
                                </button>
                                {r.x ? <XCheck x={r.x} /> : who.claimed ? <SealCheck className="ledger__check" weight="fill" aria-hidden="true" /> : null}
                              </span>
                              <span className="heir__sub tabular">
                                {compact(r.balance)}
                                {worth(r.balance)}
                                {r.inTop ? ` · next ${(share[r.rank - 1] ?? 0).toFixed(4)} ETH` : gap > 0 ? ` · +${compact(gap + 1)} to enter` : " · at the line"}
                              </span>
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          ) : (
            <p className="book__empty">{live ? "No family yet. The first entry is written the moment a wallet holds the minimum balance." : "The book opens at launch. The first names are entered the moment trading begins."}</p>
          )}
        </div>
      </div>
    </section>
  );
}

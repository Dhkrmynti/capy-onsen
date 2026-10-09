import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SealCheck } from "@phosphor-icons/react";
import { amount, compact, demoPond, short, usePoll, type PondRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { nameFor } from "../lib/alias";
import { openCard } from "./CrewCard";
import { CrewFace, XCheck, XLink } from "./Face";
import { useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The ledger of holders: a leather-bound book, the Ten Heirs edged in gilt. */
export function TheVault({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data } = usePoll<{ total: number; topN: number; rows: PondRow[] }>(live ? "/api/pond?limit=20" : null, 30000, demoPond);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = data?.rows ?? [];
  const top = status?.rules.topN ?? 10;
  const rows = more ? all : all.slice(0, top);
  const accounts = status?.counts.sitters ?? 0;
  const paid = (v: string) => (parseFloat(v) > 0 ? parseFloat(v).toFixed(narrow ? 3 : 4) : "—");

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rows.length) return;
      // Each entry is written into the book in turn, as a clerk would ink it.
      gsap.from(".ledger__row", { opacity: 0, clipPath: "inset(0 100% 0 0)", duration: 0.7, ease: "power3.out", stagger: 0.06, scrollTrigger: { trigger: ".ledger", start: "top 78%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  return (
    <section className="stop stop--tall register" id="register" ref={root} aria-labelledby="ledger-head">
      <div className="h-wrap stop__inner">
        <div className="plaque plaque--ledger">
          <h2 className="plaque__head" id="ledger-head">
            The Ten Heirs.
          </h2>
          <p className="plaque__deck">{accounts.toLocaleString("en-US")} in the family, ranked by balance. The heirs' boxes are lit.</p>

        <div className="book">
          <div className="book__page">
            {rows.length ? (
              <ol className="ledger" aria-label={`Accounts ranked by balance. The top ${top} share the next inheritance.`}>
                <li className="ledger__row is-head" aria-hidden="true">
                  <span>No.</span>
                  <span>Account</span>
                  <span className="num">Balance</span>
                  <span className="num">Paid, ETH</span>
                </li>
                {rows.map((r) => {
                  const who = nameFor(r.addr, r.nickname, r.x);
                  return (
                    <li key={r.addr} className={`ledger__row ${r.inTop ? "is-preferred" : ""}`}>
                      <span className="ledger__rank tabular">{r.rank}</span>
                      <span className="ledger__who">
                        <button type="button" className={`ledger__open ${who.claimed ? "is-claimed" : ""}`} onClick={() => openCard(r.addr)} aria-label={`Open the account of ${who.name}, ${r.addr}`}>
                          <CrewFace addr={r.addr} pp={r.pp} x={r.x} size={narrow ? 22 : 24} className="ledger__seal" />
                          <span className="ledger__id">
                            <span className="ledger__name">
                              {who.name}
                              {r.x ? <XCheck x={r.x} /> : who.claimed ? <SealCheck className="ledger__check" weight="fill" aria-hidden="true" /> : null}
                            </span>
                            <span className="ledger__addr tabular">{short(r.addr)}</span>
                          </span>
                        </button>
                        {r.x ? <XLink x={r.x} /> : null}
                      </span>
                      <span className="num tabular">
                        {narrow ? compact(r.balance) : amount(r.balance)}
                        <small className="ledger__paid">{paid(r.received)} ETH</small>
                      </span>
                      <span className="num tabular">{paid(r.received)}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="book__empty">{live ? "No family yet. The first entry is written the moment a wallet holds the minimum balance." : "The book opens at launch. The first names are entered the moment trading begins."}</p>
            )}
            {all.length > rows.length ? (
              <button type="button" className="h-btn is-ink is-small book__more" onClick={() => setMore(true)}>
                Turn the page: next {all.length - rows.length}
              </button>
            ) : null}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

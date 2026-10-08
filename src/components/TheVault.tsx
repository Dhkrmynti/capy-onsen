import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, compact, demoPond, short, usePoll, type PondRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { slamHead } from "../lib/press";
import { openCard } from "./CrewCard";
import { CrewFace, XCheck, XLink } from "./Face";
import { nameFor } from "../lib/alias";
import { SealCheck } from "@phosphor-icons/react";
import { useMedia, Folio } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function TheVault({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data } = usePoll<{ total: number; topN: number; rows: PondRow[] }>(live ? "/api/pond?limit=20" : null, 30000, demoPond);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = data?.rows ?? [];
  const crew = status?.counts.sitters ?? 0;
  const top = status?.rules.topN ?? 10;
  // The table opens on the bags that get the split; the chasing pack is one press away.
  const rows = more ? all : all.slice(0, top);
  const paid = (v: string) => (parseFloat(v) > 0 ? parseFloat(v).toFixed(narrow ? 3 : 4) : "-");

  useGSAP(
    () => {
      slamHead(root.current!);
      if (prefersReducedMotion() || !rows.length) return;
      // Market prices come off the wire one row at a time.
      gsap.from(".quotes tbody tr", {
        opacity: 0,
        x: -14,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.045,
        scrollTrigger: { trigger: ".quotes", start: "top 80%" },
      });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  return (
    <section className="page vault" id="vault" ref={root} aria-labelledby="vault-head">
      <div className="wrap">
        <Folio page={5} label="Markets" />
        <div className="vault__lead">
          <h2 className="page__head" id="vault-head">
            The vault
          </h2>
          <p className="page__deck">
            {crew.toLocaleString("en-US")} in the crew. The top {top} bags get every split.
          </p>
        </div>

        {rows.length ? (
          <table className="quotes">
            <caption className="sr-only">Biggest bags in the crew, ranked by balance. The top {top} share the next split.</caption>
            <thead>
              <tr>
                <th scope="col" className="num">
                  Rank
                </th>
                <th scope="col">Crew</th>
                <th scope="col" className="num">
                  Bag
                </th>
                {narrow ? null : (
                  <th scope="col" className="num">
                    Days
                  </th>
                )}
                <th scope="col" className="num">
                  Paid ETH
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.addr} className={r.inTop ? "is-top" : ""}>
                  <td className="num tabular">{r.rank}</td>
                  <td>
                    {(() => {
                      const who = nameFor(r.addr, r.nickname, r.x);
                      return (
                        <div className="quotes__cell">
                          <button
                            type="button"
                            className={`quotes__who ${who.claimed ? "is-claimed" : "is-alias"}`}
                            onClick={() => openCard(r.addr)}
                            aria-label={`Open crew card for ${who.name}, ${r.addr}`}
                          >
                            <CrewFace addr={r.addr} pp={r.pp} x={r.x} size={narrow ? 30 : 34} className="quotes__mug" />
                            <span className="quotes__id">
                              <span className="quotes__name">
                                {who.name}
                                {r.x ? <XCheck x={r.x} /> : who.claimed ? <SealCheck className="quotes__seal" weight="fill" aria-hidden="true" /> : null}
                              </span>
                              <span className="quotes__addr tabular">{short(r.addr)}</span>
                            </span>
                          </button>
                          {r.x ? <XLink x={r.x} /> : null}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="num tabular">{narrow ? compact(r.balance) : amount(r.balance)}</td>
                  {narrow ? null : <td className="num tabular">{r.padDays}</td>}
                  <td className="num tabular">{paid(r.received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="vault__empty">
            {live ? "No crew yet. The table fills as soon as the first wallet holds the minimum bag." : "Trading opens at launch. The first crew lands on this table the moment the vault opens."}
          </p>
        )}
        {all.length > rows.length ? (
          <button type="button" className="more-btn" onClick={() => setMore(true)}>
            Show the next {all.length - rows.length} in line
          </button>
        ) : null}
        <p className="vault__foot">Bold rows share the next split. Unclaimed wallets print under a gang alias. Set a nickname or connect X on your crew card.</p>
      </div>
    </section>
  );
}

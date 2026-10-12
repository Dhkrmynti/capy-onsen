/**
 * The row: the same ten wallets that sit in the room above, as a list. No. 1 has the gold chair,
 * No. 1-5 are the front row and No. 6-10 the back row (the two reward tiers); 11-50 are standing
 * in line with the gap to a chair. When ranks move, rows glide to their new places.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Crown, HourglassMedium, SignOut, Storefront } from "@phosphor-icons/react";
import { DEFAULT_TIERS, compact, splitInheritance, usd, type Pond, type PondRow, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { openCard } from "../components/CrewCard";
import { CrewFace, XCheck, XLink } from "../components/Face";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? <CrewFace addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" /> : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openCard(addr)} aria-label={`Open the ticket of ${who.name}`}>
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

export function Board({ status, pond }: { status: Status | null; pond: Pond | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const rows = live ? (pond?.rows ?? []).slice(0, 50) : [];
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const reward = parseFloat(status?.cycle.steps.find((s) => s.kind === "feeding")?.thresholdETH ?? "0.02");
  const share = splitInheritance(reward, rows.filter((r) => r.inTop).map((r) => parseFloat(r.balance)), tiers);
  const px = status?.price?.tokenUSD ?? 0;
  const worth = (b: string) => (px > 0 ? usd(parseFloat(b) * px) : "");
  const bar = rows.length >= 10 ? parseFloat(rows[9].balance) : 0;
  const ten = Array.from({ length: 10 }, (_, i) => rows[i]);
  const far = rows.slice(10);
  const gold = ten[0];

  // rows glide to their new places when ranks move (FLIP, keyed by wallet)
  const last = useRef(new Map<string, DOMRect>());
  const prevOne = useRef<string | undefined>(undefined);
  const [taken, setTaken] = useState(0);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const now = new Map<string, DOMRect>();
    el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => now.set(n.dataset.key!, n.getBoundingClientRect()));
    if (!prefersReducedMotion())
      el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => {
        const a = last.current.get(n.dataset.key!);
        const b = now.get(n.dataset.key!);
        if (!a || !b || (Math.abs(a.left - b.left) < 2 && Math.abs(a.top - b.top) < 2)) return;
        gsap.fromTo(n, { x: a.left - b.left, y: a.top - b.top, zIndex: 3 }, { x: 0, y: 0, duration: 0.8, ease: "back.out(1.3)", clearProps: "zIndex" });
      });
    last.current = now;
    const k = rows[0]?.addr;
    if (prevOne.current && k && k !== prevOne.current) setTaken((s) => s + 1);
    prevOne.current = k;
  });

  useGSAP(
    () => {
      if (!taken || prefersReducedMotion()) return;
      gsap.fromTo(".st-taken", { scale: 0.4, rotate: -14, opacity: 0 }, { scale: 1, rotate: -6, opacity: 1, duration: 0.45, ease: "back.out(2.4)" });
      gsap.to(".st-taken", { opacity: 0, y: -20, delay: 2.4, duration: 0.4 });
      gsap.fromTo(".st-gold", { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1.4, 0.25)" });
    },
    { scope: root, dependencies: [taken] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: ".st-rows", start: "top 82%" };
      gsap.from(".st-gold", { y: 50, opacity: 0, rotate: -2, duration: 0.7, ease: "back.out(1.5)", scrollTrigger: { trigger: ".st-gold", start: "top 88%" } });
      gsap.from(".st-seat", { x: -40, opacity: 0, duration: 0.5, ease: "back.out(1.4)", stagger: 0.05, scrollTrigger: st });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const seat = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`st-seat ${rank <= 5 ? "is-front" : "is-back"} ${r ? "" : "is-open"}`}>
      <span className="st-seat__n tabular">{rank}</span>
      {r ? (
        <>
          <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={30} />
          <span className="st-seat__bal tabular">
            {compact(r.balance)}
            {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
          </span>
          <span className="st-seat__next tabular">+{(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
        </>
      ) : (
        <>
          <span className="st-seat__open">Empty chair</span>
          <span className="st-seat__bal">{bar > 0 ? "hold more than No. 10 to take it" : `hold 100,000 ${TICKER} to take it`}</span>
        </>
      )}
    </li>
  );

  return (
    <section className="st-sec st-row" id="row" ref={root} aria-labelledby="row-head">
      <div className="st-wrap">
        <div className="st-sec__head">
          <h2 className="st-h2" id="row-head">
            The row
          </h2>
          <p className="st-facts tabular">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} holders in the room` : "Opens at launch"}
            {px > 0 ? ` · 1 ${TICKER} ≈ $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}` : ""}
          </p>
        </div>

        <div className={`st-gold ${gold ? "" : "is-open"}`} data-key={gold?.addr}>
          <span className="st-gold__crown">
            <Crown weight="fill" aria-hidden="true" />
          </span>
          <div className="st-gold__body">
            <p className="st-gold__k">The gold chair · No. 1</p>
            {gold ? (
              <>
                <Who addr={gold.addr} nickname={gold.nickname} pp={gold.pp} x={gold.x} size={56} />
                <p className="st-gold__bal tabular">
                  {compact(gold.balance)} {TICKER}
                  {worth(gold.balance) ? ` · ${worth(gold.balance)}` : ""} · next reward +{(share[0] ?? 0).toFixed(4)} ETH
                </p>
              </>
            ) : (
              <p className="st-gold__bal">Empty. The biggest holder takes it.</p>
            )}
          </div>
        </div>

        <div className="st-rows">
          <div className="st-tier is-front">
            <p className="st-tier__k">
              <b>Front row</b> No. 1-5 share {tiers[0]?.eth ?? "0.014"} ETH of every {reward} ETH reward
            </p>
            <ol className="st-tier__list">{ten.slice(1, 5).map((r, i) => seat(r, i + 2))}</ol>
          </div>
          <div className="st-tier is-back">
            <p className="st-tier__k">
              <b>Back row</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH
            </p>
            <ol className="st-tier__list">{ten.slice(5).map((r, i) => seat(r, i + 6))}</ol>
          </div>
        </div>

        {pond?.house || pond?.waiting?.length || pond?.out?.length ? (
          <div className="st-tags">
            {live && pond?.house ? (
              <div className="st-tag is-desk">
                <span className="st-tag__k">
                  <Storefront weight="bold" aria-hidden="true" /> Front desk
                </span>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={22} />
                <span className="st-tag__sub tabular">{compact(pond.house.balance)} · the dev wallet, never seated, never paid</span>
              </div>
            ) : null}
            {live && pond?.waiting?.length ? (
              <div className="st-tag is-wait">
                <span className="st-tag__k">
                  <HourglassMedium weight="bold" aria-hidden="true" /> At the door
                </span>
                <span className="st-tag__list">
                  {pond.waiting.map((w) => (
                    <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={20} />
                  ))}
                </span>
              </div>
            ) : null}
            {live && pond?.out?.length ? (
              <div className="st-tag is-out">
                <span className="st-tag__k">
                  <SignOut weight="bold" aria-hidden="true" /> Thrown out
                </span>
                <span className="st-tag__list">
                  {pond.out.map((w) => (
                    <span key={w.addr} className="st-out">
                      {nameFor(w.addr, w.nickname, w.x).name}
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {far.length ? (
          <>
            <p className="st-line">Standing in line</p>
            <ol className="st-far" start={11} aria-label="No. 11 to 50">
              {far.map((r) => {
                const gap = bar - parseFloat(r.balance);
                return (
                  <li key={r.addr} data-key={r.addr}>
                    <span className="st-far__n tabular">{r.rank}</span>
                    <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={20} />
                    <span className="st-far__sub tabular">
                      {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to a chair` : "next in line"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : null}
        {taken ? (
          <p className="st-taken" aria-live="polite">
            Gold chair taken
          </p>
        ) : null}
      </div>
    </section>
  );
}

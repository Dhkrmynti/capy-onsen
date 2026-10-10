/**
 * The Crew: the holders on one hoist. No. 1 flies the Captain's black flag, 2-5 the officers and
 * 6-10 the deckhands each fly their numeral pennant (the Plunder zone), 11-50 sit in the signal
 * book with the gap to the zone. When ranks move, rows glide to their new places; a new Captain
 * gets the shout.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HourglassMedium } from "@phosphor-icons/react";
import { DEFAULT_TIERS, compact, splitInheritance, usd, type Pond, type PondRow, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { openCard } from "../components/CrewCard";
import { CrewFace, XCheck, XLink } from "../components/Face";
import { Flag } from "../components/Flag";
import { pennantFor } from "../lib/flags";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      <CrewFace addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" />
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openCard(addr)} aria-label={`Open the seat of ${who.name}`}>
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

export function Ladder({ status, pond }: { status: Status | null; pond: Pond | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const rows = live ? (pond?.rows ?? []).slice(0, 50) : [];
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const tribute = parseFloat(status?.cycle.steps.find((s) => s.kind === "feeding")?.thresholdETH ?? "0.02");
  const share = splitInheritance(tribute, rows.filter((r) => r.inTop).map((r) => parseFloat(r.balance)), tiers);
  const px = status?.price?.tokenUSD ?? 0;
  const worth = (b: string) => (px > 0 ? usd(parseFloat(b) * px) : "");
  const bar = rows.length >= 10 ? parseFloat(rows[9].balance) : 0;
  const officers = Array.from({ length: 5 }, (_, i) => rows[i]);
  const hands = Array.from({ length: 5 }, (_, i) => rows[5 + i]);
  const crowd = rows.slice(10);

  // squares glide to their new places when ranks move (FLIP, keyed by wallet)
  const last = useRef(new Map<string, DOMRect>());
  const prevKing = useRef<string | undefined>(undefined);
  const [shout, setShout] = useState(0);
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
        gsap.fromTo(n, { x: a.left - b.left, y: a.top - b.top, zIndex: 3 }, { x: 0, y: 0, duration: 0.9, ease: "expo.out", clearProps: "zIndex" });
      });
    last.current = now;
    const k = rows[0]?.addr;
    if (prevKing.current && k && k !== prevKing.current) setShout((s) => s + 1);
    prevKing.current = k;
  });

  useGSAP(
    () => {
      if (!shout || prefersReducedMotion()) return;
      gsap.fromTo(".shout", { scale: 2.4, rotate: -12, opacity: 0 }, { scale: 1, rotate: -6, opacity: 1, duration: 0.45, ease: "back.out(2)" });
      gsap.to(".shout", { opacity: 0, delay: 2.2, duration: 0.5 });
    },
    { scope: root, dependencies: [shout] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // pennants swing down onto the line, one after another, and settle
      gsap.from(".hang__flag", { rotate: -80, transformOrigin: "0% 0%", duration: 1.6, ease: "elastic.out(1, 0.38)", stagger: 0.07, scrollTrigger: { trigger: ".hoist", start: "top 80%" } });
      gsap.from(".hang__body", { x: -24, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: ".hoist", start: "top 80%" } });
      gsap.from(".book li", { y: 12, opacity: 0, duration: 0.5, ease: "expo.out", stagger: { each: 0.01, from: "start" }, scrollTrigger: { trigger: ".book", start: "top 90%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const hang = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`hang ${rank === 1 ? "is-captain" : rank <= 5 ? "is-officer" : "is-hand"} ${r ? "" : "is-open"}`}>
      <Flag code={rank === 1 ? "J" : pennantFor(rank)} size={rank === 1 ? 112 : 58} className="hang__flag" />
      <span className="hang__body">
        <span className="hang__rank">{rank === 1 ? "Captain" : `No. ${rank}`}</span>
        {r ? (
          <>
            <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={rank === 1 ? 34 : 26} />
            <span className="hang__bal tabular">
              {compact(r.balance)}
              {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
            </span>
            <span className="hang__next tabular">next {(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
          </>
        ) : (
          <>
            <span className="hang__open">Open</span>
            <span className="hang__bal">{rank === 1 ? "the helm is free" : "hold more than No. 10 to take it"}</span>
          </>
        )}
      </span>
    </li>
  );

  return (
    <section className="crew" id="ladder" ref={root} aria-labelledby="ladder-head">
      <div className="crew__sheet">
        <div className="crew__head">
          <h2 className="sig-h2" id="ladder-head">
            The Crew.
          </h2>
          <p className="crew__facts tabular">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} aboard` : "Opens at launch"}
            {px > 0 ? ` · 1 $LOOT ≈ $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}` : ""}
          </p>
        </div>

        {pond?.house || pond?.waiting?.length || pond?.out?.length ? (
          <div className="tags">
            {pond?.house ? (
              <div className="tag is-founder">
                <span className="tag__k">
                  <Flag code="F" size={26} /> Founder
                </span>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={22} />
                <span className="tag__sub tabular">{compact(pond.house.balance)} · never ranked, never paid</span>
              </div>
            ) : null}
            {pond?.waiting?.length ? (
              <div className="tag is-wait">
                <span className="tag__k">
                  <HourglassMedium weight="fill" aria-hidden="true" /> Pending
                </span>
                <span className="tag__list">
                  {pond.waiting.map((w) => (
                    <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={20} />
                  ))}
                </span>
              </div>
            ) : null}
            {pond?.out?.length ? (
              <div className="tag is-over">
                <span className="tag__k">
                  <Flag code="O" size={26} /> Overboard
                </span>
                <span className="tag__list">
                  {pond.out.map((w) => (
                    <span key={w.addr} className="over">
                      {nameFor(w.addr, w.nickname, w.x).name}
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="hoist">
          <p className="hoist__label">
            <b>Officers</b> No. 1-5 share {tiers[0]?.eth ?? "0.014"} ETH of every {tribute} ETH Plunder
          </p>
          <ol className="hoist__line" aria-label={`The officers: No. 1-5 share ${tiers[0]?.eth ?? "0.014"} ETH of every Plunder`}>
            {officers.map((r, i) => hang(r, i + 1))}
          </ol>
          <p className="hoist__label">
            <b>Deckhands</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH
          </p>
          <ol className="hoist__line is-hands" aria-label={`The deckhands: No. 6-10 share ${tiers[1]?.eth ?? "0.006"} ETH of every Plunder`}>
            {hands.map((r, i) => hang(r, i + 6))}
          </ol>
        </div>

        {crowd.length ? (
          <ol className="book" start={11} aria-label="No. 11 to 50">
            {crowd.map((r) => {
              const gap = bar - parseFloat(r.balance);
              return (
                <li key={r.addr} data-key={r.addr}>
                  <span className="book__rank tabular">{r.rank}</span>
                  <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={18} />
                  <span className="book__sub tabular">
                    {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to the ten` : "at the line"}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}
        {shout ? (
          <p className="shout" aria-live="polite">
            New Captain!
          </p>
        ) : null}
      </div>
    </section>
  );
}

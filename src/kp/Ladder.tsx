/**
 * The Ladder: the holders as a board in play. No. 1 is the King on the big square, 2–5 the Court,
 * 6–10 the Guard (the Tribute zone), 11–50 the crowd on small squares with the gap to the zone.
 * When ranks move, squares glide to their new places; a new King gets the board's shout.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Crown, HourglassMedium, Flag } from "@phosphor-icons/react";
import { DEFAULT_TIERS, compact, splitInheritance, usd, type Pond, type PondRow, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { openCard } from "../components/CrewCard";
import { CrewFace, XCheck, XLink } from "../components/Face";
import { Piece, pieceFor } from "./Pieces";

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
  const court = Array.from({ length: 5 }, (_, i) => rows[i]);
  const guard = Array.from({ length: 5 }, (_, i) => rows[5 + i]);
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
      gsap.from(".court .tile, .guard .tile", { y: 50, rotateX: -50, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".court", start: "top 85%" } });
      gsap.from(".crowd li", { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(1.7)", stagger: { each: 0.012, from: "start" }, scrollTrigger: { trigger: ".crowd", start: "top 90%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const tile = (r: PondRow | undefined, rank: number) => {
    const kind = pieceFor(rank);
    const tone = rank === 1 ? "crown" : rank <= 5 ? "cream" : "cream";
    return (
      <div key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`tile ${rank === 1 ? "is-king" : rank <= 5 ? "is-court" : "is-guard"} ${r ? "" : "is-open"}`}>
        <Piece kind={kind} tone={tone === "crown" ? "cream" : tone} size={rank === 1 ? 190 : 48} className="tile__piece" />
        <span className="tile__rank tabular">{rank}</span>
        {r ? (
          <>
            <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={rank === 1 ? 34 : 26} />
            <span className="tile__sub tabular">
              <span>
                {compact(r.balance)}
                {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
              </span>
              <span>next {(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
            </span>
          </>
        ) : (
          <>
            <span className="tile__open">Open square</span>
            <span className="tile__sub">{rank === 1 ? "the crown is free" : "take it"}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <section className="kp-section ladder" id="ladder" ref={root} aria-labelledby="ladder-head">
      <div className="kp-wrap">
        <div className="ladder__head">
          <h2 className="kp-h2" id="ladder-head">
            The Ladder.
          </h2>
          <p className="ladder__facts tabular">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} on the board` : "Opens at launch"}
            {px > 0 ? ` · 1 $KING ≈ $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}` : ""}
          </p>
        </div>

        {pond?.house || pond?.waiting?.length || pond?.out?.length ? (
          <div className="strips">
            {pond?.house ? (
              <div className="strip is-founder">
                <span className="strip__tag">
                  <Flag weight="fill" aria-hidden="true" /> Founder
                </span>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={24} />
                <span className="strip__sub tabular">{compact(pond.house.balance)} · never ranked, never paid</span>
              </div>
            ) : null}
            {pond?.waiting?.length ? (
              <div className="strip is-wait">
                <span className="strip__tag">
                  <HourglassMedium weight="fill" aria-hidden="true" /> Pending
                </span>
                <span className="strip__list">
                  {pond.waiting.map((w) => (
                    <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={20} />
                  ))}
                </span>
              </div>
            ) : null}
            {pond?.out?.length ? (
              <div className="strip is-captured">
                <span className="strip__tag">Captured</span>
                <span className="strip__list">
                  {pond.out.map((w) => (
                    <span key={w.addr} className="captured">
                      <Piece kind="pawn" tone="violet" size={22} lying />
                      <span className="captured__name">{nameFor(w.addr, w.nickname, w.x).name}</span>
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="board">
          <div className="court" aria-label={`The Court: No. 1–5 share ${tiers[0]?.eth ?? "0.014"} ETH of every Tribute`}>
            {court.map((r, i) => tile(r, i + 1))}
          </div>
          <div className="guard" aria-label={`The Guard: No. 6–10 share ${tiers[1]?.eth ?? "0.006"} ETH of every Tribute`}>
            {guard.map((r, i) => tile(r, i + 6))}
          </div>
          <p className="board__line tabular">
            <Crown weight="fill" aria-hidden="true" /> No. 1–5 share {tiers[0]?.eth ?? "0.014"} ETH · No. 6–10 share {tiers[1]?.eth ?? "0.006"} ETH · of every {tribute} ETH Tribute
          </p>
          {crowd.length ? (
            <ol className="crowd" start={11}>
              {crowd.map((r) => {
                const gap = bar - parseFloat(r.balance);
                return (
                  <li key={r.addr} data-key={r.addr} className="crowd__sq">
                    <span className="crowd__rank tabular">{r.rank}</span>
                    <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={18} />
                    <span className="crowd__sub tabular">
                      {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)}` : "at the line"}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
        {shout ? (
          <p className="shout" aria-live="polite">
            New King!
          </p>
        ) : null}
      </div>
    </section>
  );
}

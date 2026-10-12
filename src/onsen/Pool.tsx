/**
 * The bath: the same ten wallets that soak in the doorway above, as a list. No. 1 holds the yuzu,
 * No. 1-5 are the hot pool and No. 6-10 the warm pool (the two reward tiers); 11-50 wait in the
 * towel line with the gap to a spot. When ranks move, rows glide to their new places.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_TIERS, compact, splitInheritance, usd, type Pond, type PondRow, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { Face, XCheck, XLink } from "./Bits";
import { Yuzu } from "./Capy";
import { openTag } from "./Tag";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? <Face addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" /> : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openTag(addr)} aria-label={`Open the tag of ${who.name}`}>
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

export function Pool({ status, pond }: { status: Status | null; pond: Pond | null }) {
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
  const one = ten[0];

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
        gsap.fromTo(n, { x: a.left - b.left, y: a.top - b.top, zIndex: 3 }, { x: 0, y: 0, duration: 0.9, ease: "power3.inOut", clearProps: "zIndex" });
      });
    last.current = now;
    const k = rows[0]?.addr;
    if (prevOne.current && k && k !== prevOne.current) setTaken((s) => s + 1);
    prevOne.current = k;
  });

  // the yuzu changed heads: say so once, and let it land with a bounce
  useGSAP(
    () => {
      if (!taken || prefersReducedMotion()) return;
      gsap.fromTo(".taken", { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "back.out(1.8)" });
      gsap.to(".taken", { opacity: 0, delay: 2.6, duration: 0.4 });
      gsap.fromTo(".one__yuzu", { y: -70, rotate: -40 }, { y: 0, rotate: 0, duration: 0.9, ease: "bounce.out" });
    },
    { scope: root, dependencies: [taken] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the yuzu drops onto No. 1 as the bath comes into view; the rows surface in order
      gsap.from(".one__yuzu", { y: -90, rotate: -50, duration: 1, ease: "bounce.out", scrollTrigger: { trigger: ".one", start: "top 75%" } });
      gsap.from(".soak", { y: 26, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.05, scrollTrigger: { trigger: ".pools", start: "top 82%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const soak = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`soak ${r ? "" : "is-open"}`}>
      <span className="soak__n">{rank}</span>
      {r ? (
        <>
          <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={34} />
          <span className="soak__bal num">
            {compact(r.balance)}
            {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
          </span>
          <span className="soak__next num">+{(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
        </>
      ) : (
        <span className="soak__open">Open spot. {bar > 0 ? "Hold more than No. 10 to take it." : `Hold 100,000 ${TICKER} to take it.`}</span>
      )}
    </li>
  );

  return (
    <section className="sec bath" id="bath" ref={root} aria-labelledby="bath-head">
      <div className="wrap">
        <div className="sec__head">
          <h2 className="h2" id="bath-head">
            The bath
          </h2>
          <p className="deck">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} holders in the bathhouse.` : "Opens at launch."}
            {px > 0 ? ` 1 ${TICKER} is about $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}.` : ""}
          </p>
        </div>

        <div className={`one ${one ? "" : "is-open"}`} data-key={one?.addr}>
          <svg className="one__yuzu" viewBox="0 0 60 60" aria-hidden="true">
            <Yuzu x={28} y={36} r={20} />
          </svg>
          <div className="one__body">
            <p className="one__k">No. 1 holds the yuzu</p>
            {one ? (
              <>
                <Who addr={one.addr} nickname={one.nickname} pp={one.pp} x={one.x} size={72} />
                <p className="one__bal num">
                  {compact(one.balance)} {TICKER}
                  {worth(one.balance) ? ` · ${worth(one.balance)}` : ""} · next reward +{(share[0] ?? 0).toFixed(4)} ETH
                </p>
              </>
            ) : (
              <p className="one__bal">Nobody yet. The biggest holder takes it.</p>
            )}
          </div>
        </div>

        <div className="pools">
          <div className="tier is-hot">
            <p className="tier__k">
              <b>Hot pool.</b> No. 1-5 share {tiers[0]?.eth ?? "0.014"} ETH of every {reward} ETH reward.
            </p>
            <ol className="tier__list">{ten.slice(1, 5).map((r, i) => soak(r, i + 2))}</ol>
          </div>
          <div className="tier is-warm">
            <p className="tier__k">
              <b>Warm pool.</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH.
            </p>
            <ol className="tier__list">{ten.slice(5).map((r, i) => soak(r, i + 6))}</ol>
          </div>
        </div>

        {live && (pond?.house || pond?.waiting?.length || pond?.out?.length) ? (
          <div className="aside">
            {pond?.house ? (
              <p className="aside__row">
                <b>At the counter</b>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={24} />
                <span>
                  <span className="num">{compact(pond.house.balance)}</span>. The dev wallet: never in the water, never paid.
                </span>
              </p>
            ) : null}
            {pond?.waiting?.length ? (
              <p className="aside__row">
                <b>Washing up</b>
                {pond.waiting.map((w) => (
                  <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={22} />
                ))}
              </p>
            ) : null}
            {pond?.out?.length ? (
              <p className="aside__row is-out">
                <b>Got out</b>
                {pond.out.map((w) => (
                  <span key={w.addr} className="aside__gone">
                    {nameFor(w.addr, w.nickname, w.x).name}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}

        {far.length ? (
          <>
            <h3 className="h3">The towel line</h3>
            <ol className="line" start={11} aria-label="No. 11 to 50">
              {far.map((r) => {
                const gap = bar - parseFloat(r.balance);
                return (
                  <li key={r.addr} data-key={r.addr}>
                    <span className="line__n num">{r.rank}</span>
                    <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={22} />
                    <span className="line__sub num">
                      {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to a spot` : "next in"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : null}
        {taken ? (
          <p className="taken" aria-live="polite">
            The yuzu changed heads.
          </p>
        ) : null}
      </div>
    </section>
  );
}

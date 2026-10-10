/**
 * The Exposure Board: the holders ranked by how close they sit to the core. No. 1 is at the core,
 * No. 1-5 stand in the red zone and No. 6-10 in the amber zone (the emission zone); 11-50 are
 * outside the perimeter with the gap to the zone. When ranks move, rows glide to their new
 * places; a new holder at the core sets off the alarm.
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
import { Prohibit, Warn } from "./Signs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? <CrewFace addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" /> : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openCard(addr)} aria-label={`Open the dosimeter of ${who.name}`}>
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
  const ten = Array.from({ length: 10 }, (_, i) => rows[i]);
  const far = rows.slice(10);
  const core = ten[0];

  // rows glide to their new places when ranks move (FLIP, keyed by wallet)
  const last = useRef(new Map<string, DOMRect>());
  const prevOne = useRef<string | undefined>(undefined);
  const [alarm, setAlarm] = useState(0);
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
    if (prevOne.current && k && k !== prevOne.current) setAlarm((s) => s + 1);
    prevOne.current = k;
  });

  useGSAP(
    () => {
      if (!alarm || prefersReducedMotion()) return;
      gsap.fromTo(".alarm", { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" });
      gsap.to(".alarm", { opacity: 0, delay: 2.4, duration: 0.5 });
    },
    { scope: root, dependencies: [alarm] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the zones are taped off one after the other, then the rows are stamped in
      gsap.from(".zone__tape", { scaleX: 0, transformOrigin: "0% 50%", duration: 0.8, ease: "power3.out", stagger: 0.2, scrollTrigger: { trigger: ".zones", start: "top 80%" } });
      gsap.from(".exp-row", { x: -30, opacity: 0, duration: 0.55, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".zones", start: "top 80%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const row = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`exp-row ${rank <= 5 ? "is-red" : "is-amber"} ${r ? "" : "is-open"}`}>
      <span className="exp-row__n tabular">{String(rank).padStart(2, "0")}</span>
      {r ? (
        <>
          <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={26} />
          <span className="exp-row__dose tabular">
            {compact(r.balance)}
            {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
          </span>
          <span className="exp-row__next tabular">+{(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
        </>
      ) : (
        <>
          <span className="exp-row__open">Position open</span>
          <span className="exp-row__dose">hold more than No. 10 to enter</span>
        </>
      )}
    </li>
  );

  return (
    <section className="expo" id="ladder" ref={root} aria-labelledby="ladder-head">
      <div className="slab">
        <div className="slab__head">
          <h2 className="hz-h2" id="ladder-head">
            Exposure board
          </h2>
          <p className="slab__facts tabular">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} holders on site` : "Opens at launch"}
            {px > 0 ? ` · 1 $HAWK ≈ $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}` : ""}
          </p>
        </div>

        <div className={`core-plate ${core ? "" : "is-open"}`} data-key={core?.addr}>
          <Warn kind="core" size={78} />
          <div className="core-plate__body">
            <p className="core-plate__k">At the core · No. 01</p>
            {core ? (
              <>
                <Who addr={core.addr} nickname={core.nickname} pp={core.pp} x={core.x} size={34} />
                <p className="core-plate__dose tabular">
                  {compact(core.balance)} $HAWK{worth(core.balance) ? ` · ${worth(core.balance)}` : ""} · next dose +{(share[0] ?? 0).toFixed(4)} ETH
                </p>
              </>
            ) : (
              <p className="core-plate__dose">Unoccupied. The biggest holder takes the core.</p>
            )}
          </div>
        </div>

        <div className="zones">
          <div className="zone is-red">
            <p className="zone__tape">
              <b>Red zone</b> No. 1-5 share {tiers[0]?.eth ?? "0.014"} ETH of every {tribute} ETH emission
            </p>
            <ol className="zone__list">{ten.slice(1, 5).map((r, i) => row(r, i + 2))}</ol>
          </div>
          <div className="zone is-amber">
            <p className="zone__tape">
              <b>Amber zone</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH
            </p>
            <ol className="zone__list">{ten.slice(5).map((r, i) => row(r, i + 6))}</ol>
          </div>
        </div>

        {pond?.house || pond?.waiting?.length || pond?.out?.length ? (
          <div className="tags">
            {pond?.house ? (
              <div className="tag is-officer">
                <span className="tag__k">Safety officer</span>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={22} />
                <span className="tag__sub tabular">{compact(pond.house.balance)} · the founder, never ranked, never paid</span>
              </div>
            ) : null}
            {pond?.waiting?.length ? (
              <div className="tag is-wait">
                <span className="tag__k">
                  <HourglassMedium weight="bold" aria-hidden="true" /> Checking in
                </span>
                <span className="tag__list">
                  {pond.waiting.map((w) => (
                    <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={20} />
                  ))}
                </span>
              </div>
            ) : null}
            {pond?.out?.length ? (
              <div className="tag is-out">
                <span className="tag__k">
                  <Prohibit kind="sell" size={24} /> Spaghettified
                </span>
                <span className="tag__list">
                  {pond.out.map((w) => (
                    <span key={w.addr} className="out">
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
            <p className="perimeter">Outside the perimeter</p>
            <ol className="far" start={11} aria-label="No. 11 to 50">
              {far.map((r) => {
                const gap = bar - parseFloat(r.balance);
                return (
                  <li key={r.addr} data-key={r.addr}>
                    <span className="far__n tabular">{r.rank}</span>
                    <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={18} />
                    <span className="far__sub tabular">
                      {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to the zone` : "at the line"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : null}
        {alarm ? (
          <p className="alarm" aria-live="polite">
            Core breached
          </p>
        ) : null}
      </div>
    </section>
  );
}

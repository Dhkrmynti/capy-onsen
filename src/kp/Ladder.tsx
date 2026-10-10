/**
 * The Orbit: the holders as a polar figure. The biggest holder sits on the innermost ring, closest
 * to the singularity; No. 1-5 ride the photon ring, No. 6-10 the accretion disk (the Pull zone),
 * and 11-50 are listed in the far field with the gap to the zone. When ranks move, rows glide to
 * their new places; a new Singularity gets the shout.
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

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? <CrewFace addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" /> : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openCard(addr)} aria-label={`Open the orbit of ${who.name}`}>
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

/** The polar figure: ten rings, one body per ring, each labelled at the edge with a leader line. */
function Polar({ rows }: { rows: (PondRow | undefined)[] }) {
  const S = 520;
  const c = S / 2;
  const ring = (i: number) => 46 + i * 19;
  return (
    <svg className="polar" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="The ten closest orbits, No. 1 innermost">
      {rows.map((_, i) => (
        <circle key={i} className={`polar__ring ${i < 5 ? "is-photon" : ""}`} cx={c} cy={c} r={ring(i)} />
      ))}
      <circle className="polar__hole" cx={c} cy={c} r={30} />
      <text className="polar__t" x={c} y={c + 4} textAnchor="middle">
        rₛ
      </text>
      {rows.map((r, i) => {
        const a = -Math.PI / 2 + i * ((Math.PI * 2) / 10) + 0.3;
        const x = c + Math.cos(a) * ring(i);
        const y = c + Math.sin(a) * ring(i);
        const lx = c + Math.cos(a) * 252;
        const ly = c + Math.sin(a) * 252;
        const right = Math.cos(a) >= 0;
        const name = r ? nameFor(r.addr, r.nickname, r.x).name : "open";
        return (
          <g key={i} className={`polar__body ${i === 0 ? "is-one" : ""} ${r ? "" : "is-open"}`}>
            <line className="polar__lead" x1={x} y1={y} x2={lx} y2={ly} />
            <line className="polar__lead" x1={lx} y1={ly} x2={lx + (right ? 10 : -10)} y2={ly} />
            <circle className="polar__dot" cx={x} cy={y} r={i === 0 ? 7 : 4.5} />
            <text className="polar__label" x={lx + (right ? 14 : -14)} y={ly + 4} textAnchor={right ? "start" : "end"}>
              {String(i + 1).padStart(2, "0")} {name.length > 14 ? name.slice(0, 13) + "…" : name}
            </text>
          </g>
        );
      })}
    </svg>
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

  // rows glide to their new places when ranks move (FLIP, keyed by wallet)
  const last = useRef(new Map<string, DOMRect>());
  const prevOne = useRef<string | undefined>(undefined);
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
    if (prevOne.current && k && k !== prevOne.current) setShout((s) => s + 1);
    prevOne.current = k;
  });

  useGSAP(
    () => {
      if (!shout || prefersReducedMotion()) return;
      gsap.fromTo(".shout", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" });
      gsap.to(".shout", { opacity: 0, delay: 2.2, duration: 0.5 });
    },
    { scope: root, dependencies: [shout] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the rings are drawn outward, then the leaders and labels follow
      gsap
        .timeline({ scrollTrigger: { trigger: ".polar", start: "top 80%" } })
        .from(".polar__ring", { attr: { r: 0 }, duration: 1.2, ease: "expo.out", stagger: 0.04 })
        .from(".polar__lead", { opacity: 0, duration: 0.5, stagger: 0.02 }, "-=0.6")
        .from(".polar__label", { opacity: 0, duration: 0.6, stagger: 0.03 }, "<");
      gsap.from(".orbit-row", { y: 14, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: ".orbits", start: "top 85%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const row = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`orbit-row ${rank === 1 ? "is-one" : rank <= 5 ? "is-photon" : "is-disk"} ${r ? "" : "is-open"}`}>
      <span className="orbit-row__n tabular">{String(rank).padStart(2, "0")}</span>
      {r ? (
        <>
          <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={rank === 1 ? 30 : 24} />
          <span className="orbit-row__m tabular">
            m = {compact(r.balance)}
            {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
          </span>
          <span className="orbit-row__next tabular">{(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
        </>
      ) : (
        <>
          <span className="orbit-row__open">Empty orbit</span>
          <span className="orbit-row__m">{rank === 1 ? "the singularity is unclaimed" : "hold more than No. 10 to fall in"}</span>
        </>
      )}
    </li>
  );

  return (
    <section className="orbit" id="ladder" ref={root} aria-labelledby="ladder-head">
      <div className="frame">
        <div className="frame__head">
          <h2 className="vd-h2" id="ladder-head">
            The orbit.
          </h2>
          <p className="frame__facts tabular">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} bodies in the field` : "Opens at launch"}
            {px > 0 ? ` · 1 $VOID ≈ $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}` : ""}
          </p>
        </div>

        <div className="orbit__grid">
          <figure className="orbit__fig">
            <Polar rows={ten} />
            <figcaption className="caption">
              <i>Fig. 2.</i> The ten closest orbits. More mass, smaller orbit; No. 1 sits nearest the singularity.
            </figcaption>
          </figure>
          <div className="orbits">
            <p className="orbits__label">
              <b>Photon ring</b> No. 1-5 share {tiers[0]?.eth ?? "0.014"} ETH of every {tribute} ETH Pull
            </p>
            <ol className="orbits__list">{ten.slice(0, 5).map((r, i) => row(r, i + 1))}</ol>
            <p className="orbits__label">
              <b>Accretion disk</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH
            </p>
            <ol className="orbits__list">{ten.slice(5).map((r, i) => row(r, i + 6))}</ol>
          </div>
        </div>

        {pond?.house || pond?.waiting?.length || pond?.out?.length ? (
          <div className="tags">
            {pond?.house ? (
              <div className="tag is-observer">
                <span className="tag__k">Observer</span>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={22} />
                <span className="tag__sub tabular">m = {compact(pond.house.balance)} · founder, never ranked, never paid</span>
              </div>
            ) : null}
            {pond?.waiting?.length ? (
              <div className="tag is-wait">
                <span className="tag__k">
                  <HourglassMedium weight="bold" aria-hidden="true" /> Falling in
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
                <span className="tag__k">Spaghettified</span>
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
          <ol className="far" start={11} aria-label="No. 11 to 50, the far field">
            {far.map((r) => {
              const gap = bar - parseFloat(r.balance);
              return (
                <li key={r.addr} data-key={r.addr}>
                  <span className="far__n tabular">{r.rank}</span>
                  <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={18} />
                  <span className="far__sub tabular">
                    m = {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to the ten` : "at the line"}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}
        {shout ? (
          <p className="shout" aria-live="polite">
            New Singularity
          </p>
        ) : null}
      </div>
    </section>
  );
}

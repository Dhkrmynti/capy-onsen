/**
 * The Crew: the holders as a mission roster. No. 1 is the Commander in the big circle under the
 * rays, 2-5 the flight crew and 6-10 the backup crew (the Supply Drop zone), 11-50 the roster
 * with the gap to the zone. When ranks move, seats glide to their new places; a new Commander
 * gets the shout.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Eject, HourglassMedium, Broadcast } from "@phosphor-icons/react";
import {
  DEFAULT_TIERS,
  compact,
  splitInheritance,
  usd,
  type Pond,
  type PondRow,
  type Status,
} from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { openCard } from "../components/CrewCard";
import { CrewFace, XCheck, XLink } from "../components/Face";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Who({
  addr,
  nickname,
  pp,
  x,
  size = 28,
}: {
  addr: string;
  nickname?: string;
  pp?: number[] | null;
  x?: PondRow["x"];
  size?: number;
}) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? (
        <CrewFace
          addr={addr}
          pp={pp ?? null}
          x={x ?? null}
          size={size}
          className="who__face"
        />
      ) : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button
        type="button"
        className="who__name"
        onClick={() => openCard(addr)}
        aria-label={`Open the seat of ${who.name}`}
      >
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

export function Ladder({
  status,
  pond,
}: {
  status: Status | null;
  pond: Pond | null;
}) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const rows = live ? (pond?.rows ?? []).slice(0, 50) : [];
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const tribute = parseFloat(
    status?.cycle.steps.find((s) => s.kind === "feeding")?.thresholdETH ??
      "0.02",
  );
  const share = splitInheritance(
    tribute,
    rows.filter((r) => r.inTop).map((r) => parseFloat(r.balance)),
    tiers,
  );
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
    el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) =>
      now.set(n.dataset.key!, n.getBoundingClientRect()),
    );
    if (!prefersReducedMotion())
      el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => {
        const a = last.current.get(n.dataset.key!);
        const b = now.get(n.dataset.key!);
        if (
          !a ||
          !b ||
          (Math.abs(a.left - b.left) < 2 && Math.abs(a.top - b.top) < 2)
        )
          return;
        gsap.fromTo(
          n,
          { x: a.left - b.left, y: a.top - b.top, zIndex: 3 },
          { x: 0, y: 0, duration: 0.9, ease: "expo.out", clearProps: "zIndex" },
        );
      });
    last.current = now;
    const k = rows[0]?.addr;
    if (prevKing.current && k && k !== prevKing.current) setShout((s) => s + 1);
    prevKing.current = k;
  });

  useGSAP(
    () => {
      if (!shout || prefersReducedMotion()) return;
      gsap.fromTo(
        ".shout",
        { scale: 2.4, rotate: -12, opacity: 0 },
        {
          scale: 1,
          rotate: -6,
          opacity: 1,
          duration: 0.45,
          ease: "back.out(2)",
        },
      );
      gsap.to(".shout", { opacity: 0, delay: 2.2, duration: 0.5 });
    },
    { scope: root, dependencies: [shout] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the rays turn up behind the Commander, then the crew take their seats down the diagonal
      gsap.from(".cmd__rays", {
        rotate: -40,
        scale: 0.6,
        opacity: 0,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: ".cmd", start: "top 80%" },
      });
      gsap.from(".seat-row", {
        x: 60,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: ".seats", start: "top 82%" },
      });
      gsap.from(".roster li", {
        y: 12,
        opacity: 0,
        duration: 0.5,
        ease: "expo.out",
        stagger: { each: 0.01, from: "start" },
        scrollTrigger: { trigger: ".roster", start: "top 90%" },
      });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const cmd = rows[0];
  const seat = (r: PondRow | undefined, rank: number) => (
    <li
      key={r?.addr ?? `open-${rank}`}
      data-key={r?.addr}
      className={`seat-row ${rank <= 5 ? "is-flight" : "is-backup"} ${r ? "" : "is-open"}`}
    >
      <span className="seat-row__n tabular">
        {String(rank).padStart(2, "0")}
      </span>
      {r ? (
        <>
          <Who
            addr={r.addr}
            nickname={r.nickname}
            pp={r.pp}
            x={r.x}
            size={rank <= 5 ? 30 : 24}
          />
          <span className="seat-row__bal tabular">
            {compact(r.balance)}
            {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
          </span>
          <span className="seat-row__next tabular">
            {(share[rank - 1] ?? 0).toFixed(4)} ETH
          </span>
        </>
      ) : (
        <>
          <span className="seat-row__open">Open seat</span>
          <span className="seat-row__bal">
            hold more than No. 10 to take it
          </span>
        </>
      )}
    </li>
  );

  return (
    <section
      className="crew"
      id="ladder"
      ref={root}
      aria-labelledby="ladder-head"
    >
      <div className="crew__sheet">
        <div className="crew__top">
          <h2 className="sr-h2" id="ladder-head">
            The crew.
          </h2>
          <p className="crew__facts tabular">
            {live
              ? `${(pond?.total ?? 0).toLocaleString("en-US")} on the roster`
              : "Opens at launch"}
            {px > 0
              ? ` · 1 $ORBIT ≈ $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}`
              : ""}
          </p>
        </div>

        <div className="crew__grid">
          <div className={`cmd ${cmd ? "" : "is-open"}`} data-key={cmd?.addr}>
            <div className="cmd__rays" aria-hidden="true" />
            <div className="cmd__disc">
              {cmd ? (
                <CrewFace
                  addr={cmd.addr}
                  pp={cmd.pp}
                  x={cmd.x ?? null}
                  size={150}
                  className="cmd__face"
                />
              ) : (
                <span className="cmd__empty">01</span>
              )}
            </div>
            <p className="cmd__k">Commander</p>
            {cmd ? (
              <>
                <Who
                  addr={cmd.addr}
                  nickname={cmd.nickname}
                  pp={cmd.pp}
                  x={cmd.x}
                  size={0}
                />
                <p className="cmd__bal tabular">
                  {compact(cmd.balance)} $ORBIT
                  {worth(cmd.balance) ? ` · ${worth(cmd.balance)}` : ""}
                </p>
                <p className="cmd__next tabular">
                  next drop {(share[0] ?? 0).toFixed(4)} ETH
                </p>
              </>
            ) : (
              <p className="cmd__bal">
                The seat is empty. The biggest holder takes it.
              </p>
            )}
          </div>

          <div className="seats">
            <p className="seats__label">
              <b>Flight crew</b> No. 2-5 · No. 1-5 share{" "}
              {tiers[0]?.eth ?? "0.014"} ETH of every {tribute} ETH drop
            </p>
            <ol
              className="seats__list"
              aria-label={`Flight crew: No. 1-5 share ${tiers[0]?.eth ?? "0.014"} ETH of every Supply Drop`}
            >
              {officers.slice(1).map((r, i) => seat(r, i + 2))}
            </ol>
            <p className="seats__label">
              <b>Backup crew</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH
            </p>
            <ol
              className="seats__list"
              aria-label={`Backup crew: No. 6-10 share ${tiers[1]?.eth ?? "0.006"} ETH of every Supply Drop`}
            >
              {hands.map((r, i) => seat(r, i + 6))}
            </ol>
          </div>
        </div>

        {pond?.house || pond?.waiting?.length || pond?.out?.length ? (
          <div className="tags">
            {pond?.house ? (
              <div className="tag is-ground">
                <span className="tag__k">
                  <Broadcast weight="bold" aria-hidden="true" /> Ground control
                </span>
                <Who
                  addr={pond.house.addr}
                  nickname={pond.house.nickname}
                  pp={pond.house.pp}
                  x={pond.house.x}
                  size={22}
                />
                <span className="tag__sub tabular">
                  {compact(pond.house.balance)} · founder, never ranked, never
                  paid
                </span>
              </div>
            ) : null}
            {pond?.waiting?.length ? (
              <div className="tag is-wait">
                <span className="tag__k">
                  <HourglassMedium weight="bold" aria-hidden="true" /> Boarding
                </span>
                <span className="tag__list">
                  {pond.waiting.map((w) => (
                    <Who
                      key={w.addr}
                      addr={w.addr}
                      nickname={w.nickname}
                      pp={w.pp}
                      x={w.x}
                      size={20}
                    />
                  ))}
                </span>
              </div>
            ) : null}
            {pond?.out?.length ? (
              <div className="tag is-out">
                <span className="tag__k">
                  <Eject weight="bold" aria-hidden="true" /> Ejected
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

        {crowd.length ? (
          <ol className="roster" start={11} aria-label="No. 11 to 50">
            {crowd.map((r) => {
              const gap = bar - parseFloat(r.balance);
              return (
                <li key={r.addr} data-key={r.addr}>
                  <span className="roster__n tabular">{r.rank}</span>
                  <Who
                    addr={r.addr}
                    nickname={r.nickname}
                    pp={r.pp}
                    x={r.x}
                    size={18}
                  />
                  <span className="roster__sub tabular">
                    {compact(r.balance)} ·{" "}
                    {gap > 0
                      ? `+${compact(gap + 1)} to the ten`
                      : "at the line"}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}
        {shout ? (
          <p className="shout" aria-live="polite">
            New Commander!
          </p>
        ) : null}
      </div>
    </section>
  );
}

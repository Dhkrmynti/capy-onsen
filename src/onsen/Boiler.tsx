/**
 * The boiler room, under the bath: the loop the engine runs. Trading fees come down the pipe and
 * fill the escrow; at each level the engine collects them and runs the next step: the reward, the
 * treasury, the buyback that is burned in the furnace, the treasury again. On wide screens the
 * four stations are one long pipe run you scroll along; on phones they stack down a riser.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, STEP, addrUrl, amount, short, stepShare, type RoundKind, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const P = "#f3ead8";
const art = { stroke: P, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const open = { ...art, fill: "none" };

function Art({ kind }: { kind: RoundKind }) {
  if (kind === "feeding")
    return (
      <svg className="station__art" viewBox="0 0 160 120" aria-hidden="true">
        <path d="M38 52 L48 108 H112 L122 52 Z" fill="#c58b52" {...art} />
        <path d="M41 70 H119 M45 92 H115" {...open} strokeWidth={2} />
        <path d="M38 52 Q80 16 122 52" {...open} />
        <path d="M66 22 l12 -16 l12 16 l-12 16 Z" fill="#f4c430" {...art} strokeWidth={2.4} />
        <path d="M100 34 l8 -11 l8 11 l-8 11 Z" fill="#f4c430" {...art} strokeWidth={2.4} />
        <path d="M40 38 l7 -9 l7 9 l-7 9 Z" fill="#f4c430" {...art} strokeWidth={2.4} />
      </svg>
    );
  if (kind === "keeper")
    return (
      <svg className="station__art" viewBox="0 0 160 120" aria-hidden="true">
        <rect x="30" y="44" width="100" height="64" fill="#c58b52" {...art} />
        <path d="M30 62 H130" {...open} strokeWidth={2} />
        <rect x="62" y="30" width="36" height="14" fill="#8e5a2c" {...art} />
        <path d="M70 37 H90" {...open} strokeWidth={2.4} />
        <rect x="70" y="74" width="20" height="18" fill="#f4c430" {...art} strokeWidth={2.4} />
        <path d="M74 74 V68 a6 6 0 0 1 12 0 V74" {...open} strokeWidth={2.4} />
      </svg>
    );
  return (
    <svg className="station__art" viewBox="0 0 160 120" aria-hidden="true">
      <path d="M26 108 V40 Q80 4 134 40 V108 Z" fill="#3a332d" {...art} />
      <path d="M50 108 V62 Q80 40 110 62 V108 Z" fill="#1b1917" {...art} />
      <path className="flame is-a" d="M80 106 C 60 98, 62 80, 74 70 C 74 80, 82 80, 80 62 C 96 74, 102 96, 80 106 Z" fill="#e4472b" stroke="none" />
      <path className="flame is-b" d="M80 106 C 70 102, 70 90, 78 84 C 78 90, 84 90, 82 80 C 92 88, 92 102, 80 106 Z" fill="#f4c430" stroke="none" />
      <path d="M26 40 H134" {...open} strokeWidth={2} />
    </svg>
  );
}

export function Boiler({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const live = !!status?.tokenAddress;
  const at = live ? status!.cycle.index : -1;
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const treasury = live ? status?.treasuryAddress : "";
  const burned = parseFloat(status?.totals.tokensBurned ?? "0");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the fees run down the drain pipe as the boiler room comes up
      gsap.fromTo(".drain__pipe i", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".drain", start: "top 75%", end: "bottom 45%", scrub: 0.4 } });
      const mm = gsap.matchMedia();
      mm.add("(min-width: 901px)", () => {
        const run = root.current!.querySelector<HTMLElement>(".run")!;
        const track = root.current!.querySelector<HTMLElement>(".run__track")!;
        const far = () => Math.max(0, track.scrollWidth - run.clientWidth);
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: run, start: "center center", end: () => `+=${far()}`, pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1 } })
          .to(track, { x: () => -far() }, 0)
          .fromTo(".run__pipe i", { scaleX: 0 }, { scaleX: 1 }, 0);
      });
      mm.add("(max-width: 900px)", () => {
        gsap.fromTo(".run__pipe i", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".run", start: "top 70%", end: "bottom 60%", scrub: 0.4 } });
        gsap.utils.toArray<HTMLElement>(".station").forEach((el) => gsap.from(el, { x: 24, opacity: 0, duration: 0.55, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 84%" } }));
      });
    },
    { scope: root },
  );

  const line = (kind: RoundKind, i: number) =>
    kind === "feeding"
      ? `ETH straight to the ten in the water. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance inside each pool.`
      : kind === "sink"
        ? `Buys ${TICKER} back on Pons, then burns exactly what it bought. The furnace is what keeps the water hot.`
        : steps.findIndex((s) => s.kind === "keeper") === i
          ? "ETH to the treasury wallet. Every transfer is in the ledger below."
          : "The treasury a second time. Then the loop starts over.";

  return (
    <section className="sec boiler" id="boiler" ref={root} aria-labelledby="boiler-head">
      <div className="drain" aria-hidden="true">
        <div className="drain__floor" />
        <div className="drain__pipe">
          <i />
        </div>
      </div>
      <div className="wrap">
        <div className="sec__head">
          <h2 className="h2" id="boiler-head">
            Every trade stokes the fire.
          </h2>
          <p className="deck">Each trade's creator fee builds up in the Pons fee escrow. When it reaches the next step's level, the engine collects it and runs that step. Four steps, then round again.</p>
        </div>
      </div>
      <div className="run">
        <div className="run__track">
          <div className="run__pipe" aria-hidden="true">
            <i />
          </div>
          <ol className="stations">
            {steps.map((s, i) => {
              const now = at === i;
              const level = parseFloat(s.thresholdETH);
              const fill = now ? Math.min(1, escrow / level) : 0;
              return (
                <li key={i} className={`station is-${s.kind} ${now ? "is-now" : ""}`} aria-current={now ? "step" : undefined}>
                  <span className="station__valve" aria-hidden="true" />
                  <span className="station__n">{i + 1}</span>
                  <Art kind={s.kind} />
                  <h3 className="station__name">{STEP[s.kind].name}</h3>
                  <p className="station__eth num">{level} ETH</p>
                  <p className="station__line">{line(s.kind, i)}</p>
                  {now ? (
                    <p className="station__meter" role="img" aria-label={`${escrow.toFixed(4)} of ${level} ETH collected`}>
                      <span className="station__bar">
                        <i style={{ width: `${fill * 100}%` }} />
                      </span>
                      <span className="num">
                        Filling now: {escrow.toFixed(4)} / {level} ETH
                      </span>
                    </p>
                  ) : (
                    <p className="station__wait">{live ? "Waiting its turn." : "Starts at launch."}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className="wrap">
        <p className="sum num">
          Over one full loop: <b>{stepShare(steps, "feeding")}%</b> to the ten in the bath, <b>{stepShare(steps, "keeper")}%</b> to the treasury, <b>{stepShare(steps, "sink")}%</b> bought back and burned.
        </p>
        <p className="plain">
          {burned > 0 ? (
            <>
              <span className="num">{amount(burned)}</span> {TICKER} burned so far.{" "}
            </>
          ) : null}
          {treasury ? (
            <>
              Treasury wallet:{" "}
              <a href={addrUrl(treasury)} target="_blank" rel="noreferrer" className="num">
                {short(treasury)} <ArrowUpRight weight="bold" aria-hidden="true" />
              </a>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}

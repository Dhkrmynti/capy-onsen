/**
 * The Emission Cycle: the three kinds of step as placards posted in a row, the way a plant posts
 * its procedure. Only the one running now is lit, with its beacon on and the escrow filling toward
 * its level; the other two stand greyed out until their turn.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Mandatory, Prohibit, Warn, type Pict } from "./Signs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const at = status?.tokenAddress ? status.cycle.index : -1;
  const escrow = parseFloat(status?.escrowETH ?? "0");
  // each kind of step once, in the order it first runs
  const kinds = steps.map((s) => s.kind).filter((k, i, all) => all.indexOf(k) === i);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // placards are posted one after another as you scroll, swinging on their top screws
      gsap
        .timeline({ scrollTrigger: { trigger: ".placards", start: "top 85%", end: "center 55%", scrub: 0.7 } })
        .from(".post", { rotate: -12, y: 60, opacity: 0, transformOrigin: "50% 0%", ease: "back.out(1.6)", stagger: 0.25 });
    },
    { scope: root },
  );
  const look: Record<string, { name: string; line: string; sign: "warn" | "mand" | "proh"; pict: Pict }> = {
    feeding: { name: "The Emission", line: `ETH to the ten nearest the core. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance.`, sign: "warn", pict: "core" },
    keeper: { name: "Containment Fund", line: "To the treasury wallet. Every transfer is in the incident log.", sign: "mand", pict: "vault" },
    sink: { name: "Evaporation", line: "Buys $HAWK back on Pons, then burns exactly what it bought.", sign: "proh", pict: "flame" },
  };
  return (
    <section className="cycle" id="round" ref={root} aria-labelledby="round-head">
      <div className="slab is-wide">
        <div className="slab__head">
          <h2 className="hz-h2" id="round-head">
            Every trade charges the core.
          </h2>
          <p className="slab__deck">Each trade's creator fee builds up in the Pons fee escrow. When it reaches the next step's level, the engine collects it and runs that step. Then the next, then the cycle starts over.</p>
        </div>
        <ol className="placards">
          {kinds.map((kind, k) => {
            const l = look[kind];
            const Sign = l.sign === "warn" ? Warn : l.sign === "mand" ? Mandatory : Prohibit;
            const mine = steps.map((s, i) => (s.kind === kind ? i : -1)).filter((i) => i >= 0);
            const live = at >= 0;
            const now = live && steps[at]?.kind === kind;
            const level = parseFloat((now ? steps[at] : steps[mine[0]]).thresholdETH);
            const fill = now ? Math.min(1, escrow / level) : 0;
            const turn = now && mine.length > 1 ? mine.indexOf(at) + 1 : 0;
            return (
              <li key={kind} className={`post is-${kind} ${now ? "is-now" : live ? "is-idle" : ""}`} aria-current={now ? "step" : undefined}>
                <span className="post__screws" aria-hidden="true" />
                <span className="post__head">
                  <span className="post__n tabular">Step {k + 1}</span>
                  {now ? <span className="post__beacon">Running</span> : live ? <span className="post__wait">Waiting</span> : null}
                </span>
                <Sign kind={l.pict} size={86} />
                <span className="post__name">{l.name}</span>
                <span className="post__sol tabular">
                  {level} ETH{mine.length > 1 ? ` · runs ${mine.length}× per cycle` : ""}
                </span>
                <span className="post__line">{l.line}</span>
                {now ? (
                  <span className="post__meter" role="img" aria-label={`${escrow.toFixed(4)} of ${level} ETH collected`}>
                    <span className="post__bar">
                      <span style={{ width: `${fill * 100}%` }} />
                    </span>
                    <span className="post__read tabular">
                      {escrow.toFixed(4)} / {level} ETH{turn ? ` · round ${turn} of ${mine.length}` : ""}
                    </span>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="cycle__order">Order: {steps.map((s) => look[s.kind].name).join(" → ")} → again.</p>
        <p className="cycle__sum tabular">
          Over a full cycle: <b>{stepShare(steps, "feeding")}%</b> emitted to the ten, <b>{stepShare(steps, "keeper")}%</b> to containment, <b>{stepShare(steps, "sink")}%</b> evaporated.
        </p>
      </div>
    </section>
  );
}

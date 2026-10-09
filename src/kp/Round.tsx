/**
 * The Round: the four moves the engine plays with the fees, read like a game score. The page
 * holds while the moves slide past sideways; each move owns its own colour.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Fire, Vault } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, stepShare, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { useMedia } from "../components/Bits";
import { Piece, pieceFor } from "./Pieces";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Round({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const eth = (k: string) => steps.find((s) => s.kind === k)?.thresholdETH ?? "0";
  const at = status?.tokenAddress ? status.cycle.index : -1;

  useGSAP(
    () => {
      if (prefersReducedMotion() || narrow) return;
      const track = root.current!.querySelector<HTMLElement>(".moves")!;
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
      });
    },
    { scope: root, dependencies: [narrow] },
  );

  const moves = [
    {
      n: 1,
      cls: "is-tribute",
      name: "The Tribute",
      eth: eth("feeding"),
      line: `Straight to the top 10. No. 1–5 split ${tiers[0]?.eth ?? "0.014"}, No. 6–10 split ${tiers[1]?.eth ?? "0.006"}, by balance.`,
      art: (
        <div className="move__art is-row">
          {Array.from({ length: 10 }, (_, i) => (
            <Piece key={i} kind={pieceFor(i + 1)} tone={i === 0 ? "crown" : "cream"} size={i < 5 ? 58 : 40} />
          ))}
        </div>
      ),
    },
    { n: 2, cls: "is-chest", name: "The War Chest", eth: eth("keeper"), line: "To the treasury wallet. Every transfer is on the Record.", art: <Vault className="move__icon" weight="fill" aria-hidden="true" /> },
    { n: 3, cls: "is-burn", name: "The Burn", eth: eth("sink"), line: "Buys $KING back on the market, then burns exactly what it bought.", art: <Fire className="move__icon" weight="fill" aria-hidden="true" /> },
    { n: 4, cls: "is-chest is-again", name: "The War Chest", eth: eth("keeper"), line: "Treasury again. Then the round starts over from move one.", art: <Vault className="move__icon" weight="fill" aria-hidden="true" /> },
  ];

  return (
    <section className="round" id="round" ref={root} aria-labelledby="round-head">
      <div className="moves">
        <div className="move is-intro">
          <h2 className="kp-h2 is-huge" id="round-head">
            Four moves.
            <br />
            Every round.
          </h2>
          <p className="move__line">Every trade drops a fee in the escrow. Each time it reaches the next move's size, the engine plays it.</p>
        </div>
        {moves.map((m, i) => (
          <article key={m.n} className={`move ${m.cls} ${at === i ? "is-now" : ""}`} aria-label={`Move ${m.n}: ${m.name}, ${m.eth} ETH`}>
            <p className="move__n tabular">{m.n}.</p>
            <h3 className="move__name">{m.name}</h3>
            <p className="move__eth tabular">{m.eth} ETH</p>
            {m.art}
            <p className="move__line">{m.line}</p>
            {at === i ? <p className="move__now">Next move</p> : null}
          </article>
        ))}
        <div className="move is-tally">
          <h3 className="move__name">Over one round</h3>
          <div className="tally" role="img" aria-label={`Tribute ${stepShare(steps, "feeding")} percent, War Chest ${stepShare(steps, "keeper")} percent, Burn ${stepShare(steps, "sink")} percent`}>
            <span className="tally__part is-tribute" style={{ flexGrow: stepShare(steps, "feeding") }}>
              <b className="tabular">{stepShare(steps, "feeding")}%</b> Tribute
            </span>
            <span className="tally__part is-chest" style={{ flexGrow: stepShare(steps, "keeper") }}>
              <b className="tabular">{stepShare(steps, "keeper")}%</b> War Chest
            </span>
            <span className="tally__part is-burn" style={{ flexGrow: stepShare(steps, "sink") }}>
              <b className="tabular">{stepShare(steps, "sink")}%</b> Burn
            </span>
          </div>
          <p className="move__line">Round after round, for as long as people trade.</p>
        </div>
      </div>
    </section>
  );
}

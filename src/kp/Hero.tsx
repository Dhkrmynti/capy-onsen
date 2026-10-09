/**
 * The opening: the King's portrait in a printed frame, and a crown that drops onto it. When the
 * King changes the crown lifts off and drops onto the new one. Scrolling lays the board flat and
 * carries you onto the Ladder.
 */
import { Suspense, lazy, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, compact, usd, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton } from "../components/Bits";
import { CrewFace, XCheck, XLink } from "../components/Face";
import { Clock } from "./Clock";
import { Piece } from "./Pieces";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Crown3D = lazy(() => import("./Crown3D"));

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const king = live ? pond?.rows[0] : undefined;
  const second = live ? pond?.rows[1] : undefined;
  const lead = king && second ? parseFloat(king.balance) - parseFloat(second.balance) : 0;
  const who = king ? nameFor(king.addr, king.nickname, king.x) : null;
  const px = status?.price?.tokenUSD ?? 0;
  const still = prefersReducedMotion();

  useGSAP(
    () => {
      if (still) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".board3d", { rotateX: 75, y: 160, opacity: 0, duration: 1.4 })
        .from(".hero__frame", { y: 80, rotate: 8, opacity: 0, duration: 1 }, "-=1")
        .from(".hero__h .ln", { yPercent: 110, duration: 1, stagger: 0.08 }, "-=0.8")
        .from(".hero__read, .hero__acts, .hero__clock", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.6");
      // scroll lays the board flat and carries you onto the Ladder
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=85%", scrub: 0.6, pin: true, anticipatePin: 1, refreshPriority: 2 } })
        .to(".hero__copy", { y: -140, opacity: 0, ease: "power1.in" }, 0)
        .to(".board3d", { rotateX: 0, scale: 1.45, y: -40, ease: "none" }, 0)
        .to(".hero__throne", { scale: 0.5, y: 120, rotate: -6, opacity: 0, ease: "power1.in" }, 0.1);
    },
    { scope: root },
  );

  const empty = !king || !who;
  const lines: [string, string] = offline ? ["The board is", "offline."] : empty ? ["The throne", "is empty."] : ["The King is", `${who!.name}.`];

  return (
    <section className="hero" id="top" ref={root} aria-label="Kingpin: who wears the crown">
      <div className="hero__board" aria-hidden="true">
        <div className="board3d">
          {Array.from({ length: 64 }, (_, i) => (
            <span key={i} className={`sq ${(Math.floor(i / 8) + i) % 2 ? "is-b" : "is-a"}`} />
          ))}
        </div>
      </div>

      <div className="hero__copy">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">{lines[0]}</span>
          </span>
          <span className="mask">
            <span className={`ln is-crown ${!empty && who!.name.length > 16 ? "is-longer" : !empty && who!.name.length > 11 ? "is-long" : ""}`}>{lines[1]}</span>
          </span>
        </h1>
        <p className="hero__read" role="status">
          {offline
            ? "Back in a moment."
            : !live
              ? "Opens at launch. Hold the most $KING and the crown drops on you."
              : empty
                ? "Hold 100,000 $KING without selling and the crown is yours."
                : `${compact(king!.balance)} $KING${px > 0 ? ` (${usd(parseFloat(king!.balance) * px)})` : ""}${second ? ` · +${compact(lead)} ahead of No. 2` : ""}`}
        </p>
        <p className="hero__escrow tabular">
          {live ? escrow.toFixed(4) : "0.0000"} / {next.thresholdETH} ETH to the next move
        </p>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="kp-btn is-ghost" href="#ladder">
            See the Ladder
          </a>
        </div>
      </div>

      <div className="hero__throne" aria-hidden={empty}>
        <div className="hero__crown">
          {canWebGL() ? (
            <Suspense fallback={null}>
              <Crown3D still={still} dropKey={king?.addr ?? "empty"} empty={empty} />
            </Suspense>
          ) : null}
        </div>
        <figure className={`hero__frame ${empty ? "is-empty" : ""}`}>
          {empty ? (
            <Piece kind="king" tone="violet" size={150} className="hero__ghost" />
          ) : (
            <CrewFace addr={king!.addr} pp={king!.pp} x={king!.x} size={260} className="hero__portrait" />
          )}
          <figcaption className="hero__plate">
            {empty ? (
              <span>No. 1 · open</span>
            ) : (
              <>
                {king!.x ? <XLink x={king!.x} className="hero__x" /> : null}
                <span className="hero__plate-name">{who!.name}</span>
                {king!.x ? <XCheck x={king!.x} /> : null}
                <span className="hero__plate-sq tabular">No. 1 · e1</span>
              </>
            )}
          </figcaption>
        </figure>
      </div>

      <div className="hero__clock">
        <Clock value={escrow} target={parseFloat(next.thresholdETH)} kind={next.kind} live={live} />
      </div>
    </section>
  );
}

/**
 * The opening: the board in play, tilted toward you, the King turning on his square, the chess
 * clock running down to the next move. Scrolling lays the board flat and you walk onto the Ladder.
 */
import { Suspense, lazy, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, compact, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton } from "../components/Bits";
import { CrewFace } from "../components/Face";
import { Clock } from "./Clock";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const King3D = lazy(() => import("./King3D"));

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
  const still = prefersReducedMotion();

  useGSAP(
    () => {
      if (still) return;
      // the opening beat: board rises into place, the words are set on it
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".board3d", { rotateX: 75, y: 160, opacity: 0, duration: 1.4 })
        .from(".hero__h .ln", { yPercent: 110, duration: 1, stagger: 0.08 }, "-=0.9")
        .from(".hero__read, .hero__acts, .clock", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.6");
      // the signature move: scroll lays the board flat and carries you onto the Ladder
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=85%", scrub: 0.6, pin: true, anticipatePin: 1 } })
        .to(".hero__copy", { y: -140, opacity: 0, ease: "power1.in" }, 0)
        .to(".hero__clock", { x: 120, opacity: 0, ease: "power1.in" }, 0)
        .to(".board3d", { rotateX: 0, scale: 1.45, y: -40, ease: "none" }, 0)
        .to(".hero__king", { scale: 0.55, y: -90, opacity: 0, ease: "power1.in" }, 0.15);
    },
    { scope: root },
  );

  const read = offline ? (
    <>The board is offline for a moment.</>
  ) : !live ? (
    <>The throne is empty until launch. Hold the most $KING and it is yours.</>
  ) : king && who ? (
    <>
      <CrewFace addr={king.addr} pp={king.pp} x={king.x} size={26} className="hero__face" />
      <b>{who.name}</b> holds the crown · {compact(king.balance)} $KING{second ? ` · +${compact(lead)} ahead` : ""}
    </>
  ) : (
    <>The throne is empty. Hold 100,000 $KING without selling and it is yours.</>
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Kingpin: take the crown">
      <div className="hero__board" aria-hidden="true">
        <div className="board3d">
          {Array.from({ length: 64 }, (_, i) => (
            <span key={i} className={`sq ${(Math.floor(i / 8) + i) % 2 ? "is-b" : "is-a"} ${i === 19 ? "is-throne" : ""}`} />
          ))}
        </div>
      </div>
      <div className="hero__king" aria-hidden="true">
        {canWebGL() ? (
          <Suspense fallback={null}>
            <King3D still={still} />
          </Suspense>
        ) : null}
      </div>
      <div className="hero__copy">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">Take the</span>
          </span>
          <span className="mask">
            <span className="ln is-crown">crown.</span>
          </span>
        </h1>
        <p className="hero__read" role="status">
          {read}
        </p>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="kp-btn is-ghost" href="#card">
            Check your seat
          </a>
        </div>
      </div>
      <div className="hero__clock">
        <Clock value={escrow} target={parseFloat(next.thresholdETH)} kind={next.kind} live={live} />
      </div>
    </section>
  );
}

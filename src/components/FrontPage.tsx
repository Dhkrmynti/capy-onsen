import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_STEPS, STEP, amount, eth, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Halftone } from "./Halftone";
import { BuyButton, CaCoupon, Fuse, useMedia, useNow } from "./Bits";
import { ConnectButton } from "./Connect";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function dateline(now: number) {
  return new Date(now).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** The front page headline is the engine's state, set in wood type. */
function story(status: Status | null, offline: boolean) {
  if (offline)
    return {
      head: ["Wires", "down."],
      deck: "The engine isn't answering. The Gazette prints nothing rather than yesterday's numbers.",
    };
  if (!status || !status.tokenAddress)
    return {
      head: ["Robin cases", "the vault."],
      deck: "Robin robs every trade and pays the top 10 bags in ETH. Sell once, you're a snitch.",
    };
  const rounds = status.rounds;
  const fed = parseFloat(status.totals.fedETH);
  if (rounds === 0)
    return {
      head: ["The vault", "is open."],
      deck: "Every trade drops loot. The first heist runs when the escrow fills. Hold big, never snitch.",
    };
  return {
    head: ["Robin hits", "the vault again."],
    deck: `Robin has paid the crew ${eth(fed.toString())} so far. ${status.counts.hopped} snitches got nothing.`,
  };
}

export function FrontPage({ status, offline }: { status: Status | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const now = useNow(30000);
  const narrow = useMedia("(max-width: 760px)");
  const { head, deck } = story(status, offline);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const target = parseFloat(next.thresholdETH);
  const edition = (status?.rounds ?? 0) + 1;
  const live = !!status?.tokenAddress;
  const headRef = useRef<HTMLHeadingElement>(null);
  const fitRef = useRef<HTMLSpanElement>(null);

  // Banner headlines are cut to the full measure: on a desktop sheet the line is sized to fill it.
  useLayoutEffect(() => {
    const h = headRef.current;
    const line = fitRef.current;
    if (!h || !line) return;
    const fit = () => {
      if (window.innerWidth <= 1080) {
        h.style.fontSize = "";
        return;
      }
      h.style.fontSize = "100px";
      // Cut to the measure, but never taller than the screen can spare above the fold.
      const size = Math.min(230, window.innerHeight * 0.14, (100 * h.clientWidth) / line.offsetWidth);
      h.style.fontSize = `${Math.floor(size * 0.995)}px`;
      ScrollTrigger.refresh();
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(h);
    return () => ro.disconnect();
  }, [head[0], head[1]]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The press run: banner drops, the headline slams onto the page, the lede sets.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".front__extra", { yPercent: -110, duration: 0.7 })
        .from(".front__line", { scale: 1.18, filter: "blur(8px)", opacity: 0, transformOrigin: "0% 60%", duration: 0.9, stagger: 0.12 }, "-=0.35")
        .from(".front__lede, .front__deal", { clipPath: "inset(0 0 100% 0)", duration: 0.9, stagger: 0.08 }, "-=0.6")
        .from(".rail", { clipPath: "inset(0 0 100% 0)", duration: 1 }, "<");

      // The page turn: once the whole front has been read, it holds and the next pages slide over it.
      // Desktop only: on phones the address bar resizes the screen, the pin starts early and the
      // front loads already dimmed, so a phone simply scrolls the paper.
      gsap.matchMedia().add("(min-width: 761px) and (hover: hover)", () => {
        ScrollTrigger.create({ trigger: root.current, start: "bottom bottom", end: "+=100%", pin: true, pinSpacing: false });
        gsap.to(".front__sheet", {
          scale: 0.94,
          filter: "brightness(0.82)",
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "bottom bottom", end: "+=100%", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="front" id="top" ref={root} aria-label="Front page">
      <div className="front__sheet">
        <div className="wrap">
          <div className="dateline">
            <span className="tabular">Vol. I, No. {edition}</span>
            <span>{dateline(now)}</span>
            <span className="dateline__end">
              <span className="dateline__price">Price: 0.01 ETH</span>
              <ConnectButton className="is-dateline" />
            </span>
          </div>
          <p className="masthead">
            The Robin Heist Gazette
          </p>
          <div className="submast">
            <span>Robbing the paper hands since block one</span>
            <span>Robinhood Chain edition</span>
          </div>

          <p className="front__extra">
            <span>Extra</span>
            <span>{offline ? "No signal" : live ? STEP[next.kind].name : "Before the job"}</span>
            <span>Extra</span>
          </p>

          <h1 className="front__head" ref={headRef}>
            <span className="front__fit" ref={fitRef}>
              <span className="front__line">{head[0]}</span>{" "}
              <span className="front__line">{head[1]}</span>
            </span>
          </h1>

          <div className="front__grid">
            <figure className="front__photo">
              <Halftone develop="load" label="Robin, a raccoon in a bowler hat and monocle, sitting on a pile of gold coins next to a money sack." />
              <figcaption>Robin, &ldquo;businessman&rdquo;, outside the vault. The mask is his own fur. Photo: Gazette staff.</figcaption>
            </figure>

            <div className="front__story">
              <p className="front__lede">{deck}</p>
              <div className="front__deal">
                <BuyButton status={status} />
                <CaCoupon status={status} compact={narrow} />
              </div>
            </div>

            <aside className="rail" aria-label="Latest heist">
              <h2 className="rail__head">Latest heist</h2>
              {offline ? (
                <p className="rail__note">No signal from the engine. Nothing printed until it answers.</p>
              ) : (
                <>
                  <p className="rail__step">
                    Next up: <strong>{STEP[next.kind].name}</strong>, {STEP[next.kind].does}.
                  </p>
                  <Fuse value={escrow} target={target} label={`Escrow ${escrow} of ${target} ETH toward ${STEP[next.kind].name}`} />
                  <p className="rail__fuse tabular">
                    {live ? `Loot: ${escrow.toFixed(4)} / ${next.thresholdETH} ETH` : `Fires at ${next.thresholdETH} ETH`}
                  </p>
                  <dl className="rail__facts">
                    <div>
                      <dt>Crew</dt>
                      <dd className="tabular">{live ? amount(status!.counts.sitters) : "none yet"}</dd>
                    </div>
                    <div>
                      <dt>Heists run</dt>
                      <dd className="tabular">{live ? status!.rounds : 0}</dd>
                    </div>
                    <div className="is-red">
                      <dt>Snitches</dt>
                      <dd className="tabular">{live ? status!.counts.hopped : 0}</dd>
                    </div>
                  </dl>
                  <p className="rail__source tabular">
                    {live ? `Wire: block ${status!.lastIndexedBlock.toLocaleString("en-US")}` : "Goes live when the vault opens."}
                  </p>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

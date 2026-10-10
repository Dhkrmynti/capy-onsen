import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { demoPond, demoStatus, usePoll, type Pond, type Status } from "./lib/api";
import { prefersReducedMotion } from "./lib/motion";
import { CrewCard } from "./components/CrewCard";
import { restoreWallet } from "./lib/wallet";
import { Header } from "./kp/Header";
import { Hero } from "./kp/Hero";
import { Ladder } from "./kp/Ladder";
import { Round } from "./kp/Round";
import { Rules } from "./kp/Rules";
import { Record } from "./kp/Record";
import { Close } from "./kp/Close";
import { nameFor } from "./lib/alias";
import { Band } from "./kp/Band";
import { Well } from "./kp/Well";

// The black hole loads after the page, so the first paint never waits for it.
const VoidWalk = lazy(() => import("./kp/VoidWalk"));

function useWalk() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch {
      return;
    }
    const w = window as unknown as { requestIdleCallback?: (f: () => void) => number };
    const go = () => setShow(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go);
    else setTimeout(go, 300);
  }, []);
  return show;
}

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const { data: status, error } = usePoll<Status>("/api/status", 4000, demoStatus);
  const live = !!status?.tokenAddress;
  // the Ladder is live: a new buyer is on the board within a few seconds
  const { data: pond } = usePoll<Pond>(live ? "/api/pond?limit=50" : null, 3000, demoPond);

  const walk = useWalk();
  const names = useMemo(() => (pond?.rows ?? []).slice(0, 10).map((r) => nameFor(r.addr, r.nickname, r.x).name), [pond]);

  // A wallet that already trusts this site shows as connected without a popup.
  useEffect(restoreWallet, []);

  // The pinned scenes (hero, Round) measure where they start once; when fonts, X pictures or
  // the live Ladder change the height above them, measure again so a pin never jumps or vanishes.
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    let t = 0;
    const again = () => {
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    document.fonts?.ready.then(again);
    window.addEventListener("load", again);
    const watched = ["ladder", "round", "rules", "card", "record"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const heights = new Map<Element, number>();
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const h = Math.round(e.contentRect.height);
        if (heights.get(e.target) !== h) {
          heights.set(e.target, h);
          again();
        }
      }
    });
    watched.forEach((el) => ro.observe(el));
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", again);
      ro.disconnect();
    };
  }, []);

  // Smooth scroll that ScrollTrigger reads from; off for reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const anchors = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || a.getAttribute("href") === "#") return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -64 });
    };
    document.addEventListener("click", anchors);
    return () => {
      document.removeEventListener("click", anchors);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="kp vd">
      {/* the black hole, fixed behind every section; the page scrolls through it */}
      <div className="walk" aria-hidden="true">
        {walk ? (
          <Suspense fallback={null}>
            <VoidWalk names={names} still={prefersReducedMotion()} />
          </Suspense>
        ) : null}
      </div>
      <Well />
      <Header status={status} />
      <main>
        <Hero status={status} pond={pond} offline={!!error && !status} />
        <Band fig={2} label="The orbit" />
        <Ladder status={status} pond={pond} />
        <Band fig={3} label="The cycle" />
        <Round status={status} />
        <Band fig={4} label="The laws" />
        <Rules status={status} />
        <Band fig={5} label="Your orbit" />
        <CrewCard live={live} />
        <Band fig={6} label="Observations" />
        <Record status={status} />
      </main>
      <Close status={status} />
    </div>
  );
}

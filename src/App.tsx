import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { demoPond, demoStatus, usePoll, type PondRow, type Status } from "./lib/api";
import { prefersReducedMotion } from "./lib/motion";
import { nameFor } from "./lib/alias";
import { Masthead } from "./components/Masthead";
import { FrontPage } from "./components/FrontPage";
import { TheTake } from "./components/TheTake";
import { Notice } from "./components/Notice";
import { CrewCard } from "./components/CrewCard";
import { TheVault } from "./components/TheVault";
import { Blotter } from "./components/Blotter";
import { BackPage } from "./components/BackPage";
import { restoreWallet } from "./lib/wallet";

gsap.registerPlugin(ScrollTrigger);

// The vault walk (three.js) loads after the page, so the first paint never waits for it.
const VaultWalk = lazy(() => import("./components/VaultWalk"));

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Mounts the 3D walk once the browser is idle, and only where WebGL works. */
function useWalk() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!canWebGL()) return;
    const w = window as unknown as { requestIdleCallback?: (f: () => void) => number };
    const go = () => setShow(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go);
    else setTimeout(go, 300);
  }, []);
  return show;
}

export function App() {
  const { data: status, error } = usePoll<Status>("/api/status", 12000, demoStatus);
  const live = !!status?.tokenAddress;
  const { data: pond } = usePoll<{ total: number; topN: number; rows: PondRow[] }>(live ? "/api/pond?limit=50" : null, 30000, demoPond);
  const walk = useWalk();
  const step = status ? status.cycle.steps[status.cycle.index] : null;
  const pct = live && step ? Math.min(1, parseFloat(status!.escrowETH) / Math.max(1e-9, parseFloat(step.thresholdETH))) : 0;
  // The Ten's names are engraved on their deposit boxes in the scene.
  const names = useMemo(() => (pond?.rows ?? []).slice(0, 10).map((r) => nameFor(r.addr, r.nickname, r.x).name), [pond]);

  // A wallet that already trusts this site shows as connected without a popup.
  useEffect(restoreWallet, []);

  // Each stop's panel fits one screen: on a short screen it is shrunk a touch rather than cut off.
  useEffect(() => {
    let raf = 0;
    const fit = () => {
      const nav = document.querySelector("header")?.offsetHeight ?? 0;
      const avail = window.innerHeight - nav - (window.innerWidth <= 760 ? 18 : 40);
      document.querySelectorAll<HTMLElement>(".stop__inner > .plaque, .stop__inner > .deed, .stop__inner > .cardpage__grid").forEach((el) => {
        el.style.zoom = "";
        const h = el.offsetHeight;
        if (h > avail) el.style.zoom = String(Math.max(0.72, avail / h));
      });
    };
    const soon = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    soon();
    document.fonts?.ready.then(soon);
    window.addEventListener("resize", soon);
    const mo = new MutationObserver(soon);
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", soon);
      mo.disconnect();
    };
  }, []);

  // Smooth scroll that ScrollTrigger reads from; off for reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
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
      lenis.scrollTo(el as HTMLElement, { offset: 0 });
    };
    document.addEventListener("click", anchors);
    return () => {
      document.removeEventListener("click", anchors);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className={`house ${walk ? "has-walk" : ""}`}>
      {/* the vault itself, fixed behind every page; the page scrolls through it */}
      <div className="walk" aria-hidden="true">
        {walk ? (
          <Suspense fallback={null}>
            <VaultWalk names={names} closed={live ? status!.counts.hopped : 0} pct={pct} still={prefersReducedMotion()} />
          </Suspense>
        ) : null}
      </div>
      <Masthead status={status} />
      <main>
        <FrontPage status={status} offline={!!error && !status} />
        <TheTake status={status} />
        <Notice status={status} />
        <TheVault status={status} />
        <CrewCard live={live} />
        <Blotter status={status} />
        <BackPage status={status} />
      </main>
    </div>
  );
}

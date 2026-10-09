import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DEMO, demoStatus, usePoll, type Status } from "./lib/api";
import { prefersReducedMotion } from "./lib/motion";
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

export function App() {
  const { data: status, error } = usePoll<Status>("/api/status", 12000, demoStatus);

  // A wallet that already trusts this site shows as connected without a popup.
  useEffect(restoreWallet, []);

  // Smooth scroll that ScrollTrigger reads from; off for reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
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

  const live = !!status?.tokenAddress;

  return (
    <>
      {DEMO ? (
        <div className="demo-strip" role="note">
          Illustration edition: every number on this page is made up to preview the paper. Try the citizen card and the portrait booth; nothing you set is saved.
        </div>
      ) : null}
      <Masthead status={status} />
      <main>
        <FrontPage status={status} offline={!!error && !status} />
        <div className="pages">
          <TheTake status={status} />
          <Notice status={status} />
          <CrewCard live={live} />
          <TheVault status={status} />
          <Blotter status={status} />
          <BackPage status={status} />
        </div>
      </main>
    </>
  );
}

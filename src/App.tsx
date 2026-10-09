import { useEffect } from "react";
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

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const { data: status, error } = usePoll<Status>("/api/status", 4000, demoStatus);
  const live = !!status?.tokenAddress;
  // the Ladder is live: a new buyer is on the board within a few seconds
  const { data: pond } = usePoll<Pond>(live ? "/api/pond?limit=50" : null, 3000, demoPond);

  // A wallet that already trusts this site shows as connected without a popup.
  useEffect(restoreWallet, []);

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
    <div className="kp">
      <Header status={status} />
      <main>
        <Hero status={status} pond={pond} offline={!!error && !status} />
        <Ladder status={status} pond={pond} />
        <Round status={status} />
        <Rules status={status} />
        <CrewCard live={live} />
        <Record status={status} />
      </main>
      <Close status={status} />
    </div>
  );
}

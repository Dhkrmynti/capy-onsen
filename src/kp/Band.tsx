/**
 * Between areas, two strips of caution tape are pulled taut across the screen on crossing
 * diagonals, each printed with the next area's name, while the 3D camera moves behind them.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Band({ label, tone = "yellow" }: { label: string; tone?: "yellow" | "red" }) {
  const root = useRef<HTMLDivElement>(null);
  const text = Array.from({ length: 8 }, () => label).join(" ✕ ");
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5 } })
        .fromTo(".tape.is-a", { xPercent: -30, rotate: -9 }, { xPercent: 10, rotate: -5, ease: "none" }, 0)
        .fromTo(".tape.is-b", { xPercent: 20, rotate: 7 }, { xPercent: -15, rotate: 4, ease: "none" }, 0);
    },
    { scope: root },
  );
  return (
    <div className={`band is-${tone}`} ref={root} aria-hidden="true">
      <p className="tape is-a">{text}</p>
      <p className="tape is-b">Do not sell ✕ {text}</p>
    </div>
  );
}

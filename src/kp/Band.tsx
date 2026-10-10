/**
 * Between figures, the next section's name is pulled in: it starts spread wide and small at the
 * edge of the frame and is drawn tight toward the centre as you scroll, under its figure number.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Band({ fig, label }: { fig: number; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } })
        .fromTo(".band__word", { scale: 0.45, letterSpacing: "0.6em", opacity: 0.2 }, { scale: 1, letterSpacing: "-0.04em", opacity: 1, ease: "power2.in", duration: 0.55 }, 0)
        .to(".band__word", { scale: 0.2, opacity: 0, filter: "blur(6px)", ease: "power3.in", duration: 0.45 }, 0.55)
        .fromTo(".band__rule", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 0.5 }, 0);
    },
    { scope: root },
  );
  return (
    <div className="band" ref={root} aria-hidden="true">
      <span className="band__rule" />
      <p className="band__fig">Fig. {fig}</p>
      <p className="band__word">{label}</p>
    </div>
  );
}

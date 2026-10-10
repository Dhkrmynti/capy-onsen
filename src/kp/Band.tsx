/**
 * Between sections, a poster band cuts across the screen on the diagonal: its field slides in with
 * the scroll, the next section's name runs along it, and the 3D camera travels behind.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Band({ tone, label }: { tone: "red" | "cream" | "blue"; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } })
        .fromTo(".band__field", { xPercent: 60, rotate: -14 }, { xPercent: -60, rotate: -6, ease: "none" }, 0)
        .fromTo(".band__word", { xPercent: 40 }, { xPercent: -40, ease: "none" }, 0)
        .fromTo(".band__stripe", { xPercent: -80 }, { xPercent: 80, ease: "none" }, 0);
    },
    { scope: root },
  );
  return (
    <div className={`band is-${tone}`} ref={root} aria-hidden="true">
      <div className="band__stripe" />
      <div className="band__field">
        <p className="band__word">
          {label} <span>·</span> {label} <span>·</span> {label}
        </p>
      </div>
    </div>
  );
}

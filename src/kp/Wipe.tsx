/**
 * Between sections, the next section's signal flag is hauled across the screen: the field slides
 * in with the scroll, its name runs the other way, and the 3D camera travels behind it.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { FlagCode } from "../lib/flags";
import { prefersReducedMotion } from "../lib/motion";
import { Flag } from "../components/Flag";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Wipe({ code, label }: { code: FlagCode; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      tl.fromTo(".wipe__field", { xPercent: 70, skewY: 4 }, { xPercent: -70, skewY: -4, ease: "none" }, 0)
        .fromTo(".wipe__word", { xPercent: -30 }, { xPercent: 25, ease: "none" }, 0)
        .fromTo(".wipe__field", { clipPath: "inset(18% 0% 18% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out", duration: 0.5 }, 0)
        .to(".wipe__field", { clipPath: "inset(18% 0% 18% 0%)", ease: "power2.in", duration: 0.5 }, 0.5);
    },
    { scope: root },
  );
  return (
    <div className="wipe" ref={root} aria-hidden="true">
      <div className="wipe__field">
        <Flag code={code} size={1600} className="wipe__flag" stretch />
      </div>
      <p className="wipe__word">{label}</p>
    </div>
  );
}

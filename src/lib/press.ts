import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The press run for a page's head: the rule is drawn across, the headline slams onto
 * the sheet out of a blur, and the deck is printed top to bottom by the roller.
 * Call inside useGSAP so the trigger is reverted with the component.
 */
export function slamHead(section: HTMLElement) {
  if (prefersReducedMotion()) return;
  const head = section.querySelector(".page__head");
  const deck = section.querySelector(".page__deck");
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 78%" }, defaults: { ease: "expo.out" } });
  tl.from(section, { "--rule-draw": 0, duration: 0.9 } as gsap.TweenVars);
  if (head) tl.from(head, { scale: 1.16, filter: "blur(7px)", opacity: 0, transformOrigin: "0% 70%", duration: 0.85 }, "-=0.65");
  if (deck) tl.from(deck, { clipPath: "inset(0 0 100% 0)", duration: 0.8 }, "-=0.55");
  return tl;
}

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Monogram } from "./Engrave";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Station three: the conditions, engraved on one plate. A few words each. */
export function Notice({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = status?.rules.minBalance ?? "100000";
  const hold = status?.rules.minHoldHours ?? 1;
  const top = status?.rules.topN ?? 10;
  const closed = status?.tokenAddress ? status.counts.hopped : 0;

  const clauses = [
    [`${amount(min)} $OLDM`, "opens an account"],
    [`Top ${top}`, "share every dividend, by balance"],
    ...(hold > 0 ? [[hold === 1 ? "1 hour" : `${hold} hours`, "a holding must age before it is paid"]] : []),
    ["One sale", "closes the account, for good"],
    ["Your own wallets", "transfers between them are not sales"],
    ["The house", "never takes a dividend"],
  ];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".deed__line", { opacity: 0, y: 10, duration: 0.6, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".deed", start: "top 80%" } });
      gsap.from(".seal-count", { scale: 1.6, opacity: 0, rotate: -12, duration: 0.5, ease: "power4.in", scrollTrigger: { trigger: ".seal-count", start: "top 88%" } });
    },
    { scope: root },
  );

  return (
    <section className="stop stop--tall" id="rules" ref={root} aria-labelledby="deed-head">
      <div className="h-wrap stop__inner">
        <article className="deed">
          <header className="deed__head">
            <Monogram size={44} className="deed__mono" />
            <h2 className="deed__title" id="deed-head">
              Conditions of account
            </h2>
          </header>
          <dl className="deed__lines">
            {clauses.map(([k, v]) => (
              <div className="deed__line" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="deed__foot">
            <span className="seal-count" aria-label={`${closed} accounts closed for selling`}>
              <b className="tabular">{closed}</b>
              <small>closed</small>
            </span>
            <p>Closed accounts are sealed in wax. Their boxes stay in the wall, empty.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

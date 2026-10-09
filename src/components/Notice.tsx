import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { Monogram, Rosette } from "./Engrave";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Notice({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = status?.rules.minBalance ?? "100000";
  const hold = status?.rules.minHoldHours ?? 1;
  const top = status?.rules.topN ?? 10;
  const closed = status?.tokenAddress ? status.counts.hopped : 0;
  const holdText = hold === 1 ? "one hour" : `${hold} hours`;

  const clauses = [
    { t: "Minimum balance", d: `An account holds at least ${amount(min)} $OLDM. Smaller balances are kept as savings and take no part in the dividend.` },
    { t: "The Preferred Ten", d: `Each dividend is paid to the ${top} largest balances, in ETH, in proportion to each holding. Hold more and rise in the ledger.` },
    ...(hold > 0 ? [{ t: "Seasoning", d: `A holding must be at least ${holdText} old when the dividend is paid. Buying in the moment before a payment earns nothing.` }] : []),
    { t: "Closure on sale", d: "Selling on the Pons curve, or sending $OLDM into a DEX or any other contract, closes the account. Closure is permanent." },
    { t: "Transfers", d: "Moving $OLDM to another wallet of your own is not a sale. The receiving wallet opens its own account from day one." },
    { t: "The house abstains", d: "The curve, the engine, the reserve and the dead address never take part in a dividend." },
  ];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The document slides out of its folder; the plaque is fixed to the wall a beat later.
      gsap.from(".deed", { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".deed", start: "top 82%" } });
      gsap.from(".deed__clause", { opacity: 0, y: 12, duration: 0.6, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".deed__clauses", start: "top 82%" } });
      gsap.from(".plaque", { opacity: 0, scale: 0.92, duration: 1, ease: "back.out(1.4)", scrollTrigger: { trigger: ".plaque", start: "top 85%" } });
    },
    { scope: root },
  );

  return (
    <section className="h-sec conditions" id="rules" ref={root} aria-labelledby="deed-head">
      <div className="h-wrap conditions__grid">
        <article className="deed">
          <header className="deed__head">
            <Monogram size={46} className="deed__mono" />
            <div>
              <p className="h-eyebrow is-ink">§ II · Conditions of account</p>
              <h2 className="deed__title" id="deed-head">
                No small print.
              </h2>
              <p className="deed__sub">Enforced by code, checked on chain, the same for every holder.</p>
            </div>
          </header>
          <ol className="deed__clauses">
            {clauses.map((c, i) => (
              <li className="deed__clause" key={c.t}>
                <span className="deed__no">§{i + 1}</span>
                <div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="deed__sig">
            <span>For the house</span>
            <i>The Partners</i>
          </p>
        </article>

        <aside className="plaque" aria-label={`${closed} accounts closed`}>
          <Rosette className="plaque__rosette" size={260} petals={18} />
          <p className="plaque__k">Accounts closed</p>
          <p className="plaque__n tabular">{closed}</p>
          <p className="plaque__d">for selling $OLDM on the curve or a DEX.</p>
          <p className="plaque__rule">No dividend. Ever.</p>
        </aside>
      </div>
    </section>
  );
}

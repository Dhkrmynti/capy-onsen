import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Coins, Clock, Prohibit, ArrowsLeftRight, Ranking, Eye } from "@phosphor-icons/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { slamHead } from "../lib/press";
import { Folio } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Notice({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = status?.rules.minBalance ?? "100000";
  const hold = status?.rules.minHoldHours ?? 1;
  const top = status?.rules.topN ?? 10;
  const snitches = status?.tokenAddress ? status.counts.hopped : 0;
  const holdText = hold === 1 ? "an hour" : `${hold} hours`;

  const rules = [
    { icon: Coins, title: `Hold ${amount(min)}+ $OLDM`, text: "Under that it's a savings jar, not an account. It keeps dust wallets out of the dividend." },
    { icon: Ranking, title: `Top ${top} get the dividend`, text: `Each dividend goes to the ${top} biggest balances, the Preferred Ten, in ETH, split by size. Hold more, climb the register.` },
    ...(hold > 0 ? [{ icon: Clock, title: `Hold ${holdText} first`, text: `Your first $OLDM must be ${holdText} old when the dividend is paid. No buying in the second before it.` }] : []),
    { icon: Prohibit, title: "Never sell", text: "Selling on the Pons curve, or sending $OLDM into a DEX or any other contract, closes your account. For good." },
    { icon: ArrowsLeftRight, title: "Wallet to wallet is fine", text: "Moving $OLDM to your own other wallet is not a sell. The receiving wallet opens its account from day zero." },
    { icon: Eye, title: "The house gets none", text: "The curve, the engine, the reserve and the dead address are left out of every dividend." },
  ];

  useGSAP(
    () => {
      slamHead(root.current!);
      if (prefersReducedMotion()) return;
      // The terms are typed line by line; the closed-accounts notice is pinned up and settles crooked.
      gsap.from(".notice__rule", { clipPath: "inset(0 100% 0 0)", duration: 0.8, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: ".notice__list", start: "top 80%" } });
      gsap.from(".wanted", { y: -60, rotate: -9, scale: 1.08, opacity: 0, duration: 1.1, ease: "back.out(1.6)", scrollTrigger: { trigger: ".wanted", start: "top 82%" } });
    },
    { scope: root },
  );

  return (
    <section className="page notice" id="rules" ref={root} aria-labelledby="notice-head">
      <div className="wrap notice__grid">
        <Folio page={3} label="Notices" />
        <div className="notice__sheet">
          <h2 className="page__head" id="notice-head">
            Terms of the account
          </h2>
          <p className="page__deck">No small print. Enforced by code, checked on chain.</p>
          <ol className="notice__list">
            {rules.map(({ icon: Icon, title, text }) => (
              <li className="notice__rule" key={title} title={text}>
                <Icon className="notice__icon" weight="duotone" aria-hidden="true" />
                <h3>{title}</h3>
                <p className="sr-only">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="wanted" aria-label={`Accounts closed: ${snitches}`}>
          <p className="wanted__word">Closed</p>
          <p className="wanted__n tabular">{snitches}</p>
          <p className="wanted__what">{snitches === 1 ? "account" : "accounts"}</p>
          <p className="wanted__crime">For selling $OLDM on the curve or a DEX.</p>
          <p className="wanted__reward">No dividend. Ever.</p>
        </aside>
      </div>
    </section>
  );
}

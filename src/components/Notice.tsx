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
    { icon: Coins, title: `Hold ${amount(min)}+ $TRPZ`, text: "Under that you're a visitor, not a citizen. It keeps dust wallets out of the Share." },
    { icon: Ranking, title: `Top ${top} holders get the Share`, text: `Each Share goes to the ${top} biggest balances among the citizens, in ETH, split by size. Hold more, climb the agora.` },
    ...(hold > 0 ? [{ icon: Clock, title: `Hold ${holdText} first`, text: `Your first $TRPZ must be ${holdText} old when the Share is paid. No buying in the second before it.` }] : []),
    { icon: Prohibit, title: "Never sell", text: "Selling on the Pons curve, or sending $TRPZ into a DEX or any other contract, gets your wallet ostracized. Out of the city for good." },
    { icon: ArrowsLeftRight, title: "Wallet to wallet is fine", text: "Moving $TRPZ to your own other wallet is not a sell. The receiving wallet starts its days as a citizen from zero." },
    { icon: Eye, title: "Officials get no share", text: "The curve, the engine, the treasury and the dead address are left out of every Share." },
  ];

  useGSAP(
    () => {
      slamHead(root.current!);
      if (prefersReducedMotion()) return;
      // The decree is carved line by line; the ostracon is tossed onto the pile and settles crooked.
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
            Decree of the assembly
          </h2>
          <p className="page__deck">Voted by the citizens. Enforced by code, checked on chain.</p>
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

        <aside className="wanted" aria-label={`Ostracized: ${snitches} wallets`}>
          <p className="wanted__word">Ostracized</p>
          <p className="wanted__n tabular">{snitches}</p>
          <p className="wanted__what">{snitches === 1 ? "wallet" : "wallets"}</p>
          <p className="wanted__crime">Named on a shard for selling $TRPZ on the curve or a DEX.</p>
          <p className="wanted__reward">Exiled. No share, ever.</p>
        </aside>
      </div>
    </section>
  );
}

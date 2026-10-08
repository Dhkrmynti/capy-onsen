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
    { icon: Coins, title: `Hold ${amount(min)}+ $RBANK`, text: "Under that you're a lookout, not crew. It keeps dust wallets out of the split." },
    { icon: Ranking, title: `Top ${top} bags get the split`, text: `Each split goes to the ${top} biggest balances in the crew, in ETH, shared by bag size. Hold more, climb the vault.` },
    ...(hold > 0 ? [{ icon: Clock, title: `Hold ${holdText} first`, text: `Your first $RBANK must be ${holdText} old when the heist runs. No buying in the second before the split.` }] : []),
    { icon: Prohibit, title: "Never snitch", text: "Selling on the Pons curve, or sending $RBANK into a DEX or any other contract, makes your wallet a snitch. Out of the crew for good." },
    { icon: ArrowsLeftRight, title: "Wallet to wallet is fine", text: "Moving $RBANK to your own other wallet is not a sell. The receiving wallet starts its days in the crew from zero." },
    { icon: Eye, title: "Staff get no cut", text: "The curve, the engine, the treasury and the dead address are left out of every split." },
  ];

  useGSAP(
    () => {
      slamHead(root.current!);
      if (prefersReducedMotion()) return;
      // The notice is pasted up line by line; the wanted poster is slapped on the wall and settles crooked.
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
            Notice to the crew
          </h2>
          <p className="page__deck">By order of Robin. Enforced by code, checked on chain.</p>
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

        <aside className="wanted" aria-label={`Wanted: ${snitches} snitches`}>
          <p className="wanted__word">Wanted</p>
          <p className="wanted__n tabular">{snitches}</p>
          <p className="wanted__what">{snitches === 1 ? "snitch" : "snitches"}</p>
          <p className="wanted__crime">For selling $RBANK on the curve or a DEX.</p>
          <p className="wanted__reward">Reward: nothing. Ever.</p>
        </aside>
      </div>
    </section>
  );
}

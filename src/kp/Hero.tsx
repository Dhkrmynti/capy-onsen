/**
 * The opening: the black hole behind, and in front the figure that matters: who sits closest to
 * the singularity right now, and the escrow falling down a 1/r curve toward the next Pull.
 */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, STEP, compact, usd, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { BuyButton } from "../components/Bits";
import { CrewFace } from "../components/Face";

gsap.registerPlugin(useGSAP);

const PW = 360;
const PH = 170;
const X0 = 34;
const Y0 = 150;
/** The well's profile: steep near the horizon (left), flat far away (right). */
const curveY = (r: number) => Y0 - Math.min(132, 9 / (r + 0.06));
const pt = (r: number) => [X0 + r * (PW - X0 - 10), curveY(r)] as const;

/** The escrow as a body falling in: the closer to the next step, the closer to the horizon. */
function Fall({ value, target, label }: { value: number; target: number; label: string }) {
  const root = useRef<SVGSVGElement>(null);
  const pct = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
  const d = Array.from({ length: 80 }, (_, i) => {
    const r = 0.02 + (i / 79) * 0.98;
    const [x, y] = pt(r);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("");
  useGSAP(
    () => {
      const dot = root.current?.querySelector<SVGGElement>(".fall__body");
      if (!dot) return;
      const st = { r: 1 };
      const place = () => {
        const [x, y] = pt(st.r);
        dot.setAttribute("transform", `translate(${x} ${y})`);
      };
      const to = 1 - pct * 0.94;
      if (prefersReducedMotion()) {
        st.r = to;
        return place();
      }
      gsap.to(st, { r: to, duration: 2.2, ease: "back.out(1.6)", delay: 0.6, onUpdate: place });
      place();
    },
    { scope: root, dependencies: [pct] },
  );
  return (
    <svg className="fall" ref={root} viewBox={`0 0 ${PW} ${PH + 26}`} role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={value} aria-label={label}>
      <line className="fall__axis" x1={X0} y1={Y0} x2={PW - 6} y2={Y0} />
      <line className="fall__axis" x1={X0} y1={Y0} x2={X0} y2={10} />
      <line className="fall__horizon" x1={X0 + 6} y1={Y0} x2={X0 + 6} y2={14} />
      <path className="fall__curve" d={d} />
      <text className="fall__t" x={X0 + 10} y={22}>
        r = rₛ
      </text>
      <text className="fall__t" x={PW - 8} y={Y0 + 20} textAnchor="end">
        distance to The Pull
      </text>
      <g className="fall__body">
        <circle r="9" className="fall__halo" />
        <circle r="4.5" className="fall__dot" />
      </g>
    </svg>
  );
}

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? status.cycle.steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = live ? parseFloat(status?.escrowETH ?? "0") : 0;
  const target = parseFloat(next.thresholdETH);
  const top = live ? pond?.rows[0] : undefined;
  const who = top ? nameFor(top.addr, top.nickname, top.x) : null;
  const px = status?.price?.tokenUSD ?? 0;
  const stepName = STEP[next.kind].name;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero__h .ln", { yPercent: 105, duration: 1.3, stagger: 0.1, delay: 0.25 })
        .from(".sing", { opacity: 0, y: 16, duration: 0.9 }, "-=0.8")
        .from(".fall__curve", { strokeDasharray: 900, strokeDashoffset: 900, duration: 1.6, ease: "power3.out" }, "-=0.7")
        .from(".hero__fig, .hero__acts", { opacity: 0, y: 14, duration: 0.8, stagger: 0.08 }, "-=1.2");
    },
    { scope: root },
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Horizon">
      <div className="hero__copy">
        <h1 className="hero__h">
          <span className="mask">
            <span className="ln">Fall</span>
          </span>
          <span className="mask">
            <span className="ln">closer.</span>
          </span>
        </h1>
        <div className="sing" role="status">
          {offline ? (
            <p className="sing__line">The observatory is quiet for a moment. Back shortly.</p>
          ) : top && who ? (
            <p className="sing__line">
              <span className="sing__k">The Singularity</span>
              <span className="sing__who">
                <CrewFace addr={top.addr} pp={top.pp} x={top.x} size={30} className="sing__face" />
                <b>{who.name}</b>
              </span>
              <span className="sing__bal tabular">
                m = {compact(top.balance)} $VOID{px > 0 ? ` · ${usd(parseFloat(top.balance) * px)}` : ""}
              </span>
            </p>
          ) : (
            <p className="sing__line">
              <span className="sing__k">The Singularity</span>
              <span className="sing__who">
                <b>Nobody yet.</b>
              </span>
              <span className="sing__bal">The biggest holder orbits closest. The ten closest are paid in ETH.</span>
            </p>
          )}
        </div>
        <figure className="hero__plot">
          <Fall value={escrow} target={target} label={`Escrow toward ${stepName}`} />
          <figcaption className="hero__fig">
            <i>Fig. 1.</i> Escrow at <b className="tabular">{escrow.toFixed(4)}</b> of {next.thresholdETH} ETH, falling toward {stepName}.
          </figcaption>
        </figure>
        <div className="hero__acts">
          <BuyButton status={status} />
          <a className="vd-btn" href="#ladder">
            See the orbit
          </a>
        </div>
      </div>
      <a className="hero__cue" href="#ladder">
        Fall in <ArrowDown weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}

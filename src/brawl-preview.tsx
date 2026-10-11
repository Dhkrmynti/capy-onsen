/**
 * Prototype page for the rabbit queue (open /brawl.html). Demo holders only: the buttons change
 * balances the way buys would, and the 3D queue reacts exactly as it will to the live board.
 */
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/800";
import "@fontsource/barlow-condensed/900";
import "@fontsource/jetbrains-mono/700";
import "./styles/brawl.css";
import BunnyBrawl, { type BrawlRow } from "./kp/BunnyBrawl";

const NAMES = ["carrotking", "0x1a2b…3c4d", "@thumper", "hopium", "0x5e6f…7a8b", "bigears", "0x9c0d…1e2f", "@lettuce", "burrow", "0x3a4b…5c6d", "newbun", "0x7e8f…9a0b", "@clover"];
const start = (): BrawlRow[] => NAMES.map((name, i) => ({ id: `h${i}`, name, balance: Math.round(9_400_000 * Math.pow(0.8, i)) }));
const sorted = (r: BrawlRow[]) => [...r].sort((a, b) => b.balance - a.balance);

function Preview() {
  const [all, setAll] = useState(start);
  const [auto, setAuto] = useState(true);
  const rows = sorted(all);
  // rank k (0-based) buys enough to pass rank `over`
  const pass = (k: number, over: number) =>
    setAll((cur) => {
      const s = sorted(cur);
      if (!s[k] || !s[over]) return cur;
      const to = Math.round(s[over].balance * 1.06);
      return cur.map((r) => (r.id === s[k].id ? { ...r, balance: to } : r));
    });
  // ?kick=1500 makes #2 take #1 after that many ms (for screenshots); it also turns auto off
  useEffect(() => {
    const k = Number(new URLSearchParams(location.search).get("kick"));
    if (!k) return;
    setAuto(false);
    const id = setTimeout(() => pass(1, 0), k);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      const k = 1 + Math.floor(Math.random() * 11);
      pass(k, Math.max(0, k - 1 - Math.floor(Math.random() * 2)));
    }, 4200);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div className="brawl">
      <BunnyBrawl rows={rows.slice(0, 10)} />
      <div className="brawl__title">
        Fight for No. 1<small>3D PROTOTYPE · DEMO HOLDERS · MOVES WITH THE TOP 10</small>
      </div>
      <div className="brawl__ctl">
        <button onClick={() => pass(1, 0)}>#2 takes #1</button>
        <button onClick={() => pass(4, 3)}>#5 passes #4</button>
        <button onClick={() => pass(7, 2)}>#8 jumps to #3</button>
        <button onClick={() => pass(10, 5)}>New challenger</button>
        <button className={auto ? "is-on" : ""} onClick={() => setAuto((a) => !a)}>Auto: {auto ? "on" : "off"}</button>
        <button onClick={() => setAll(start())}>Reset</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);

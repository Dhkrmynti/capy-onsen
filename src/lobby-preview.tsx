/**
 * Prototype page for the waiting room (open /lobby.html). Demo holders only: the buttons change
 * balances the way buys would, or mark a holder as sold, and the room reacts exactly as it will
 * to the live board.
 */
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/800";
import "@fontsource/barlow-condensed/900";
import "@fontsource/jetbrains-mono/700";
import "./styles/brawl.css";
import WaitingRoom from "./kp/WaitingRoom";

type Holder = { id: string; name: string; balance: number; sold: boolean };
const NAMES = ["carrotking", "0x1a2b…3c4d", "@thumper", "hopium", "0x5e6f…7a8b", "bigears", "0x9c0d…1e2f", "@lettuce", "burrow", "0x3a4b…5c6d", "newbun", "0x7e8f…9a0b", "@clover", "0xb1c2…d3e4", "@dandelion", "warren", "0xf5a6…b7c8", "@hutch"];
const start = (): Holder[] => NAMES.map((name, i) => ({ id: `h${i}`, name, balance: Math.round(9_400_000 * Math.pow(0.8, i)), sold: false }));
const board = (r: Holder[]) => r.filter((h) => !h.sold).sort((a, b) => b.balance - a.balance);

function Preview() {
  const [all, setAll] = useState(start);
  const [auto, setAuto] = useState(true);
  const rows = board(all);
  // rank k (0-based) buys enough to pass rank `over`
  const pass = (k: number, over: number) =>
    setAll((cur) => {
      const s = board(cur);
      if (!s[k] || !s[over]) return cur;
      const to = Math.round(s[over].balance * 1.06);
      return cur.map((r) => (r.id === s[k].id ? { ...r, balance: to } : r));
    });
  // rank k sells: off the board for good
  const sell = (k: number) =>
    setAll((cur) => {
      const s = board(cur);
      return s[k] ? cur.map((r) => (r.id === s[k].id ? { ...r, sold: true } : r)) : cur;
    });
  // ?kick=1500&do=sell:3 or do=pass:1:0 fires one event after that many ms (for screenshots); auto goes off
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const k = Number(q.get("kick"));
    if (!k) return;
    setAuto(false);
    const [what, a, b] = (q.get("do") ?? "pass:1:0").split(":");
    const id = setTimeout(() => (what === "sell" ? sell(Number(a)) : pass(Number(a), Number(b))), k);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      if (Math.random() < 0.22) return sell(Math.floor(Math.random() * 10));
      const k = 1 + Math.floor(Math.random() * 11);
      pass(k, Math.max(0, k - 1 - Math.floor(Math.random() * 2)));
    }, 4400);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div className="brawl">
      <WaitingRoom rows={rows.slice(0, 10)} sold={all.filter((h) => h.sold).map((h) => h.id)} fx={!location.search.includes("fx=0")} />
      <div className="brawl__title">
        The Waiting Room<small>3D PROTOTYPE · DEMO HOLDERS · SEATS FOLLOW THE TOP 10</small>
      </div>
      <div className="brawl__ctl">
        <button onClick={() => pass(1, 0)}>#2 takes #1</button>
        <button onClick={() => pass(7, 2)}>#8 jumps to #3</button>
        <button onClick={() => pass(10, 5)}>New holder</button>
        <button className="is-sell" onClick={() => sell(3)}>#4 sells</button>
        <button className="is-sell" onClick={() => sell(0)}>#1 sells</button>
        <button className={auto ? "is-on" : ""} onClick={() => setAuto((a) => !a)}>Auto: {auto ? "on" : "off"}</button>
        <button onClick={() => setAll(start())}>Reset</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);

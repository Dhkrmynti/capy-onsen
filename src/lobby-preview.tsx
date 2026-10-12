/**
 * Prototype page for the waiting-room hero (open /lobby.html). Demo holders only: the buttons
 * change balances the way buys would, bring a new holder in, or mark one as sold, and the room
 * reacts exactly as it will to the live board. Scroll down to see the hero hand over to the page.
 */
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/800";
import "@fontsource/barlow-condensed/900";
import "@fontsource/jetbrains-mono/700";
import "./styles/brawl.css";
import WaitingRoom from "./kp/WaitingRoom";

type Holder = { id: string; name: string; balance: number; sold: boolean; joined: boolean };
const NAMES = ["apeking", "0x1a2b…3c4d", "@bananas", "hopium", "0x5e6f…7a8b", "silverback", "0x9c0d…1e2f", "@jungle", "kongfu", "0x3a4b…5c6d", "newape", "0x7e8f…9a0b", "@vines", "0xb1c2…d3e4", "@coconut", "chimp", "0xf5a6…b7c8", "@baboon"];
const start = (joined: boolean): Holder[] => NAMES.map((name, i) => ({ id: `h${i}`, name, balance: Math.round(9_400_000 * Math.pow(0.8, i)), sold: false, joined }));
const board = (r: Holder[]) => r.filter((h) => h.joined && !h.sold).sort((a, b) => b.balance - a.balance);
const DEV = { name: "0xde5k…f00d", balance: 20_000_000 };
const fmt = (n: number) => n.toLocaleString("en-US");

function Preview() {
  const q = new URLSearchParams(location.search);
  const [all, setAll] = useState(() => start(!q.has("empty")));
  const [auto, setAuto] = useState(!q.has("empty"));
  const [epoch, setEpoch] = useState(0); // a new room: whoever is on the board is seated without ceremony
  const scroll = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
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
  // someone who was not in the room buys in below the current last place
  const join = () =>
    setAll((cur) => {
      const next = cur.find((h) => !h.joined && !h.sold);
      if (!next) return cur;
      const s = board(cur);
      const balance = s.length ? Math.round(s[s.length - 1].balance * 0.82) : next.balance;
      return cur.map((r) => (r.id === next.id ? { ...r, joined: true, balance } : r));
    });
  const fresh = (joined: boolean) => {
    setAll(start(joined));
    setEpoch((e) => e + 1);
    if (!joined) setAuto(false);
  };
  // ?kick=1500&do=sell:3 | pass:1:0 | join fires one event after that many ms (for screenshots); auto goes off
  useEffect(() => {
    const k = Number(q.get("kick"));
    if (!k) return;
    setAuto(false);
    const [what, a, b] = (q.get("do") ?? "pass:1:0").split(":");
    const id = setTimeout(() => (what === "sell" ? sell(Number(a)) : what === "join" ? join() : pass(Number(a), Number(b))), k);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      const r = Math.random();
      if (r < 0.2) return sell(Math.floor(Math.random() * 10));
      if (r < 0.4) return join();
      const k = 1 + Math.floor(Math.random() * 9);
      pass(k, Math.max(0, k - 1 - Math.floor(Math.random() * 2)));
    }, 4400);
    return () => clearInterval(id);
  }, [auto]);
  // the first 70% of a screen of scrolling pushes the camera in; the next section then slides over the pinned room
  useEffect(() => {
    const on = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.7)));
      scroll.current = p;
      wrap.current?.style.setProperty("--p", p.toFixed(3));
    };
    on();
    const fixed = Number(q.get("p"));
    if (fixed) {
      scroll.current = fixed;
      wrap.current?.style.setProperty("--p", String(fixed));
      return;
    }
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const empty = rows.length === 0;
  return (
    <div className="lobby" ref={wrap}>
      <div className="brawl brawl--pin">
        <WaitingRoom key={epoch} rows={rows.slice(0, 10)} sold={all.filter((h) => h.sold).map((h) => h.id)} dev={DEV} scroll={scroll} fx={!location.search.includes("fx=0")} />
        <div className="brawl__title">
          {empty ? "Seat No. 1 is empty" : "Fight for the gold chair"}
          <small>{empty ? "FIRST HOLDER OF 100,000+ TAKES IT · DEMO" : "SEATS FOLLOW THE TOP 10 · SELL AND YOU ARE OUT · DEMO"}</small>
        </div>
        <div className="brawl__ctl">
          <button onClick={join}>New holder</button>
          <button onClick={() => pass(1, 0)}>#2 takes #1</button>
          <button onClick={() => pass(7, 2)}>#8 jumps to #3</button>
          <button className="is-sell" onClick={() => sell(3)}>#4 sells</button>
          <button className="is-sell" onClick={() => sell(0)}>#1 sells</button>
          <button className={auto ? "is-on" : ""} onClick={() => setAuto((a) => !a)}>Auto: {auto ? "on" : "off"}</button>
          <button onClick={() => fresh(false)}>Empty room</button>
          <button onClick={() => fresh(true)}>Full room</button>
        </div>
        <div className="brawl__hint">scroll</div>
        <div className="brawl__dim" />
      </div>
      <div className="lobby__gap" />
      <section className="sheet">
        <h2>The board</h2>
        <p className="sheet__note">Demo data. On the live site this list and the room above are the same ten wallets.</p>
        {empty ? (
          <div className="sheet__empty">Nobody is seated yet. Hold 100,000 or more and the gold chair is yours.</div>
        ) : (
          <ol className="sheet__rows">
            {rows.slice(0, 10).map((r, i) => (
              <li key={r.id} className={i === 0 ? "is-first" : ""}>
                <b>#{i + 1}</b>
                <span>{r.name}</span>
                <i>{fmt(r.balance)}</i>
              </li>
            ))}
          </ol>
        )}
        <ul className="sheet__rules">
          <li><b>Ten chairs.</b> The ten biggest holders of 100,000 or more are seated, biggest on the gold chair.</li>
          <li><b>Pass someone, take the chair.</b> The room moves the moment the board does.</li>
          <li><b>Sell once and you are out.</b> Through the window, for good.</li>
          <li><b>The dev works the desk.</b> Its wallet is on show and never gets a chair.</li>
        </ul>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);

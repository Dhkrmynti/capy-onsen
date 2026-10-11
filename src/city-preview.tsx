/**
 * Prototype page for the holder town (open /city.html): the 3D world plus its HUD. Local demo
 * only: the other characters are bots and the chat stays on this page.
 */
import { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/800";
import "@fontsource/barlow-condensed/900";
import "@fontsource/barlow/600";
import "@fontsource/jetbrains-mono/700";
import "./styles/city.css";
import City, { type ChatLine, type CityApi, type Hud } from "./city/City";

function Preview() {
  const [hud, setHud] = useState<Hud>({ near: false, driving: false, ai: false, rank: 0, speed: 0 });
  const [log, setLog] = useState<ChatLine[]>([]);
  const [text, setText] = useState("");
  const map = useRef<HTMLCanvasElement>(null);
  const api = useRef<CityApi>(null);
  const onHud = useCallback((h: Hud) => setHud((p) => (p.near === h.near && p.driving === h.driving && p.ai === h.ai && p.rank === h.rank && Math.round(p.speed) === Math.round(h.speed) ? p : h)), []);
  const onChat = useCallback((l: ChatLine) => setLog((cur) => [...cur.slice(-5), l]), []);
  return (
    <div className="city">
      <City onHud={onHud} onChat={onChat} map={map} api={api} />
      <div className="city__hud">
        <div className="city__me">
          <h1>Holder town</h1>
          <p>
            you · rank #{hud.rank} · 1.45M
            <br />
            {hud.driving ? `${Math.round(hud.speed * 3.6)} km/h` : "on foot"}
          </p>
        </div>
        <div className={`city__mode ${hud.ai ? "is-ai" : "is-human"}`}>{hud.ai ? "AI AGENT IS PLAYING FOR YOU · PRESS ANY KEY" : "HUMAN · YOU ARE PLAYING"}</div>
        <div className="city__keys">
          <b>WASD</b> move · <b>Shift</b> run · <b>Space</b> jump
          <br />
          <b>F</b> car in/out · <b>drag</b> look · <b>wheel</b> zoom
          <br />
          <b>Enter</b> chat · idle 12 s → AI takes over
        </div>
        {hud.near ? <div className="city__prompt">PRESS F TO DRIVE</div> : null}
        <canvas ref={map} className="city__map" width={190} height={190} />
        <form
          className="city__chat"
          onSubmit={(e) => {
            e.preventDefault();
            const v = text.trim().slice(0, 80);
            if (v) api.current?.say(v);
            setText("");
            (document.activeElement as HTMLElement | null)?.blur();
          }}
        >
          <div className="city__log">
            {log.map((l, i) => (
              <div key={`${l.at}${i}`}>
                <b>{l.who}</b> {l.ai ? <em>[AI]</em> : null} {l.text}
              </div>
            ))}
          </div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something… (Enter)" maxLength={80} />
        </form>
        <div className="city__note">3D PROTOTYPE · DEMO BOTS · NO SERVER YET</div>
      </div>
    </div>
  );
}

// Enter focuses the chat box from anywhere
window.addEventListener("keydown", (e) => {
  if (e.code === "Enter" && document.activeElement?.tagName !== "INPUT") {
    e.preventDefault();
    document.querySelector<HTMLInputElement>(".city__chat input")?.focus();
  }
});

createRoot(document.getElementById("root")!).render(<Preview />);

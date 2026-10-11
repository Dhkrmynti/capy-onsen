/**
 * Prototype page for the holder town (open /city.html): the 3D world plus its HUD. Local demo
 * only: the other characters are bots and the chat stays on this page. The "Demo" box lets you
 * try a rank, since what you may wear and whether you may open a speech depend on it.
 */
import { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/800";
import "@fontsource/barlow-condensed/900";
import "@fontsource/barlow/600";
import "@fontsource/jetbrains-mono/700";
import "./styles/city.css";
import City, { type ChatLine, type CityApi, type Hud } from "./city/City";
import { HOODIES, type Kind, type Outfit } from "./city/Critter";

const KINDS: [Kind, string][] = [["rabbit", "Rabbit"], ["ape", "Ape"], ["croc", "Croc"]];
const OUTFITS: [Outfit, string, number][] = [["hoodie", "Hoodie", 999], ["suit", "Suit", 10], ["cape", "Royal cape", 1]];
const same = (a: Hud, b: Hud) => (Object.keys(a) as (keyof Hud)[]).every((k) => (k === "speed" ? Math.round(a.speed) === Math.round(b.speed) : a[k] === b[k]));

function Preview() {
  const [hud, setHud] = useState<Hud>({ near: false, driving: false, ai: false, rank: 0, speed: 0, live: false, onStage: false, kind: "rabbit", outfit: "hoodie", color: "" });
  const [log, setLog] = useState<ChatLine[]>([]);
  const [text, setText] = useState("");
  const [wardrobe, setWardrobe] = useState(false);
  const map = useRef<HTMLCanvasElement>(null);
  const api = useRef<CityApi>(null);
  const onHud = useCallback((h: Hud) => setHud((p) => (same(p, h) ? p : h)), []);
  const onChat = useCallback((l: ChatLine) => setLog((cur) => [...cur.slice(-6), l]), []);
  const role = hud.rank === 0 ? "…" : hud.rank === 1 ? "No. 1 · you may open a speech" : hud.rank <= 5 ? "Assistant (No. 2-5) · you may speak at the table" : hud.rank <= 10 ? "Top 10" : "Holder";
  const canSpeak = hud.live && hud.rank <= 5 && hud.onStage;
  return (
    <div className="city">
      <City onHud={onHud} onChat={onChat} map={map} api={api} fx={!location.search.includes("fx=0")} />
      <div className="city__hud">
        <div className="city__me">
          <h1>Holder town</h1>
          <p>
            you · rank #{hud.rank} · {role}
            <br />
            {hud.driving ? `${Math.round(hud.speed * 3.6)} km/h` : "on foot"}
          </p>
          <div className="city__row">
            <button onClick={() => setWardrobe((w) => !w)}>Avatar</button>
            {hud.rank === 1 && !hud.live ? <button className="is-go" onClick={() => api.current?.startSpeech()}>Start speech</button> : null}
            {hud.rank === 1 && hud.live ? <button className="is-stop" onClick={() => api.current?.endSpeech()}>End speech</button> : null}
            {hud.live && hud.rank >= 2 && hud.rank <= 5 && !hud.onStage ? <button className="is-go" onClick={() => api.current?.takeSeat()}>Take my seat (G)</button> : null}
          </div>
          {wardrobe ? (
            <div className="city__wardrobe">
              <h2>Character</h2>
              <div className="city__row">
                {KINDS.map(([k, label]) => (
                  <button key={k} className={hud.kind === k ? "is-on" : ""} onClick={() => api.current?.setAvatar({ kind: k })}>
                    {label}
                  </button>
                ))}
              </div>
              <h2>Outfit</h2>
              <div className="city__row">
                {OUTFITS.map(([o, label, need]) => {
                  const locked = hud.rank > need;
                  return (
                    <button key={o} disabled={locked} className={hud.outfit === o ? "is-on" : ""} onClick={() => api.current?.setAvatar({ outfit: o })}>
                      {label}
                      {locked ? <small> 🔒 top {need}</small> : null}
                    </button>
                  );
                })}
              </div>
              <h2>{hud.outfit === "hoodie" ? "Hoodie colour" : "Tie and cape colour"}</h2>
              <div className="city__row">
                {HOODIES.map((c) => (
                  <button key={c} className={`city__swatch${hud.color === c ? " is-on" : ""}`} style={{ background: c }} aria-label={c} onClick={() => api.current?.setAvatar({ color: c })} />
                ))}
              </div>
              <p>The crown is not an outfit: whoever holds No. 1 wears it. No. 2 to 10 wear the gold chain.</p>
            </div>
          ) : null}
        </div>
        <div className={`city__mode ${hud.ai ? "is-ai" : "is-human"}`}>{hud.ai ? "AI AGENT IS PLAYING FOR YOU · PRESS ANY KEY" : "HUMAN · YOU ARE PLAYING"}</div>
        {hud.live ? <div className="city__live">● LIVE · TOP 1 SPEECH IN THE PARK{canSpeak ? " · YOUR CHAT GOES ON THE SCREEN" : ""}</div> : null}
        <div className="city__keys">
          <b>WASD</b> move · <b>Shift</b> run · <b>Space</b> jump
          <br />
          <b>F</b> car in/out · <b>drag</b> look · <b>wheel</b> zoom
          <br />
          <b>Enter</b> chat · idle 12 s → AI takes over
          <div className="city__demo">
            <span>DEMO · play as</span>
            <div className="city__row">
              {[1, 3, 8, 11].map((r) => (
                <button key={r} className={hud.rank === r ? "is-on" : ""} onClick={() => api.current?.playAs(r)}>
                  #{r}
                </button>
              ))}
            </div>
            {hud.rank !== 1 ? <button onClick={() => api.current?.botSpeech()}>{hud.live ? "Bot No. 1 ends its speech" : "Bot No. 1 opens a speech"}</button> : null}
          </div>
        </div>
        {hud.near ? <div className="city__prompt">PRESS F TO DRIVE</div> : null}
        <canvas ref={map} className="city__map" width={190} height={190} />
        <form
          className="city__chat"
          onSubmit={(e) => {
            e.preventDefault();
            const v = text.trim().slice(0, 120);
            if (v) api.current?.say(v);
            setText("");
            (document.activeElement as HTMLElement | null)?.blur();
          }}
        >
          <div className="city__log">
            {log.map((l, i) => (
              <div key={`${l.at}${i}`} className={l.role ? "is-stage" : ""}>
                {l.role ? <u>{l.role === "speech" ? "SPEECH" : "ASSISTANT"}</u> : null} <b>{l.who}</b> {l.ai ? <em>[AI]</em> : null} {l.text}
              </div>
            ))}
          </div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={canSpeak ? "Speak to the crowd… (Enter)" : "Say something… (Enter)"} maxLength={120} />
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

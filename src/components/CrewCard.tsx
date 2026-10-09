import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LinkSimple, Check, MagnifyingGlass, SealCheck, PenNib, Wallet, XLogo } from "@phosphor-icons/react";
import { DEMO, demoSaveByline, demoWallet, startXDemo, takeXDemo, addrUrl, amount, bylineNonce, claimByline, dateWib, eth, fetchWallet, short, startXLink, txUrl, unlinkX, type WalletInfo } from "../lib/api";
import { CrewFace, XCheck, XLink } from "./Face";
import { aliasFor, nameFor } from "../lib/alias";
import { connectWallet, hasWallet, signText, useAccount } from "../lib/wallet";
import { Mugshot, PARTS, PART_NAMES, traitsFor, validTraits, type Traits } from "./Mugshot";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { prefersReducedMotion } from "../lib/motion";
import { Monogram } from "./Engrave";

gsap.registerPlugin(useGSAP);

const VALID = /^0x[0-9a-fA-F]{40}$/;

type Tone = "ok" | "wait" | "stop" | "dim";
const STAMP: Record<WalletInfo["status"], { word: string; tone: Tone; line: string }> = {
  sitting: { word: "Account", tone: "ok", line: "An open account. You get a part of the next dividend." },
  waiting: { word: "Pending", tone: "wait", line: "Account open, but your first $OLDM are still under the hold time." },
  "too-small": { word: "Savings", tone: "wait", line: "Holding, but under the minimum for an account." },
  hopped: { word: "Closed", tone: "stop", line: "This wallet sold. Account closed for good." },
  excluded: { word: "House", tone: "dim", line: "Engine, curve, reserve or dead address. Never gets a dividend." },
  "not-holding": { word: "No account", tone: "dim", line: "This wallet holds no $OLDM." },
};

/** What X sign-in came back with (?x=…), read once and then cleared from the address bar. */
const X_RESULT: Record<string, { ok: boolean; text: string }> = {
  linked: { ok: true, text: "X linked. The register now prints your X handle, picture and badge." },
  demo: { ok: true, text: "X linked for real: that's your handle, picture and badge. Illustration edition, so nothing was saved." },
  cancelled: { ok: false, text: "X sign-in cancelled. Nothing changed." },
  expired: { ok: false, text: "The X sign-in took too long. Try again." },
  failed: { ok: false, text: "X didn't confirm the account. Try again in a minute." },
};
function takeXResult() {
  const url = new URL(window.location.href);
  const r = url.searchParams.get("x");
  if (!r) return null;
  url.searchParams.delete("x");
  window.history.replaceState(null, "", url);
  return X_RESULT[r] ?? X_RESULT.failed;
}

export const NO_WALLET = `No wallet in this browser. Open ${typeof window === "undefined" ? "this site" : window.location.host} inside your wallet app (MetaMask, Rabby, OKX) to connect. GMGN's built-in wallet can't sign here yet.`;

function readQuery() {
  const p = new URLSearchParams(window.location.search).get("w") || window.location.hash.match(/w=(0x[0-9a-fA-F]{40})/)?.[1] || "";
  return VALID.test(p) ? p : "";
}

/** Rows elsewhere on the page open a wallet's card through this event. */
export function openCard(addr: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("w", addr);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new CustomEvent("rbank:card", { detail: addr }));
}

/**
 * The seal desk: the holder connects the wallet on this card, types an account
 * name and signs one plain message. No transaction is ever requested.
 */
/** A wallet's account seal: the parts it picked, else the ones its address generates. */
export function mugOf(addr: string, pp?: number[] | null): Traits {
  return validTraits(pp) ? pp : traitsFor(addr);
}

const SLOTS = [
  ["fur", "Ink"],
  ["hat", "Frame"],
  ["acc", "Emblem"],
  ["bg", "Paper"],
] as const;

function BylineDesk({ info, onSaved, flash }: { info: WalletInfo; onSaved: (patch: Partial<WalletInfo>) => void; flash: { ok: boolean; text: string } | null }) {
  // The header's Connect button and this desk share one account.
  const shared = useAccount();
  // Back from a demo X sign-in, the booth reopens already "connected".
  const [demoAccount, setDemoAccount] = useState(DEMO && flash ? info.addr : "");
  const account = demoAccount || shared;
  const [open, setOpen] = useState(!!flash || (!!shared && shared.toLowerCase() === info.addr.toLowerCase()));
  const [tab, setTab] = useState<"name" | "x">(info.x ? "x" : "name");
  // A freshly linked X account opens on its own tab.
  const hasX = !!info.x;
  useEffect(() => {
    if (hasX) setTab("x");
  }, [hasX]);
  const [name, setName] = useState(info.nickname || aliasFor(info.addr));
  const [mug, setMug] = useState<Traits>(mugOf(info.addr, info.pp));
  const turn = (slot: number, by: number) => {
    const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg][slot];
    const next = [...mug] as Traits;
    next[slot] = (next[slot] + by + max) % max;
    setMug(next);
  };
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(flash);
  const mine = account && account.toLowerCase() === info.addr.toLowerCase();

  const connect = async () => {
    setNote(null);
    // The illustration edition opens the booth without a wallet; nothing it saves leaves the page.
    if (DEMO) {
      setDemoAccount(info.addr);
      return setNote({ ok: true, text: "Illustration edition: try it all. Whatever you stamp stays on this page only." });
    }
    if (!hasWallet())
      return setNote({ ok: false, text: NO_WALLET });
    try {
      setBusy(true);
      const a = await connectWallet();
      if (a.toLowerCase() !== info.addr.toLowerCase()) setNote({ ok: false, text: `This card belongs to ${short(info.addr)}, your wallet is ${short(a)}. Switch accounts in the wallet.` });
    } catch (e: any) {
      setNote({ ok: false, text: e?.message || "The wallet didn't connect." });
    } finally {
      setBusy(false);
    }
  };

  const sign = async () => {
    setNote(null);
    const tidy = name.replace(/\s+/g, " ").trim();
    if (DEMO) {
      if (tidy.length < 3 || tidy.length > 18 || !/^[A-Za-z0-9 _'-]+$/.test(tidy)) return setNote({ ok: false, text: "Names are 3 to 18 letters, numbers, spaces, - ' or _." });
      demoSaveByline(info.addr, { nickname: tidy, pp: mug });
      onSaved({ nickname: tidy, pp: mug });
      return setNote({ ok: true, text: `Stamped. You're "${tidy}" on the register now. (Illustration edition: on this page only.)` });
    }
    try {
      setBusy(true);
      const clean = name.replace(/\s+/g, " ").trim();
      const { nonce, template } = await bylineNonce(info.addr);
      const signature = await signText(account, template.replace("{nickname}", clean).replace("{mugshot}", mug.join("-")));
      const saved = await claimByline(info.addr, clean, mug, nonce, signature);
      onSaved({ nickname: saved.nickname, pp: saved.pp });
      setNote({ ok: true, text: `Stamped. You're "${saved.nickname}" on the register now.` });
      window.dispatchEvent(new Event("rbank:refresh"));
    } catch (e: any) {
      setNote({ ok: false, text: e?.code === 4001 ? "You cancelled the signature. Nothing was saved." : e?.message || "Couldn't save the name." });
    } finally {
      setBusy(false);
    }
  };

  const failed = (e: any, what: string) => setNote({ ok: false, text: e?.code === 4001 ? "You cancelled the signature. Nothing changed." : e?.message || what });

  // Link X: the wallet signs, then the browser goes to X and comes back to this card.
  const linkX = async () => {
    setNote(null);
    if (DEMO) {
      // A real X sign-in (shown once, never saved). Without X keys on the engine, say so plainly;
      // a pretend account is only used if the visitor asks for one.
      try {
        setBusy(true);
        const { url } = await startXDemo(info.addr);
        return window.location.assign(url);
      } catch (e: any) {
        setBusy(false);
        setPretend(true);
        return setNote({ ok: false, text: `Real X sign-in isn't switched on yet (${e?.message || "no X app keys on the server"}). You can preview with a pretend account instead.` });
      }
    }
    try {
      setBusy(true);
      const { nonce, linkX: text } = await bylineNonce(info.addr);
      const signature = await signText(account, text);
      const { url } = await startXLink(info.addr, nonce, signature);
      window.location.assign(url);
    } catch (e: any) {
      failed(e, "Couldn't start X sign-in.");
      setBusy(false);
    }
  };

  const [pretend, setPretend] = useState(false);
  const usePretend = () => {
    const x = { username: "your_x_handle", name: "Your X name", avatar: "/favicon-192.png", verified: "blue" };
    demoSaveByline(info.addr, { x });
    onSaved({ x });
    setPretend(false);
    setNote({ ok: true, text: "Pretend X account linked. With X sign-in switched on, this is your real handle, picture and badge." });
  };

  const dropX = async () => {
    setNote(null);
    if (DEMO) {
      demoSaveByline(info.addr, { x: null });
      onSaved({ x: null });
      setTab("name");
      return setNote({ ok: true, text: "X unlinked. The register prints your name and seal again." });
    }
    try {
      setBusy(true);
      const { nonce, unlinkX: text } = await bylineNonce(info.addr);
      await unlinkX(info.addr, nonce, await signText(account, text));
      onSaved({ x: null });
      setTab("name");
      setNote({ ok: true, text: "X unlinked. The register prints your name and seal again." });
      window.dispatchEvent(new Event("rbank:refresh"));
    } catch (e: any) {
      failed(e, "Couldn't unlink X.");
    } finally {
      setBusy(false);
    }
  };

  if (!open)
    return (
      <button type="button" className="press-btn is-ink byline__open" onClick={() => setOpen(true)}>
        <PenNib weight="bold" aria-hidden="true" /> {info.x ? "Manage X link" : info.nickname ? "Edit name & seal" : "Set your name or connect X"}
      </button>
    );

  return (
    <div className="byline">
      <p className="byline__head">The seal desk</p>
      {!mine ? (
        <>
          <button type="button" className="press-btn is-ink" onClick={connect} disabled={busy}>
            <Wallet weight="bold" aria-hidden="true" /> {busy ? "Connecting" : account ? "Switch to this wallet" : "Connect this wallet"}
          </button>
          {account && !note ? <p className="lookup__help">Your wallet is {short(account)}. This card is {short(info.addr)}: switch accounts in the wallet to edit it.</p> : null}
        </>
      ) : (
        <>
          <div className="byline__tabs" role="tablist" aria-label="How the register prints you">
            <button type="button" role="tab" aria-selected={tab === "name"} className="byline__tab" onClick={() => setTab("name")}>
              <PenNib weight="bold" aria-hidden="true" /> Name & seal
            </button>
            <button type="button" role="tab" aria-selected={tab === "x"} className="byline__tab" onClick={() => setTab("x")}>
              <XLogo weight="bold" aria-hidden="true" /> Connect X
            </button>
          </div>
          {tab === "x" ? (
            <div className="xdesk" role="tabpanel">
              {info.x ? (
                <>
                  <div className="xdesk__who">
                    <CrewFace addr={info.addr} pp={info.pp} x={info.x} size={64} className="xdesk__face" />
                    <div>
                      <p className="xdesk__name">
                        {info.x.name} <XCheck x={info.x} />
                      </p>
                      <a className="xdesk__handle" href={`https://x.com/${info.x.username}`} target="_blank" rel="noreferrer noopener">
                        @{info.x.username}
                      </a>
                    </div>
                  </div>
                  <p className="lookup__help">Handle, picture and badge come from X and can't be edited here. Changed them on X? Link again to reprint.</p>
                  <div className="xdesk__actions">
                    <button type="button" className="press-btn is-ink" onClick={linkX} disabled={busy}>
                      <XLogo weight="bold" aria-hidden="true" /> Link again
                    </button>
                    <button type="button" className="press-btn" onClick={dropX} disabled={busy}>
                      Unlink X
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="xdesk__pitch">Print your X account instead: your handle, your picture, and your badge if X gave you one. A logo next to your name opens your profile.</p>
                  <button type="button" className="press-btn is-ink" onClick={linkX} disabled={busy || !info.xLogin}>
                    <XLogo weight="bold" aria-hidden="true" /> {busy ? "Opening X" : "Sign & connect X"}
                  </button>
                  {DEMO && pretend ? (
                    <button type="button" className="press-btn" onClick={usePretend}>
                      Use a pretend account
                    </button>
                  ) : null}
                  <p className="lookup__help">{info.xLogin ? "Read-only: we never post or see your DMs. Your picture and handle then can't be edited here." : "X sign-in opens at launch."}</p>
                </>
              )}
            </div>
          ) : info.x ? (
            <p className="lookup__help" role="tabpanel">
              Your X account is showing right now. Unlink X on the other tab to stamp a name and seal instead.
            </p>
          ) : (
            <form
              className="byline__form"
              onSubmit={(e) => {
                e.preventDefault();
                sign();
              }}
            >
              <div className="booth">
                <Mugshot
                  traits={mug}
                  size={132}
                  className="booth__shot"
                  title={`Your seal: ${PART_NAMES.fur[mug[0]]} ink, ${PART_NAMES.hat[mug[1]]} frame, ${PART_NAMES.acc[mug[2]]}, ${PART_NAMES.bg[mug[3]]} paper`}
                />
                <div className="booth__dials">
                  {SLOTS.map(([key, label], i) => (
                    <div className="booth__dial" key={key}>
                      <span className="booth__label">{label}</span>
                      <button type="button" className="booth__turn" onClick={() => turn(i, -1)} aria-label={`Previous ${label.toLowerCase()}`}>
                        <CaretLeft weight="bold" />
                      </button>
                      <span className="booth__value">{PART_NAMES[key][mug[i]]}</span>
                      <button type="button" className="booth__turn" onClick={() => turn(i, 1)} aria-label={`Next ${label.toLowerCase()}`}>
                        <CaretRight weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <label htmlFor="byline-name">Account name</label>
              <div className="lookup__field">
                <input id="byline-name" value={name} maxLength={18} onChange={(e) => setName(e.target.value)} autoComplete="off" spellCheck={false} />
                <button type="submit" className="press-btn" disabled={busy}>
                  {busy ? "Signing" : "Sign & stamp"}
                </button>
              </div>
              <p className="lookup__help">3 to 18 letters or numbers. Free to sign, moves no funds, once a day.</p>
            </form>
          )}
        </>
      )}
      {note ? (
        <p className={note.ok ? "byline__ok" : "lookup__error"} role={note.ok ? "status" : "alert"}>
          {note.text}
        </p>
      ) : null}
    </div>
  );
}

export function CrewCard({ live }: { live: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [input, setInput] = useState(readQuery);
  const [info, setInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState(false);
  const [xFlash] = useState(takeXResult);

  const lookup = async (addr: string) => {
    if (!VALID.test(addr)) {
      setError("That isn't a wallet address. It starts with 0x and has 42 characters.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const w = await fetchWallet(addr);
      setInfo(w);
      const url = new URL(window.location.href);
      url.searchParams.set("w", addr);
      window.history.replaceState(null, "", url);
    } catch (e: any) {
      setError(e?.message === "Not Found" || !live ? "The doors aren't open yet, so there are no accounts to check." : "Couldn't reach the engine. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const q = readQuery();
    const code = new URLSearchParams(window.location.search).get("xdemo");
    if (DEMO && code && q) {
      const url = new URL(window.location.href);
      url.searchParams.delete("xdemo");
      window.history.replaceState(null, "", url);
      takeXDemo(code)
        .then((x) => demoSaveByline(q, { x }))
        .catch(() => {})
        .finally(() => lookup(q));
    } else if (q) lookup(q);
    const open = (e: Event) => {
      const addr = (e as CustomEvent<string>).detail;
      setInput(addr);
      lookup(addr);
      const el = document.getElementById("card");
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o: { offset: number }) => void } }).__lenis;
      if (el) lenis ? lenis.scrollTo(el, { offset: -64 }) : el.scrollIntoView();
    };
    // The header's Connect button found no wallet: say so here, where the card lives.
    const noWallet = () => {
      setError(NO_WALLET);
      document.getElementById("card")?.scrollIntoView();
    };
    window.addEventListener("rbank:card", open);
    window.addEventListener("rbank:nowallet", noWallet);
    return () => {
      window.removeEventListener("rbank:card", open);
      window.removeEventListener("rbank:nowallet", noWallet);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
    },
    { scope: root },
  );

  // A fresh card is printed: it slides out of the slot and the stamp lands a beat later.
  useGSAP(
    () => {
      if (!info || prefersReducedMotion()) return;
      gsap.fromTo(".card", { y: 46, rotate: 2.5, opacity: 0 }, { y: 0, rotate: -1, opacity: 1, duration: 0.8, ease: "expo.out" });
      gsap.fromTo(".card__stamp", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, delay: 0.45, ease: "power4.in" });
    },
    { scope: root, dependencies: [info] },
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    lookup(input.trim());
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinked(true);
      setTimeout(() => setLinked(false), 1600);
    } catch {}
  };

  const base = info ? STAMP[info.status] : null;
  // Crew outside the top N gets no cut yet: say how far it has to climb.
  const stamp =
    info && base && info.status === "sitting" && !info.inTop
      ? { ...base, tone: "wait" as const, line: `Rank #${info.rank}. Only the Preferred Ten get the dividend, so climb ${info.rank! - info.topN} more places.` }
      : info && base && info.status === "sitting"
        ? { ...base, line: `One of the Preferred Ten. You get a part of the next dividend.` }
        : base;

  return (
    <section className="stop stop--tall cardpage" id="card" ref={root} aria-labelledby="card-head">
      <div className="h-wrap stop__inner">
      <div className="cardpage__grid">
        <div className="cardpage__ask">
          <h2 className="plaque__head" id="card-head">
            Your box.
          </h2>
          <form className="lookup" onSubmit={submit} noValidate>
            <label htmlFor="wallet">Account number (wallet address)</label>
            <div className="lookup__field">
              <input
                id="wallet"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="0x…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-invalid={!!error}
                aria-describedby="wallet-help"
              />
              <button type="submit" className="press-btn is-ink" disabled={busy}>
                <MagnifyingGlass weight="bold" aria-hidden="true" /> {busy ? "Checking" : "Check"}
              </button>
            </div>
            <p id="wallet-help" className={error ? "lookup__error" : "lookup__help"} role={error ? "alert" : undefined}>
              {error || (xFlash && !info && !readQuery() ? xFlash.text : "Read only. Connect only to claim a name; it signs a message, never a payment.")}
            </p>
          </form>
        </div>

        <div className="cardpage__slot" aria-live="polite">
          {info && stamp ? (
            <article className={`card is-${stamp.tone}`}>
              <header className="card__top">
                <span className="card__org"><Monogram size={26} /> Old Money</span>
                <span className="card__kind">Account card</span>
              </header>
              <div className="card__body">
                <div className="card__mug" aria-hidden="true">
                  <CrewFace addr={info.addr} pp={info.pp} x={info.x} size={112} />
                </div>
                <div className="card__id">
                  {(() => {
                    const who = nameFor(info.addr, info.nickname, info.x);
                    return (
                      <>
                        <p className={`card__who ${info.status === "hopped" ? "is-struck" : ""} ${info.x ? "is-x" : ""}`}>
                          {who.name}
                          {info.x ? <XCheck x={info.x} className="card__xcheck" /> : who.claimed ? <SealCheck className="card__seal" weight="fill" aria-label="claimed name" /> : null}
                        </p>
                        <p className="card__addr tabular">
                          <a href={addrUrl(info.addr)} target="_blank" rel="noreferrer">
                            {short(info.addr)}
                          </a>
                          {info.x ? (
                            <>
                              <span> · </span>
                              <XLink x={info.x} className="card__xlink" />
                            </>
                          ) : who.claimed ? null : (
                            <span> · house name</span>
                          )}
                        </p>
                      </>
                    );
                  })()}
                  <dl className="card__facts">
                    <div>
                      <dt>Days held</dt>
                      <dd className="tabular">{info.padDays}</dd>
                    </div>
                    <div>
                      <dt>Balance</dt>
                      <dd className="tabular">{amount(info.balance)}</dd>
                    </div>
                    <div>
                      <dt>Paid so far</dt>
                      <dd className="tabular">{eth(info.received)}</dd>
                    </div>
                    <div>
                      <dt>{info.status === "sitting" && info.inTop ? "Next dividend, est." : info.status === "hopped" ? "Closed" : "Rank"}</dt>
                      <dd className="tabular">
                        {info.status === "sitting" && info.inTop ? (
                          eth(info.estNext)
                        ) : info.status === "hopped" ? (
                          info.hoppedTx ? (
                            <a href={txUrl(info.hoppedTx)} target="_blank" rel="noreferrer">
                              {dateWib(info.hoppedAt)}
                            </a>
                          ) : (
                            dateWib(info.hoppedAt)
                          )
                        ) : info.rank ? (
                          `#${info.rank}`
                        ) : (
                          "-"
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <p className="card__line">{stamp.line}</p>
              <footer className="card__foot">
                {info.rank ? <span className="tabular">Rank #{info.rank}</span> : <span />}
                <button type="button" className="card__share" onClick={share}>
                  {linked ? <Check weight="bold" aria-hidden="true" /> : <LinkSimple weight="bold" aria-hidden="true" />}
                  {linked ? "Link copied" : "Copy link"}
                </button>
              </footer>
              <span className="card__stamp">{stamp.word}</span>
            </article>
          ) : (
            <div className="card is-blank" aria-hidden="true">
              <header className="card__top">
                <span className="card__org"><Monogram size={26} /> Old Money</span>
                <span className="card__kind">Account card</span>
              </header>
              <p className="card__blank">Your card prints here.</p>
            </div>
          )}
          {info && info.status !== "not-holding" && info.status !== "excluded" ? (
            <BylineDesk key={info.addr} info={info} flash={xFlash} onSaved={(patch) => setInfo(DEMO ? demoWallet(info.addr) : { ...info, ...patch })} />
          ) : info && info.status === "not-holding" ? (
            // Say why the booth is shut instead of leaving a connected holder guessing.
            <p className="byline__shut">
              {live
                ? "Names, seals and X links are for wallets holding $OLDM. Buy in, then come back to this card."
                : "The seal desk opens at launch: once $OLDM is trading, any wallet holding it can set a name, stamp a seal or link X here."}
            </p>
          ) : null}
        </div>
      </div>
      </div>
    </section>
  );
}

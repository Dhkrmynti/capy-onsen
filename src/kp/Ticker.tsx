/** A strip of text sliding sideways, like the queue display over a counter. Decoration only. */
export function Ticker({ items, tone = "gold" }: { items: string[]; tone?: "gold" | "red" | "teal" }) {
  const run = [...items, ...items, ...items, ...items];
  return (
    <div className={`st-ticker is-${tone}`} aria-hidden="true">
      <p>
        {run.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </p>
    </div>
  );
}

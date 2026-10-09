/**
 * Every wallet gets a citizen name until its owner claims one. The alias is computed
 * from the address alone, so the same wallet always gets the same name, everywhere,
 * with nothing stored.
 */
const HANDLES = [
  "Patient", "Silent", "Lucky", "Iron", "Golden", "Quiet", "Steady", "Wise", "Bold", "Old",
  "Diamond", "Stoic", "Bronze", "Marble", "Olive", "Night", "Silver", "Sleepless", "Brave", "Stone",
  "Honest", "Swift", "Gentle", "Never-Sell", "Long-Haul", "Deep-Pocket", "Owl-Eyed", "Sunday", "Stubborn", "Little",
];
const NAMES = [
  "Dion", "Theo", "Nikos", "Leon", "Kostas", "Yannis", "Stavros", "Petros", "Alexios", "Damon",
  "Castor", "Philon", "Kleon", "Lysander", "Milo", "Daphne", "Lyra", "Ione", "Thalia", "Phaedra",
  "Calla", "Iris", "Nyx", "Zoe", "Melina", "Xanthe", "Rhea", "Selene", "Ariadne", "Electra",
];

function hash(s: string) {
  // FNV-1a, 32-bit: small, fast, and stable across browsers
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function aliasFor(addr: string) {
  const h = hash(addr.toLowerCase());
  return `${HANDLES[h % HANDLES.length]} ${NAMES[Math.floor(h / HANDLES.length) % NAMES.length]}`;
}

/** What the paper prints for a wallet: its X handle, else its claimed name, else its citizen name. */
export function nameFor(addr: string, nickname?: string, x?: { username: string } | null) {
  if (x) return { name: `@${x.username}`, claimed: true, x: true };
  return nickname ? { name: nickname, claimed: true, x: false } : { name: aliasFor(addr), claimed: false, x: false };
}

/**
 * Every wallet gets a gang alias until its owner claims a byline. The alias is computed
 * from the address alone, so the same wallet always gets the same name, everywhere,
 * with nothing stored.
 */
const HANDLES = [
  "Two-Bag", "Silent", "Lucky", "Iron", "Velvet", "Quiet", "Smokey", "Slick", "Big", "Little",
  "Diamond", "Cold", "Steady", "Patient", "Midnight", "Lefty", "Brass", "Sleepy", "Golden", "Stone",
  "Sharp", "Crooked", "Gentle", "No-Sell", "Long-Haul", "Deep-Pocket", "Bottom-Line", "Night-Shift", "Old", "Sunday",
];
const NAMES = [
  "Tony", "Sal", "Vinnie", "Rocco", "Lou", "Frankie", "Mickey", "Benny", "Nicky", "Joey",
  "Dino", "Carmine", "Gus", "Moe", "Eddie", "Sonny", "Rita", "Lola", "Dolly", "Mae",
  "Ruby", "Vera", "Fats", "Pauly", "Sammy", "Bugsy", "Mugsy", "Toots", "Ace", "Babe",
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

/** What the paper prints for a wallet: its X handle, else its claimed byline, else its gang alias. */
export function nameFor(addr: string, nickname?: string, x?: { username: string } | null) {
  if (x) return { name: `@${x.username}`, claimed: true, x: true };
  return nickname ? { name: nickname, claimed: true, x: false } : { name: aliasFor(addr), claimed: false, x: false };
}

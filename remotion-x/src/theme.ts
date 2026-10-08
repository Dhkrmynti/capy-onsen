import { loadFont as loadSign } from "@remotion/google-fonts/BigShoulders";
import { loadFont as loadFlap } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadBody } from "@remotion/google-fonts/Barlow";
import { loadFont as loadBrand } from "@remotion/google-fonts/AlfaSlabOne";

// Same palette as the site (src/styles/tokens.css).
export const C = {
  wall: "#1f6b4a",
  wallDeep: "#174f37",
  wallShade: "#12402c",
  wallInk: "#f4f0e4",
  wallInkSoft: "#cfe3d6",
  board: "#191c1a",
  boardFrame: "#0f1110",
  flap: "#262a28",
  flapLit: "#2f3431",
  flapSplit: "#0b0c0b",
  glyph: "#f4f0e4",
  glyphDim: "#a3ada6",
  enamel: "#f4f0e4",
  enamelInk: "#10402b",
  amber: "#f2b31b",
  amberInk: "#2b1d00",
  stop: "#e0482d",
  frog: "#a6d83c",
  frogShade: "#7fb22a",
  frogBelly: "#e9f2a6",
  frogInk: "#0c2418",
  pad: "#0e3e2c",
  padVein: "#1c5a41",
};

export const F = {
  sign: loadSign("normal", { weights: ["800", "900"], subsets: ["latin"] }).fontFamily,
  flap: loadFlap("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily,
  body: loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
  brand: loadBrand("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

// Glazed subway tile in brick bond: the station wall from the site.
export const WALL_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='48'%3E%3Cg fill='none' stroke='%23082418' stroke-opacity='.28' stroke-width='2'%3E%3Cpath d='M0 1h96M0 25h96M1 0v24M49 24v24'/%3E%3C/g%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.05' stroke-width='2'%3E%3Cpath d='M0 3h96M0 27h96'/%3E%3C/g%3E%3C/svg%3E\")";

// Robin Heist palette (src/styles/tokens.css after the rebrand).
export const RB = {
  wall: "#15243b",
  wallDeep: "#101c30",
  wallShade: "#0b1424",
  paper: "#f3ecdc",
  paperSoft: "#b9c4d6",
  ink: "#15243b",
  brass: "#e2b64e",
  brassInk: "#2b1d00",
  cash: "#83d17a",
  alarm: "#e0482d",
};

// Riveted steel panels: the vault wall from the site.
export const VAULT_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cg fill='none' stroke='%23030812' stroke-opacity='.45' stroke-width='2'%3E%3Cpath d='M0 1h160M1 0v160'/%3E%3C/g%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.05' stroke-width='2'%3E%3Cpath d='M0 3h160M3 0v160'/%3E%3C/g%3E%3Cg fill='%23030812' fill-opacity='.5'%3E%3Ccircle cx='14' cy='14' r='3'/%3E%3Ccircle cx='146' cy='14' r='3'/%3E%3Ccircle cx='14' cy='146' r='3'/%3E%3Ccircle cx='146' cy='146' r='3'/%3E%3C/g%3E%3C/svg%3E\")";

/**
 * Procedural textures for the planet scene, drawn once on canvas at load: no image files to
 * download. Regolith with craters (colour + bump), a banded gas giant and its ring, the moon,
 * the Milky Way sky, rocket panelling with its name, and solar cells.
 */
import * as THREE from "three";

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}
function tex(c: HTMLCanvasElement, color = true) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Dusty ground pocked with craters; the bump map shares every crater with the colour map. */
export function regolith(w: number, h: number, base: string, dark: string, light: string, craters: number) {
  const [cc, g] = canvas(w, h);
  const [bc, b] = canvas(w, h);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  b.fillStyle = "#808080";
  b.fillRect(0, 0, w, h);
  // broad mottling, then fine grit
  for (let i = 0; i < 260; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 10 + rnd() * w * 0.06;
    g.globalAlpha = 0.05 + rnd() * 0.07;
    g.fillStyle = rnd() > 0.5 ? dark : light;
    g.beginPath();
    g.ellipse(x, y, r, r * (0.5 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < w * h * 0.02; i++) {
    const v = rnd();
    g.globalAlpha = 0.18;
    g.fillStyle = v > 0.5 ? light : dark;
    g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
    b.globalAlpha = 0.3;
    b.fillStyle = v > 0.5 ? "#a0a0a0" : "#606060";
    b.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
  }
  g.globalAlpha = 1;
  b.globalAlpha = 1;
  for (let i = 0; i < craters; i++) {
    const x = rnd() * w;
    const y = h * 0.08 + rnd() * h * 0.84;
    const r = 2 + Math.pow(rnd(), 2.6) * w * 0.022;
    const sq = 1 / Math.max(0.35, Math.sin((y / h) * Math.PI)); // undo the sphere's squeeze toward the poles
    for (const [ctx, floor, rim] of [
      [g, dark, light],
      [b, "#3a3a3a", "#d8d8d8"],
    ] as const) {
      const fl = ctx.createRadialGradient(x, y, 0, x, y, r);
      fl.addColorStop(0, floor);
      fl.addColorStop(0.75, floor);
      fl.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = ctx === g ? 0.55 : 0.9;
      ctx.fillStyle = fl;
      ctx.beginPath();
      ctx.ellipse(x, y, r * sq, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = ctx === g ? 0.5 : 0.9;
      ctx.strokeStyle = rim;
      ctx.lineWidth = Math.max(1, r * 0.18);
      ctx.beginPath();
      ctx.ellipse(x, y, r * sq, r, 0, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  return { map: tex(cc), bump: tex(bc, false) };
}

/** A banded gas giant in the poster's reds. */
export function gasGiant() {
  const [c, g] = canvas(512, 256);
  const bands = ["#a3291f", "#c9452f", "#e2734f", "#b8362a", "#f0a17c", "#8e241c", "#d55a3a", "#c03a2c"];
  for (let y = 0; y < 256; y++) {
    const k = Math.floor((y / 256) * bands.length * 2 + Math.sin(y * 0.11) * 1.4) % bands.length;
    g.fillStyle = bands[(k + bands.length) % bands.length];
    g.fillRect(0, y, 512, 1);
  }
  for (let i = 0; i < 900; i++) {
    g.globalAlpha = 0.08;
    g.fillStyle = rnd() > 0.5 ? "#ffd2b8" : "#5e140f";
    const y = rnd() * 256;
    g.fillRect(rnd() * 512, y, 20 + rnd() * 80, 1 + rnd() * 2);
  }
  g.globalAlpha = 0.5;
  g.fillStyle = "#f3b08c";
  g.beginPath();
  g.ellipse(330, 160, 34, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  return tex(c);
}

/** Concentric ring bands with gaps, for a RingGeometry's planar UVs. */
export function ringBands(inner: number, outer: number) {
  const [c, g] = canvas(512, 512);
  for (let r = inner * 256; r < outer * 256; r += 1) {
    const k = (r / 256 - inner) / (outer - inner);
    const a = 0.25 + 0.55 * Math.abs(Math.sin(k * 23)) * (k > 0.62 && k < 0.68 ? 0.1 : 1);
    g.strokeStyle = `rgba(241,228,200,${a.toFixed(3)})`;
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.stroke();
  }
  return tex(c);
}

/** The Milky Way: night blue, a soft band of light, and a dust of faint stars. */
export function milkyWay(narrow: boolean) {
  const w = narrow ? 1024 : 2048;
  const h = w / 2;
  const [c, g] = canvas(w, h);
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, "#070b22");
  grd.addColorStop(0.5, "#141f63");
  grd.addColorStop(1, "#070b22");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  g.save();
  g.translate(w / 2, h / 2);
  g.rotate(-0.38);
  for (let i = 0; i < 160; i++) {
    const x = (rnd() - 0.5) * w * 1.2;
    const y = (rnd() - 0.5) * h * 0.14 * (1 + rnd());
    const r = 20 + rnd() * w * 0.04;
    const b = g.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, `rgba(${170 + rnd() * 60},${160 + rnd() * 50},255,0.07)`);
    b.addColorStop(1, "rgba(120,110,220,0)");
    g.fillStyle = b;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.restore();
  for (let i = 0; i < w * 3; i++) {
    g.globalAlpha = 0.25 + rnd() * 0.6;
    g.fillStyle = rnd() > 0.85 ? "#ffe2c4" : "#dfe6ff";
    const s = rnd() > 0.97 ? 1.6 : 0.8;
    g.fillRect(rnd() * w, rnd() * h, s, s);
  }
  g.globalAlpha = 1;
  return tex(c);
}

/** White painted panels with seams, rivets and the name down one side. */
export function rocketSkin(name: string) {
  const [c, g] = canvas(512, 512);
  g.fillStyle = "#efede7";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(60,60,70,0.28)";
  g.lineWidth = 2;
  for (let y = 40; y < 512; y += 70) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
  }
  for (let x = 64; x < 512; x += 128) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 512);
    g.stroke();
  }
  g.fillStyle = "rgba(60,60,70,0.25)";
  for (let y = 40; y < 512; y += 70) for (let x = 6; x < 512; x += 12) g.fillRect(x, y + 6, 2, 2);
  g.save();
  // read bottom to top on the rocket's right flank, above the red band and clear of the porthole
  g.translate(76, 300);
  g.rotate(-Math.PI / 2);
  g.fillStyle = "#c8332a";
  g.font = '900 40px "Unbounded", sans-serif';
  g.fillText(name, 0, 0);
  g.restore();
  return tex(c);
}

/** Solar cells: dark blue squares on a silver grid. */
export function solarCells() {
  const [c, g] = canvas(256, 128);
  g.fillStyle = "#b8bcc6";
  g.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 16)
    for (let x = 0; x < 256; x += 16) {
      g.fillStyle = (x + y) % 32 ? "#16226a" : "#1c2b80";
      g.fillRect(x + 1.5, y + 1.5, 13, 13);
    }
  return tex(c);
}

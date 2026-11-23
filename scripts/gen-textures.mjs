/**
 * Procedural texture bakery.
 *
 * Everything here is drawn with @napi-rs/canvas — no photographs, no AI
 * generation — so each plate is deterministic and can be rebuilt from source.
 * Heavy atmospheric work (nebulae, caustics, frost) is baked once and then
 * animated at runtime with cheap transforms, which keeps the 2K render fast.
 *
 *   node scripts/gen-textures.mjs
 */
import { createCanvas } from "@napi-rs/canvas";
import fs from "node:fs";
import path from "node:path";

const W = 1440;
const H = 2560;
const OUT = "public/tex";

/** Deterministic PRNG so the plates never change between runs. */
const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const save = (canvas, name) => {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, name);
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  console.log(`  ${name} ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
};

/* ------------------------------------------------------------------ */
/* Deep-space nebula with a star field                                 */
/* ------------------------------------------------------------------ */
const nebula = () => {
  const c = createCanvas(W, H);
  const x = c.getContext("2d");
  const r = rng(7);

  const base = x.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#04070C");
  base.addColorStop(0.42, "#061420");
  base.addColorStop(0.72, "#040C14");
  base.addColorStop(1, "#020407");
  x.fillStyle = base;
  x.fillRect(0, 0, W, H);

  // soft gas clouds
  const clouds = [
    [300, 620, 900, "rgba(34,104,140,0.40)"],
    [1180, 380, 760, "rgba(20,70,112,0.44)"],
    [760, 1500, 1100, "rgba(12,52,84,0.40)"],
    [180, 1900, 820, "rgba(24,72,92,0.22)"],
    [1240, 2180, 700, "rgba(12,52,80,0.26)"],
    [980, 980, 520, "rgba(120,70,30,0.10)"],
  ];
  for (const [cx, cy, rad, color] of clouds) {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, color);
    g.addColorStop(0.55, color.replace(/[\d.]+\)$/, "0.10)"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }

  // star field — three brightness tiers
  const star = (n, sizeMin, sizeMax, aMin, aMax) => {
    for (let i = 0; i < n; i++) {
      const sx = r() * W;
      const sy = r() * H;
      const rad = sizeMin + r() * (sizeMax - sizeMin);
      const a = aMin + r() * (aMax - aMin);
      x.beginPath();
      x.arc(sx, sy, rad, 0, Math.PI * 2);
      x.fillStyle = `rgba(226,240,255,${a})`;
      x.fill();
      if (rad > 2.2) {
        const g = x.createRadialGradient(sx, sy, 0, sx, sy, rad * 7);
        g.addColorStop(0, `rgba(190,225,255,${a * 0.5})`);
        g.addColorStop(1, "rgba(190,225,255,0)");
        x.fillStyle = g;
        x.fillRect(sx - rad * 7, sy - rad * 7, rad * 14, rad * 14);
      }
    }
  };
  star(1500, 0.5, 1.2, 0.12, 0.4);
  star(420, 1.2, 2.2, 0.3, 0.75);
  star(70, 2.2, 3.6, 0.5, 0.95);

  // diffraction spikes on the brightest stars
  for (let i = 0; i < 16; i++) {
    const sx = r() * W;
    const sy = r() * H;
    const len = 18 + r() * 46;
    x.save();
    x.globalCompositeOperation = "lighter";
    const g = x.createLinearGradient(sx - len, sy, sx + len, sy);
    g.addColorStop(0, "rgba(180,220,255,0)");
    g.addColorStop(0.5, "rgba(220,240,255,0.55)");
    g.addColorStop(1, "rgba(180,220,255,0)");
    x.fillStyle = g;
    x.fillRect(sx - len, sy - 0.8, len * 2, 1.6);
    x.fillRect(sx - 0.8, sy - len, 1.6, len * 2);
    x.restore();
  }
  return c;
};

/* ------------------------------------------------------------------ */
/* Transparent star layer for parallax                                 */
/* ------------------------------------------------------------------ */
const stars = () => {
  const c = createCanvas(W, H);
  const x = c.getContext("2d");
  const r = rng(23);
  for (let i = 0; i < 700; i++) {
    const sx = r() * W;
    const sy = r() * H;
    const rad = 0.6 + r() * 2.6;
    const a = 0.15 + r() * 0.85;
    x.beginPath();
    x.arc(sx, sy, rad, 0, Math.PI * 2);
    x.fillStyle = `rgba(235,245,255,${a})`;
    x.fill();
  }
  return c;
};

/* ------------------------------------------------------------------ */
/* Open-ocean night: swell, moon path, light shafts                    */
/* ------------------------------------------------------------------ */
const water = () => {
  const c = createCanvas(W, H);
  const x = c.getContext("2d");
  const r = rng(41);

  const base = x.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#03080D");
  base.addColorStop(0.35, "#04141C");
  base.addColorStop(0.62, "#052430");
  base.addColorStop(1, "#020A10");
  x.fillStyle = base;
  x.fillRect(0, 0, W, H);

  // moon glow
  const mg = x.createRadialGradient(880, 420, 0, 880, 420, 620);
  mg.addColorStop(0, "rgba(190,225,240,0.20)");
  mg.addColorStop(0.45, "rgba(120,170,200,0.07)");
  mg.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = mg;
  x.fillRect(0, 0, W, H);

  // swell lines
  for (let i = 0; i < 90; i++) {
    const y = 900 + i * 18 + r() * 8;
    const amp = 6 + r() * 16;
    x.beginPath();
    for (let px = -40; px <= W + 40; px += 24) {
      const py = y + Math.sin(px * 0.006 + i * 0.7) * amp;
      px === -40 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.strokeStyle = `rgba(150,205,225,${0.02 + r() * 0.05})`;
    x.lineWidth = 1 + r() * 2;
    x.stroke();
  }

  // light shafts from the surface — built from stacked soft ellipses so the
  // edges never band like hard polygons
  x.save();
  x.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) {
    const sx = r() * W;
    const w = 60 + r() * 150;
    const drift = (r() - 0.5) * 220;
    const steps = 26;
    for (let k = 0; k < steps; k++) {
      const t = k / (steps - 1);
      const px = sx + drift * t;
      const py = t * H * 0.86;
      const rw = w * (0.5 + t * 1.5);
      const rh = 70 + t * 150;
      const a = (0.055 + r() * 0.02) * (1 - t * 0.85);
      const g = x.createRadialGradient(px, py, 0, px, py, rw);
      g.addColorStop(0, `rgba(170,220,240,${a})`);
      g.addColorStop(0.5, `rgba(150,205,230,${a * 0.45})`);
      g.addColorStop(1, "rgba(150,205,230,0)");
      x.save();
      x.translate(px, py);
      x.scale(1, rh / rw);
      x.translate(-px, -py);
      x.fillStyle = g;
      x.beginPath();
      x.arc(px, py, rw, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }
  }
  // caustic shimmer just under the surface
  for (let i = 0; i < 40; i++) {
    const y0 = 40 + r() * 420;
    x.beginPath();
    for (let px = -40; px <= W + 40; px += 18) {
      const py = y0 + Math.sin(px * 0.011 + i * 1.3) * (10 + r() * 10);
      px === -40 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.strokeStyle = `rgba(200,240,255,${0.02 + r() * 0.035})`;
    x.lineWidth = 1 + r() * 1.6;
    x.stroke();
  }
  x.restore();

  // suspended particles
  for (let i = 0; i < 900; i++) {
    x.beginPath();
    x.arc(r() * W, 700 + r() * (H - 700), 0.6 + r() * 1.8, 0, Math.PI * 2);
    x.fillStyle = `rgba(180,225,240,${0.05 + r() * 0.22})`;
    x.fill();
  }
  return c;
};

/* ------------------------------------------------------------------ */
/* Antarctic ice shelf: faceted slabs + frost                          */
/* ------------------------------------------------------------------ */
const ice = () => {
  const c = createCanvas(W, H);
  const x = c.getContext("2d");
  const r = rng(97);

  const base = x.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#0A1820");
  base.addColorStop(0.5, "#12303C");
  base.addColorStop(1, "#081218");
  x.fillStyle = base;
  x.fillRect(0, 0, W, H);

  // crystalline facets
  for (let i = 0; i < 46; i++) {
    const cx = r() * W;
    const cy = r() * H;
    const rad = 120 + r() * 420;
    const sides = 3 + Math.floor(r() * 3);
    x.beginPath();
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2 + r() * 0.6;
      const px = cx + Math.cos(a) * rad * (0.5 + r() * 0.6);
      const py = cy + Math.sin(a) * rad * (0.5 + r() * 0.6);
      k === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.closePath();
    const g = x.createLinearGradient(cx - rad, cy - rad, cx + rad, cy + rad);
    g.addColorStop(0, `rgba(150,215,235,${0.03 + r() * 0.05})`);
    g.addColorStop(1, `rgba(60,120,150,${0.02 + r() * 0.04})`);
    x.fillStyle = g;
    x.fill();
    x.strokeStyle = `rgba(200,240,255,${0.04 + r() * 0.08})`;
    x.lineWidth = 1;
    x.stroke();
  }

  // frost speckle
  for (let i = 0; i < 2400; i++) {
    x.beginPath();
    x.arc(r() * W, r() * H, 0.5 + r() * 1.6, 0, Math.PI * 2);
    x.fillStyle = `rgba(225,248,255,${0.03 + r() * 0.16})`;
    x.fill();
  }
  return c;
};

/* ------------------------------------------------------------------ */
/* Deep-drift gradient used behind cards                               */
/* ------------------------------------------------------------------ */
const haze = () => {
  const c = createCanvas(W, H);
  const x = c.getContext("2d");
  const g = x.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.42, 1300);
  g.addColorStop(0, "rgba(90,170,200,0.20)");
  g.addColorStop(0.4, "rgba(30,90,130,0.10)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  return c;
};

console.log("baking textures");
save(nebula(), "nebula.png");
save(stars(), "stars.png");
save(water(), "water.png");
save(ice(), "ice.png");
save(haze(), "haze.png");

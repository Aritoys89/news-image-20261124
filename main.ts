// The World on Tuesday 24 November 2026 — one-image news summary.
// Renders a newspaper front page entirely in code: a pixel buffer,
// hand-drawn pictograms and a 5x7 bitmap font defined below.
// Standard library only. Fully deterministic: no Date, no Math.random.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const W = 1024;
const H = 1024;

// ---------- palette ----------
type RGB = [number, number, number];
const PAPER: RGB = [246, 241, 230];
const INK: RGB = [22, 22, 22];
const RED: RGB = [178, 30, 30];
const BLUE: RGB = [30, 58, 110];
const TEAL: RGB = [14, 110, 100];
const GOLD: RGB = [196, 138, 20];
const GREY: RGB = [110, 105, 95];
const WHITE: RGB = [255, 255, 255];
const PANEL: RGB = [255, 253, 246];
const SKIN: RGB = [240, 200, 160];

// ---------- pixel buffer ----------
const buf = new Uint8Array(W * H * 3);
function setPx(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) setPx(xx, yy, c);
}
function circle(cx: number, cy: number, r: number, c: RGB): void {
  for (let yy = cy - r; yy <= cy + r; yy++) for (let xx = cx - r; xx <= cx + r; xx++) {
    const dx = xx - cx, dy = yy - cy;
    if (dx * dx + dy * dy <= r * r) setPx(xx, yy, c);
  }
}
function ring(cx: number, cy: number, r: number, t: number, c: RGB): void {
  for (let yy = cy - r - t; yy <= cy + r + t; yy++) for (let xx = cx - r - t; xx <= cx + r + t; xx++) {
    const d = Math.sqrt((xx - cx) * (xx - cx) + (yy - cy) * (yy - cy));
    if (d >= r - t && d <= r + t) setPx(xx, yy, c);
  }
}
function line(x0: number, y0: number, x1: number, y1: number, t: number, c: RGB): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + (x1 - x0) * s / steps);
    const y = Math.round(y0 + (y1 - y0) * s / steps);
    rect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
  }
}
function tri(cx: number, topY: number, halfW: number, height: number, c: RGB): void {
  for (let r = 0; r < height; r++) {
    const hw = Math.round(halfW * r / Math.max(height - 1, 1));
    rect(cx - hw, topY + r, hw * 2 + 1, 1, c);
  }
}

// ---------- 5x7 bitmap font ----------
const GLYPHS: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  "'": [".##..", ".##..", ".#...", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "(": ["...##", "..#..", ".#...", ".#...", ".#...", "..#..", "...##"],
  ")": ["##...", "..#..", "...#.", "...#.", "...#.", "..#..", "##..."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "%": ["##..#", "##.#.", "....#", "...#.", "..#..", ".#...", "#..##"],
};

function textWidth(s: string, scale: number): number {
  return s.length === 0 ? 0 : s.length * 6 * scale - scale;
}
function drawText(x: number, y: number, s: string, scale: number, c: RGB): void {
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const g = GLYPHS[ch] || GLYPHS["?"];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
      if (g[r][col] === "#") rect(cx + col * scale, y + r * scale, scale, scale, c);
    }
    cx += 6 * scale;
  }
}
function drawCentered(cx: number, y: number, s: string, scale: number, c: RGB): void {
  drawText(Math.round(cx - textWidth(s, scale) / 2), y, s, scale, c);
}
// Word-wrap into lines that fit maxW at the given scale; returns lines drawn count.
function drawWrapped(x: number, y: number, s: string, scale: number, maxW: number, c: RGB, lineGap: number): number {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur === "" ? w : cur + " " + w;
    if (textWidth(trial, scale) <= maxW || cur === "") cur = trial;
    else { lines.push(cur); cur = w; }
  }
  if (cur !== "") lines.push(cur);
  lines.forEach((ln, i) => drawText(x, y + i * (7 * scale + lineGap), ln, scale, c));
  return lines.length;
}

// ---------- pictograms (drawn in a box, origin top-left) ----------
function iconExplosion(x: number, y: number, s: number): void {
  circle(x + s / 2, y + s / 2, Math.round(s * 0.20), RED);
  circle(x + s / 2, y + s / 2, Math.round(s * 0.11), GOLD);
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4;
    line(x + s / 2 + Math.cos(a) * s * 0.26, y + s / 2 + Math.sin(a) * s * 0.26,
         x + s / 2 + Math.cos(a) * s * 0.46, y + s / 2 + Math.sin(a) * s * 0.46, 5, RED);
  }
}
function iconBuilding(x: number, y: number, s: number): void {
  rect(x + s * 0.18, y + s * 0.18, s * 0.30, s * 0.68, INK);
  rect(x + s * 0.54, y + s * 0.36, s * 0.28, s * 0.50, GREY);
  for (let r = 0; r < 4; r++) for (let cI = 0; cI < 2; cI++)
    rect(x + s * 0.24 + cI * s * 0.13, y + s * 0.27 + r * s * 0.15, s * 0.07, s * 0.08, GOLD);
  rect(x + s * 0.10, y + s * 0.86, s * 0.80, s * 0.05, INK);
}
function iconShip(x: number, y: number, s: number): void {
  // tanker: hull, deck tanks, bridge, flame, waves
  rect(x + s * 0.10, y + s * 0.52, s * 0.80, s * 0.10, INK);
  tri(x + s * 0.90, y + Math.round(s * 0.52), Math.round(s * 0.10), Math.round(s * 0.10), INK);
  rect(x + s * 0.16, y + s * 0.42, s * 0.44, s * 0.10, RED);
  rect(x + s * 0.68, y + s * 0.30, s * 0.12, s * 0.22, INK);
  circle(x + Math.round(s * 0.38), y + Math.round(s * 0.28), Math.round(s * 0.10), RED);
  circle(x + Math.round(s * 0.38), y + Math.round(s * 0.30), Math.round(s * 0.055), GOLD);
  line(x + s * 0.06, y + s * 0.78, x + s * 0.30, y + s * 0.78, 5, BLUE);
  line(x + s * 0.40, y + s * 0.86, x + s * 0.66, y + s * 0.86, 5, BLUE);
  line(x + s * 0.70, y + s * 0.76, x + s * 0.94, y + s * 0.76, 5, BLUE);
}
function iconChip(x: number, y: number, s: number): void {
  rect(x + s * 0.26, y + s * 0.26, s * 0.48, s * 0.48, TEAL);
  rect(x + s * 0.40, y + s * 0.40, s * 0.20, s * 0.20, PAPER);
  for (let i = 0; i < 3; i++) {
    const p = s * (0.32 + i * 0.18);
    rect(x + p, y + s * 0.10, s * 0.07, s * 0.16, INK);
    rect(x + p, y + s * 0.74, s * 0.07, s * 0.16, INK);
    rect(x + s * 0.10, y + p, s * 0.16, s * 0.07, INK);
    rect(x + s * 0.74, y + p, s * 0.16, s * 0.07, INK);
  }
  // small person silhouette returning (arrow up)
  line(x + s * 0.50, y + s * 0.06, x + s * 0.50, y - s * 0.0 + 2, 1, PAPER);
}
function iconGavel(x: number, y: number, s: number): void {
  line(x + s * 0.30, y + s * 0.62, x + s * 0.66, y + s * 0.26, 9, INK);
  rect(x + s * 0.58, y + s * 0.10, s * 0.30, s * 0.14, GOLD);
  rect(x + s * 0.64, y + s * 0.24, s * 0.18, s * 0.10, GOLD);
  rect(x + s * 0.14, y + s * 0.82, s * 0.62, s * 0.07, INK);
  rect(x + s * 0.22, y + s * 0.74, s * 0.46, s * 0.05, GREY);
}
function iconCross(x: number, y: number, s: number): void {
  circle(x + s / 2, y + s / 2, Math.round(s * 0.42), RED);
  rect(x + s * 0.42, y + s * 0.26, s * 0.16, s * 0.48, WHITE);
  rect(x + s * 0.26, y + s * 0.42, s * 0.48, s * 0.16, WHITE);
}
function iconScreen(x: number, y: number, s: number): void {
  rect(x + s * 0.12, y + s * 0.14, s * 0.76, s * 0.56, BLUE);
  rect(x + s * 0.19, y + s * 0.21, s * 0.62, s * 0.42, PAPER);
  circle(x + Math.round(s * 0.34), y + Math.round(s * 0.42), Math.round(s * 0.05), RED);
  circle(x + Math.round(s * 0.58), y + Math.round(s * 0.34), Math.round(s * 0.05), BLUE);
  circle(x + Math.round(s * 0.68), y + Math.round(s * 0.50), Math.round(s * 0.05), TEAL);
  line(x + s * 0.26, y + s * 0.54, x + s * 0.46, y + s * 0.38, 4, INK);
  line(x + s * 0.46, y + s * 0.38, x + s * 0.74, y + s * 0.30, 4, INK);
  rect(x + s * 0.44, y + s * 0.70, s * 0.12, s * 0.10, INK);
  rect(x + s * 0.30, y + s * 0.82, s * 0.40, s * 0.05, INK);
}
function iconBall(x: number, y: number, s: number): void {
  ring(x + s / 2, y + s / 2, Math.round(s * 0.36), 4, INK);
  circle(x + s / 2, y + s / 2, Math.round(s * 0.13), INK);
  for (let k = 0; k < 5; k++) {
    const a = k * Math.PI * 2 / 5 - Math.PI / 2;
    line(x + s / 2 + Math.cos(a) * s * 0.14, y + s / 2 + Math.sin(a) * s * 0.14,
         x + s / 2 + Math.cos(a) * s * 0.34, y + s / 2 + Math.sin(a) * s * 0.34, 4, INK);
  }
}
function iconPerson(x: number, y: number, s: number): void {
  circle(x + s / 2, y + Math.round(s * 0.26), Math.round(s * 0.15), INK);
  rect(x + s * 0.32, y + s * 0.44, s * 0.36, s * 0.34, BLUE);
  line(x + s * 0.38, y + s * 0.78, x + s * 0.34, y + s * 0.96, 7, INK);
  line(x + s * 0.62, y + s * 0.78, x + s * 0.66, y + s * 0.96, 7, INK);
  // upward arrow beside head: shares jump
  line(x + s * 0.82, y + s * 0.52, x + s * 0.82, y + s * 0.16, 6, TEAL);
  line(x + s * 0.82, y + s * 0.16, x + s * 0.70, y + s * 0.30, 6, TEAL);
  line(x + s * 0.82, y + s * 0.16, x + s * 0.94, y + s * 0.30, 6, TEAL);
}

// ---------- compose ----------
rect(0, 0, W, H, PAPER);
// outer frame
rect(14, 14, W - 28, 6, INK); rect(14, H - 20, W - 28, 6, INK);
rect(14, 14, 6, H - 28, INK); rect(W - 20, 14, 6, H - 28, INK);

// masthead
drawCentered(W / 2, 34, "THE WORLD IN ONE DAY", 4, RED);
rect(120, 82, W - 240, 4, INK);
drawCentered(W / 2, 96, "TUESDAY 24 NOVEMBER 2026", 6, INK);
rect(60, 152, W - 120, 6, INK);

// lead story panel
const leadY = 172;
rect(36, leadY, W - 72, 190, PANEL);
rect(36, leadY, W - 72, 5, RED); rect(36, leadY + 185, W - 72, 5, RED);
rect(36, leadY, 5, 190, RED); rect(W - 41, leadY, 5, 190, RED);
drawText(58, leadY + 16, "LEAD STORY - GAZA", 3, RED);
iconExplosion(58, leadY + 58, 100);
drawWrapped(196, leadY + 54, "ISRAELI STRIKE KILLS HAMAS SECURITY CHIEF", 5, 770, INK, 8);
drawText(196, leadY + 150, "ABU NAHEL + 6 OTHERS DEAD, INCL 2 POLICE", 3, GREY);

// grid panels: 2 rows x 3 cols
type Story = { tag: string; head: string; sub: string; icon: (x: number, y: number, s: number) => void; accent: RGB };
const stories: Story[] = [
  { tag: "UKRAINE WAR", head: "RUSSIA WAR DEAD TOP 700000", sub: "ZAPORIZHZHIA STRIKE: 2 DEAD, 48 HURT", icon: iconBuilding, accent: BLUE },
  { tag: "HORMUZ", head: "TANKERS HIT MINES, CATCH FIRE", sub: "IRAN CLAIMS. NOT VERIFIED", icon: iconShip, accent: RED },
  { tag: "TECH", head: "HUANG BACK AS NVIDIA CEO", sub: "RETURNS 11 DAYS AFTER QUITTING", icon: iconPerson, accent: TEAL },
  { tag: "US COURT", head: "HUAWEI STOLE US SECRETS", sub: "CONVICTED ON 10 OF 12", icon: iconGavel, accent: GOLD },
  { tag: "DR CONGO", head: "FIGHTING TRAPS EBOLA TEAM", sub: "WHO STAFF IN HOSPITAL", icon: iconCross, accent: RED },
  { tag: "EUROPE", head: "GERMANY FIRST TO GET DELTA", sub: "UKRAINE BATTLE SYSTEM DEAL", icon: iconScreen, accent: BLUE },
];
const gx = 36, gy = 378, gw = 304, gh = 257, gap = 16;
stories.forEach((st, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const px = gx + col * (gw + gap), py = gy + row * (gh + gap);
  rect(px, py, gw, gh, PANEL);
  rect(px, py, gw, 5, st.accent); rect(px, py + gh - 5, gw, 5, st.accent);
  rect(px, py, 5, gh, st.accent); rect(px + gw - 5, py, 5, gh, st.accent);
  drawText(px + 16, py + 14, st.tag, 3, st.accent);
  st.icon(px + gw - 56, py + 6, 40);
  drawWrapped(px + 16, py + 56, st.head, 4, gw - 32, INK, 6);
  drawWrapped(px + 16, py + 176, st.sub, 3, gw - 32, GREY, 4);
});

// football strip
const fy = 924;
rect(36, fy, W - 72, 70, INK);
iconBall(52, fy + 9, 52);
drawText(124, fy + 10, "SPORT: REAL MADRID 5-1 PSV, CHAMPIONS LEAGUE", 3, WHITE);
drawText(124, fy + 40, "BELLINGHAM STUNNER. MBAPPE 2. CITY HELD 2-2.", 3, GOLD);

// ---------- PNG encode (deterministic) ----------
const raw = new Uint8Array((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  raw.set(buf.subarray(y * W * 3, (y + 1) * W * 3), y * (W * 3 + 1) + 1);
}
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcData = new Uint8Array(4 + data.length);
  crcData.set(out.subarray(4, 8), 0); crcData.set(data, 4);
  dv.setUint32(8 + data.length, crc32(crcData));
  return out;
}
const ihdr = new Uint8Array(13);
{
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W); dv.setUint32(4, H);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
}
const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const idat = deflateSync(raw, { level: 9 });
const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array(0))];
const total = parts.reduce((a, p) => a + p.length, 0);
const png = new Uint8Array(total);
let off = 0;
for (const p of parts) { png.set(p, off); off += p.length; }

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), png);
console.log("wrote", join(outDir, "entry.png"), png.length, "bytes");

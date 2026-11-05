// Exportiert die App- und Home-Bildschirm-Symbole der Tools aus public/tools/<name>/icons/icon.svg als PNG.
// Gerendert wird mit dem lokal installierten Chrome oder Edge über das DevTools-Protokoll (Node 24 hat
// WebSocket eingebaut): keine npm-Abhängigkeit. Pfad zum Browser bei Bedarf mit CHROME=... angeben.
// Start: node _skripte/icons.mjs
//
// Ausgaben je Tool:
//   apple-touch-icon.png   180×180, randlos, ohne Transparenz (RGB ohne Alphakanal), iOS rundet selbst
//   icon-192/512.png       nur Tools mit Manifest: runde Ecken, transparent aussen (purpose "any")
//   icon-maskable-192/512  nur Tools mit Manifest: randlos (purpose "maskable")
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = {
  einheiten: { manifest: true },
  querschnittswerte: {},
  balken: {},
  biegebemessung: {},
  lastkombinationen: {}
};
const BG = [0x0f, 0x2a, 0x4a]; // Hintergrund der Symbole (#0f2a4a)
const RADIUS = 96 / 512;        // Eckenradius der "any"-Icons

const CANDIDATES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);
const browser = CANDIDATES.find(p => fs.existsSync(p));
if (!browser) {
  console.error('Kein Chrome oder Edge gefunden. Pfad mit CHROME=... angeben.');
  process.exit(1);
}

// ---------- Browser über das DevTools-Protokoll steuern ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'icons-'));
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
let targets;
for (let i = 0; i < 100 && !targets; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch { await sleep(100); }
}
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let nextId = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m.method);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, m => (m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
await send('Page.enable');

/** SVG in size×size Pixel rendern; rounded: runde Ecken mit transparentem Rand */
async function render(svg, size, rounded) {
  await send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  const img = `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}"`
    + ` style="display:block;${rounded ? `border-radius:${(RADIUS * size).toFixed(2)}px;` : ''}">`;
  events.length = 0;
  await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(`<!doctype html><html><body style="margin:0;background:transparent">${img}</body></html>`).toString('base64') });
  for (let i = 0; i < 50 && !events.includes('Page.loadEventFired'); i++) await sleep(50);
  await sleep(100); // Schrift fertig setzen
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
  return Buffer.from(shot.data, 'base64');
}

// ---------- PNG ohne Alphakanal schreiben (für iOS) ----------
function decodePng(buf) {
  let pos = 8;
  let w = 0, h = 0, type = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const name = buf.toString('latin1', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (name === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9];
      if (data[8] !== 8 || data[12] !== 0 || (type !== 6 && type !== 2)) throw new Error('PNG-Format nicht unterstützt');
    } else if (name === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
      out[y * stride + x] = (line[x] + pred) & 255;
    }
  }
  return { w, h, bpp, px: out };
}
function chunk(name, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(name, 'latin1'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([len, body, crc]);
}
/** RGB-PNG ohne Alphakanal; halbtransparente Pixel werden auf den Hintergrund gelegt */
function toOpaqueRgb(png) {
  const { w, h, bpp, px } = decodePng(png);
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * bpp;
      const al = bpp === 4 ? px[i + 3] / 255 : 1;
      for (let k = 0; k < 3; k++) raw[y * (w * 3 + 1) + 1 + x * 3 + k] = Math.round(px[i + k] * al + BG[k] * (1 - al));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- Export ----------
try {
  for (const [tool, opt] of Object.entries(TOOLS)) {
    const dir = path.join(ROOT, 'public', 'tools', tool, 'icons');
    const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
    const files = [['apple-touch-icon.png', toOpaqueRgb(await render(svg, 180, false))]];
    if (opt.manifest) {
      for (const size of [192, 512]) {
        files.push([`icon-${size}.png`, await render(svg, size, true)]);
        files.push([`icon-maskable-${size}.png`, toOpaqueRgb(await render(svg, size, false))]);
      }
    }
    for (const [name, data] of files) {
      fs.writeFileSync(path.join(dir, name), data);
      console.log('geschrieben: ' + path.relative(ROOT, path.join(dir, name)).replace(/\\/g, '/') + ' (' + data.length + ' Bytes)');
    }
  }
} finally {
  ws.close();
  proc.kill();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
}

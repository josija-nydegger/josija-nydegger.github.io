// Querschnittswerte-Tool: Rechenkern (window.__qs.compute) gegen geschlossene Formeln und eine numerische Integration.
// Start: node _tests/querschnittswerte.test.js   (braucht einmalig "npm install" im Ordner _tests)
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const file = process.argv[2] || path.join(__dirname, '..', 'public', 'tools', 'querschnittswerte', 'index.html');
const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', url: 'https://josija-nydegger.ch/tools/querschnittswerte/' });
const { compute, SHAPES } = dom.window.__qs;

let fails = 0;
const chk = (name, got, exp, tol = 1e-6) => {
  const ok = Math.abs(got - exp) <= tol * Math.max(1, Math.abs(exp));
  if (!ok) fails++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + (+got.toPrecision(7)) + ' (soll ' + (+exp.toPrecision(7)) + ')');
};
const run = (k, p) => compute(SHAPES[k].build(p));

// Standardquerschnitte gegen geschlossene Formeln
let r = run('rect', { b: 200, h: 400 });
chk('Rechteck Iy = b·h³/12', r.Iy, 200 * 400 ** 3 / 12);
chk('Rechteck Wpl,y = b·h²/4', r.ply.W, 200 * 400 ** 2 / 4);
chk('Rechteck Wpl,z = h·b²/4', r.plz.W, 400 * 200 ** 2 / 4);

r = run('circle', { D: 300 });
chk('Kreis I = π·D⁴/64', r.Iy, Math.PI * 300 ** 4 / 64);
chk('Kreis Wpl = D³/6', r.ply.W, 300 ** 3 / 6, 1e-5);

r = run('tube', { D: 168.3, t: 8 });
const d = 168.3 - 16;
chk('Kreisrohr I', r.Iy, Math.PI * (168.3 ** 4 - d ** 4) / 64);
chk('Kreisrohr Wpl = (D³ − d³)/6', r.ply.W, (168.3 ** 3 - d ** 3) / 6, 1e-5);

r = run('rhs', { b: 200, h: 300, t: 10 });
chk('Rechteckrohr Wpl,y', r.ply.W, (200 * 300 ** 2 - 180 * 280 ** 2) / 4);

r = run('ibeam', { b: 200, h: 400, tw: 8.6, tf: 13.5 });
chk('I-Profil Iy', r.Iy, (200 * 400 ** 3 - (200 - 8.6) * (400 - 27) ** 3) / 12);
chk('I-Profil Wpl,y', r.ply.W, 200 * 13.5 * (400 - 13.5) + 8.6 * (400 - 27) ** 2 / 4);
chk('I-Profil Wpl,z', r.plz.W, 13.5 * 200 ** 2 / 2 + (400 - 27) * 8.6 ** 2 / 4);

// T-Profil: plastische Nulllinie im Flansch
r = run('tbeam', { b: 1000, h: 600, tw: 300, tf: 200 });
const A = 1000 * 200 + 300 * 400, zpl = 600 - (A / 2) / 1000;
chk('T-Profil Fläche', r.A, A);
chk('T-Profil z_s', r.zs, (1000 * 200 * 500 + 300 * 400 * 200) / A);
chk('T-Profil z_pl im Flansch', r.ply.t, zpl);
chk('T-Profil Wpl,y', r.ply.W, 1000 * (600 - zpl) ** 2 / 2 + 1000 * (zpl - 400) ** 2 / 2 + 300 * 400 * (zpl - 200));

// Winkel L 100×10 ohne Radius: Schwerpunkt, Hauptachse 45°
r = run('angle', { h: 100, b: 100, t: 10 });
chk('Winkel y_s', r.ys, (10 * 100 * 5 + 90 * 10 * 55) / 1900);
chk('Winkel z_s', r.zs, (10 * 100 * 50 + 90 * 10 * 5) / 1900);
chk('Winkel α = 45°', r.alpha * 180 / Math.PI, 45);
chk('Winkel I1 + I2 = Iy + Iz', r.I1 + r.I2, r.Iy + r.Iz);

// Zusammengesetzt mit Aussparung = Rechteckrohr
r = compute([{ t: 'r', b: 200, h: 300, y: 0, z: 0, s: 1, name: 'a' }, { t: 'r', b: 180, h: 280, y: 0, z: 0, s: -1, name: 'b' }]);
const q = run('rhs', { b: 200, h: 300, t: 10 });
chk('Aussparung: Iy wie Rechteckrohr', r.Iy, q.Iy);
chk('Aussparung: Wpl,y wie Rechteckrohr', r.ply.W, q.ply.W);

// Kreis mit exzentrischer Kreis-Aussparung: gegen numerische Integration in dünnen Streifen
r = compute([{ t: 'c', d: 400, y: 0, z: 0, s: 1, name: 'a' }, { t: 'c', d: 100, y: 0, z: 80, s: -1, name: 'b' }]);
const N = 20000, rows = [];
for (let i = 0; i < N; i++) {
  const z = -200 + 400 * (i + 0.5) / N;
  const w = 2 * Math.sqrt(Math.max(0, 200 * 200 - z * z)) - 2 * Math.sqrt(Math.max(0, 50 * 50 - (z - 80) ** 2));
  rows.push([z, w * 400 / N]);
}
const At = rows.reduce((s, x) => s + x[1], 0);
let acc = 0, zp = 0;
for (let i = N - 1; i >= 0; i--) { acc += rows[i][1]; if (acc >= At / 2) { zp = rows[i][0]; break; } }
const Wn = rows.reduce((s, [z, a]) => s + Math.abs(z - zp) * a, 0);
chk('Kreis mit Loch: Fläche', r.A, At, 1e-4);
chk('Kreis mit Loch: z_pl', r.ply.t, zp, 1e-3);
chk('Kreis mit Loch: Wpl,y', r.ply.W, Wn, 1e-4);

console.log(fails ? fails + ' FEHLER' : 'Alle Tests bestanden');
process.exitCode = fails ? 1 : 0;

// Lastkombinationen-Tool: Rechenkern compute() gegen Handrechnungen nach SIA 260:2013.
// Ohne Abhängigkeiten: liest den Block zwischen /*CALC-START*/ und /*CALC-END*/ aus der HTML-Datei.
// Start: node _tests/lastkombinationen.test.mjs [pfad/zur/index.html]
//
// Formel Tragsicherheit SIA 260:2013, 4.4.3.4, Gl. (16): γG·Gk + γQ1·Qk1 + ψ0i·Qki (Begleiter ohne γQ).
// Normwerte (SIA 260:2013): Tabelle 1, Typ 2: γG,sup = 1.35, γG,inf = 0.80, γQ = 1.50.
// Anhang A, Tabelle 2: Kat. A ψ = 0.7/0.5/0.3; Kat. E ψ = 1.0/0.9/0.8; Wind ψ = 0.6/0.5/0;
// Schnee ψ0 = 1 − 60/h0, ψ1 = 1 − 250/h0, ψ2 = 1 − 1000/h0.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || path.join(here, '..', 'public', 'tools', 'lastkombinationen', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const m = /\/\*CALC-START\*\/([\s\S]*?)\/\*CALC-END\*\//.exec(html);
if (!m) { console.log('FEHLER: CALC-START/CALC-END nicht gefunden'); process.exit(1); }
const { compute, snowLoad, SNOW, GAMMA, QTYPES } = new Function(m[1] + '\nreturn { compute, snowLoad, SNOW, GAMMA, QTYPES };')();

let fails = 0;
const chk = (name, got, exp, tol = 1e-9) => {
  const ok = typeof got === 'number' && Math.abs(got - exp) <= tol * Math.max(1, Math.abs(exp));
  if (!ok) fails++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + (typeof got === 'number' ? +got.toPrecision(7) : got) + ' (soll ' + exp + ')');
};
const yes = (name, cond) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name); };
const G = (value, o) => Object.assign({ name: 'G', kind: 'G', value, unit: 'kN/m2', fav: false }, o);
const Q = (value, type, o) => Object.assign({ name: 'Q ' + type, kind: 'Q', value, unit: 'kN/m2', type, fav: false }, o);

// ---------- Normwerte im Code ----------
chk('γG,sup (Tabelle 1, Typ 2)', GAMMA.G_sup, 1.35);
chk('γG,inf (Tabelle 1, Typ 2)', GAMMA.G_inf, 0.80);
chk('γQ (Tabelle 1, Typ 2)', GAMMA.Q, 1.50);
yes('ψ Kat. B = 0.7/0.5/0.3 (Tabelle 2)', QTYPES.B.psi.join() === '0.7,0.5,0.3');
yes('ψ Kat. C = 0.7/0.7/0.6 (Tabelle 2)', QTYPES.C.psi.join() === '0.7,0.7,0.6');
yes('ψ Kat. E = 1/0.9/0.8 (Tabelle 2)', QTYPES.E.psi.join() === '1,0.9,0.8');
yes('ψ Kat. G = 0.7/0.5/0.3 (Tabelle 2)', QTYPES.G.psi.join() === '0.7,0.5,0.3');
yes('ψ Kat. H = 0/0/0 (Tabelle 2)', QTYPES.H.psi.join() === '0,0,0');
yes('ψ Temperatur = 0.6/0.5/0 (Tabelle 2)', QTYPES.temp.psi.join() === '0.6,0.5,0');

// ---------- 1) Nur ständige Lasten ----------
// G1 = 5.0, G2 = 1.5 kN/m², beide ungünstig.
// q_d = 1.35·5.0 + 1.35·1.5 = 6.75 + 2.025 = 8.775 kN/m²
// selten = häufig = quasi-ständig = 5.0 + 1.5 = 6.5 kN/m²
{
  const r = compute({ actions: [G(5.0), G(1.5)] });
  chk('1) nur G: q_d = 1.35·6.5', r.qd, 8.775);
  chk('1) nur G: q_selten', r.qk, 6.5);
  chk('1) nur G: q_häufig', r.qf, 6.5);
  chk('1) nur G: q_quasi-ständig', r.qqs, 6.5);
  yes('1) nur G: genau eine Kombination ohne Leiteinwirkung', r.uls.combos.length === 1 && r.uls.combos[0].lead === null);
  yes('1) Einheit kN/m²', r.unit === 'kN/m2');
}

// ---------- 2) Eine veränderliche Einwirkung ----------
// G = 5.0 kN/m², Q = 3.0 kN/m² Nutzlast Kat. A (ψ0 = 0.7, ψ1 = 0.5, ψ2 = 0.3)
// q_d = 1.35·5.0 + 1.5·3.0 = 6.75 + 4.50 = 11.25
// selten = 5.0 + 3.0 = 8.0; häufig = 5.0 + 0.5·3.0 = 6.5; quasi-ständig = 5.0 + 0.3·3.0 = 5.9
{
  const r = compute({ actions: [G(5.0), Q(3.0, 'A')] });
  chk('2) eine Q: q_d', r.qd, 11.25);
  chk('2) eine Q: q_selten', r.qk, 8.0);
  chk('2) eine Q: q_häufig', r.qf, 6.5);
  chk('2) eine Q: q_quasi-ständig', r.qqs, 5.9);
}

// ---------- 3) Zwei veränderliche, die kleinere Q_k wird massgebend (ψ0) ----------
// SIA 260:2013 Gl. (16): Begleiteinwirkungen mit ψ0·Qk, OHNE γQ.
// G = 4.0; Q1 = 5.0 Lagerfläche Kat. E (ψ0 = 1.0, ψ1 = 0.9, ψ2 = 0.8); Q2 = 3.0 Wind (ψ0 = 0.6, ψ1 = 0.5, ψ2 = 0)
// Leit Q1: 1.35·4 + 1.5·5.0 + 0.6·3.0 = 5.4 + 7.5 + 1.8 = 14.7
// Leit Q2: 1.35·4 + 1.5·3.0 + 1.0·5.0 = 5.4 + 4.5 + 5.0 = 14.9  → massgebend, obwohl Q2 < Q1
// selten:  Leit Q1: 4 + 5 + 0.6·3 = 10.8; Leit Q2: 4 + 3 + 1.0·5 = 12.0 → 12.0
// häufig:  Leit Q1: 4 + 0.9·5 + 0·3 = 8.5; Leit Q2: 4 + 0.5·3 + 0.8·5 = 9.5 → 9.5
// quasi-ständig: 4 + 0.8·5 + 0·3 = 8.0
{
  const r = compute({ actions: [G(4.0), Q(5.0, 'E', { name: 'Lager' }), Q(3.0, 'wind', { name: 'Wind' })] });
  chk('3) Leit Lager', r.uls.combos[0].value, 14.7);
  chk('3) Leit Wind', r.uls.combos[1].value, 14.9);
  chk('3) q_d', r.qd, 14.9);
  yes('3) massgebend: Wind (kleinere Q_k)', r.uls.combos[r.uls.gov].leadName === 'Wind');
  chk('3) q_selten', r.qk, 12.0);
  chk('3) q_häufig', r.qf, 9.5);
  chk('3) q_quasi-ständig', r.qqs, 8.0);
  // Begleiter ohne γQ: Begleitterm Wind bei Leit Lager = ψ0·Qk = 0.6·3.0 = 1.8
  const acc = r.uls.combos[0].terms.find(t => t.name === 'Wind');
  chk('3) Begleiter ohne γQ: Faktor 1', acc.gamma, 1);
  chk('3) Begleiter = ψ0·Qk', acc.val, 1.8);
}

// ---------- 4) Günstig wirkendes Eigengewicht ----------
// Dach gegen Abheben: G = 0.8 kN/m² günstig (γG,inf, wirkt entgegen), Q = Windsog 1.2 kN/m²
// q_d = −0.80·0.8 + 1.5·1.2 = −0.64 + 1.80 = 1.16
// selten = −0.8 + 1.2 = 0.4; häufig = −0.8 + 0.5·1.2 = −0.2; quasi-ständig = −0.8 + 0·1.2 = −0.8
{
  const r = compute({ actions: [G(0.8, { fav: true }), Q(1.2, 'wind')] });
  chk('4) günstiges G: q_d', r.qd, 1.16);
  chk('4) günstiges G: q_selten', r.qk, 0.4);
  chk('4) günstiges G: q_häufig', r.qf, -0.2);
  chk('4) günstiges G: q_quasi-ständig', r.qqs, -0.8);
  // ungünstig zum Vergleich: 1.35·0.8 + 1.5·1.2 = 1.08 + 1.8 = 2.88
  chk('4) dasselbe ungünstig: q_d', compute({ actions: [G(0.8), Q(1.2, 'wind')] }).qd, 2.88);
  // günstige veränderliche Einwirkung wird nicht angesetzt: 1.35·5 = 6.75
  const r2 = compute({ actions: [G(5), Q(2, 'B', { fav: true })] });
  chk('4) günstige Q nicht angesetzt', r2.qd, 6.75);
  yes('4) günstige Q als nicht angesetzt gemeldet', r2.Qignored.length === 1);
}

// ---------- 5) Schnee nach Höhenlage ----------
// h0 = 1500 m: ψ0 = 1 − 60/1500 = 0.96, ψ1 = 1 − 250/1500 = 0.8333, ψ2 = 1 − 1000/1500 = 0.3333
// G = 3.0, S = 2.0: q_d = 1.35·3 + 1.5·2 = 4.05 + 3.0 = 7.05
// häufig = 3 + 0.8333·2 = 4.6667; quasi-ständig = 3 + 0.3333·2 = 3.6667
{
  const r = compute({ actions: [G(3.0), Q(2.0, 'snow')], h0: 1500 });
  chk('5) Schnee ψ0 bei h0 = 1500', r.rows[1].psi[0], 0.96);
  chk('5) Schnee q_d', r.qd, 7.05);
  chk('5) Schnee q_häufig', r.qf, 3 + 2 * (1 - 250 / 1500));
  chk('5) Schnee q_quasi-ständig', r.qqs, 3 + 2 * (1 - 1000 / 1500));
  // h0 = 500: ψ2 = 1 − 2 = −1 → 0; ψ1 = 1 − 0.5 = 0.5
  const r2 = compute({ actions: [G(3.0), Q(2.0, 'snow')], h0: 500 });
  chk('5) Schnee h0 = 500: ψ2 auf 0 begrenzt', r2.rows[1].psi[2], 0);
  chk('5) Schnee h0 = 500: ψ1', r2.rows[1].psi[1], 0.5);
  // Schnee als Begleiter (ohne γQ): G = 3, Nutzlast B 2.0, Schnee 1.0 bei h0 = 1500
  // Leit B: 4.05 + 1.5·2.0 + 0.96·1.0 = 4.05 + 3.0 + 0.96 = 8.01; Leit Schnee: 4.05 + 1.5·1.0 + 0.7·2.0 = 6.95 → 8.01
  chk('5) Schnee als Begleiter', compute({ actions: [G(3.0), Q(2.0, 'B'), Q(1.0, 'snow')], h0: 1500 }).qd, 8.01);
}

// ---------- 6) Lasteinzugsbreite und Einheiten ----------
// G = 5.0 kN/m², Q = 3.0 kN/m² Kat. B, b_e = 4 m → 20 kN/m und 12 kN/m
// q_d = 1.35·20 + 1.5·12 = 27 + 18 = 45 kN/m
{
  const r = compute({ actions: [G(5.0), Q(3.0, 'B')], be: 4 });
  chk('6) mit b_e: q_d in kN/m', r.qd, 45);
  yes('6) Einheit kN/m', r.unit === 'kN/m');
  // gemischt: kN/m² mit b_e und kN/m direkt: 5·2 = 10 + 3 kN/m → 1.35·10 + 1.5·3 = 13.5 + 4.5 = 18
  chk('6) kN/m² mit b_e + kN/m', compute({ actions: [G(5.0), Q(3.0, 'B', { unit: 'kN/m' })], be: 2 }).qd, 18);
  // Einzellasten in kN: 1.35·10 + 1.5·20 = 13.5 + 30 = 43.5
  chk('6) Einzellasten in kN', compute({ actions: [G(10, { unit: 'kN' }), Q(20, 'C', { unit: 'kN' })] }).qd, 43.5);
}

// ---------- 6b) Schneelast auf dem Dach nach SIA 261:2020, 5.2 ----------
// Gl. (10): s_k = [1 + (h0/350)²]·0.4 ≥ 0.9 kN/m²; Gl. (9): q_k = μ1·Ce·CT·s_k
// Figur 2: μ1 = 0.8 bis 30°, linear auf 0 bei 60°; 5.3.4: Schneefänger μ1 = 0.8; Figur 4: bis 1.0
chk('SIA 261 Gl. (10): 0.4 kN/m²', SNOW.SK0, 0.4);
chk('SIA 261 Gl. (10): Mindestwert 0.9 kN/m²', SNOW.SKMIN, 0.9);
yes('SIA 261 5.2.4: Ce = 1.0 / 0.8 / 1.2', SNOW.CE.join() === '1,0.8,1.2');
const S = o => Object.assign({ calc: true, alpha: 5, Ce: 1, CT: 1, Lr: '', Br: '', stop: false }, o);
{
  // h0 = 800: s_k = [1 + (800/350)²]·0.4 = [1 + 5.22449]·0.4 = 2.489796; α = 5° → μ1 = 0.8
  // q_k = 0.8·1.0·1.0·2.489796 = 1.991837
  const sn = snowLoad(S(), 800);
  chk('6b) s_k bei h0 = 800', sn.sk, (1 + (800 / 350) ** 2) * 0.4);
  chk('6b) s_k = 2.4898', sn.sk, 2.489796, 1e-6);
  chk('6b) μ1 bei α = 5°', sn.mu1, 0.8);
  chk('6b) q_k = 1.9918', sn.qk, 1.991837, 1e-6);
  // h0 = 300: [1 + (300/350)²]·0.4 = [1 + 0.734694]·0.4 = 0.693878 < 0.9 → s_k = 0.9; q_k = 0.8·0.9 = 0.72
  const lo = snowLoad(S(), 300);
  chk('6b) s_k-Mindestwert bei h0 = 300', lo.sk, 0.9);
  chk('6b) q_k bei h0 = 300', lo.qk, 0.72);
  // α = 30° → 0.8; α = 45° → 0.8·15/30 = 0.4; α = 60° → 0; α = 45° mit Schneefänger → 0.8
  chk('6b) μ1 bei α = 30°', snowLoad(S({ alpha: 30 }), 800).mu1, 0.8);
  chk('6b) μ1 bei α = 45°', snowLoad(S({ alpha: 45 }), 800).mu1, 0.4);
  chk('6b) μ1 bei α = 60°', snowLoad(S({ alpha: 60 }), 800).mu1, 0);
  chk('6b) μ1 bei α = 45° mit Schneefänger (5.3.4)', snowLoad(S({ alpha: 45, stop: true }), 800).mu1, 0.8);
  // Ce = 1.2, CT = 0.9: q_k = 0.8·1.2·0.9·2.489796 = 2.151184
  chk('6b) q_k mit Ce = 1.2, CT = 0.9', snowLoad(S({ Ce: 1.2, CT: 0.9 }), 800).qk, 0.8 * 1.2 * 0.9 * 2.489796, 1e-6);
  // Figur 4: α = 3°, 40 × 22 m → max 40 m → μ1 = 1.0; 22 × 21 m → 0.8 + 0.2·2/5 = 0.88
  chk('6b) Figur 4: 40 × 22 m → 1.0', snowLoad(S({ alpha: 3, Lr: 40, Br: 22 }), 800).mu1, 1.0);
  chk('6b) Figur 4: 22 × 21 m → 0.88', snowLoad(S({ alpha: 3, Lr: 22, Br: 21 }), 800).mu1, 0.88);
  chk('6b) Figur 4: Breite 15 m ≤ 20 m → 0.8', snowLoad(S({ alpha: 3, Lr: 40, Br: 15 }), 800).mu1, 0.8);
  chk('6b) Figur 4: α = 12° (nicht quasi-horizontal) → 0.8', snowLoad(S({ alpha: 12, Lr: 40, Br: 40 }), 800).mu1, 0.8);
  // In der Kombination: G = 3.0, Schnee berechnet (h0 = 800, α = 5°): q_d = 1.35·3 + 1.5·1.991837 = 4.05 + 2.987755 = 7.037755
  const r = compute({ actions: [G(3.0), Q(99, 'snow')], h0: 800, snow: S() });
  chk('6b) Kombination mit berechnetem Schnee (Eingabe 99 ignoriert)', r.qd, 4.05 + 1.5 * 1.991837, 1e-6);
  yes('6b) Schnee-Zeile als berechnet markiert', r.rows[1].auto === true);
  // ohne calc gilt der eingegebene Wert: 4.05 + 1.5·1.2 = 5.85
  chk('6b) Schneerechner aus: Eingabe gilt', compute({ actions: [G(3.0), Q(1.2, 'snow')], h0: 800, snow: S({ calc: false }) }).qd, 5.85);
  // mit Lasteinzugsbreite 4 m: Schnee 1.991837·4 = 7.967347 kN/m, G 12 kN/m → 16.2 + 11.95102 = 28.15102
  chk('6b) berechneter Schnee mit b_e = 4 m', compute({ actions: [G(3.0), Q(0, 'snow')], h0: 800, be: 4, snow: S() }).qd, 16.2 + 1.5 * 4 * 1.991837, 1e-6);
}

// ---------- 7) Ungültige Eingaben ----------
const err = (name, p) => yes(name + ' → Fehlermeldung', !!(compute(p) || {}).error);
err('keine Liste', {});
err('leere Liste', { actions: [] });
err('negativer Wert', { actions: [G(-1)] });
err('Wert fehlt (NaN)', { actions: [G(NaN)] });
err('Wert als Text', { actions: [G('5')] });
err('unbekannte Art', { actions: [{ kind: 'X', value: 1, unit: 'kN' }] });
err('unbekannte Einheit', { actions: [G(1, { unit: 'kg' })] });
err('Q ohne Typ', { actions: [G(1), { kind: 'Q', value: 1, unit: 'kN/m2' }] });
err('Einheiten gemischt ohne b_e', { actions: [G(5), Q(3, 'B', { unit: 'kN/m' })] });
err('kN mit kN/m gemischt', { actions: [G(5, { unit: 'kN' }), Q(3, 'B', { unit: 'kN/m' })] });
err('Schnee ohne h0', { actions: [G(1), Q(1, 'snow')] });
err('Schnee mit h0 = 0', { actions: [G(1), Q(1, 'snow')], h0: 0 });
err('b_e negativ', { actions: [G(1)], be: -2 });
err('mehr als 30 Zeilen', { actions: Array.from({ length: 31 }, () => G(1)) });
err('Schneerechner: Einheit kN/m', { actions: [G(1, { unit: 'kN/m' }), Q(1, 'snow', { unit: 'kN/m' })], h0: 800, snow: S() });
err('Schneerechner: α = 90°', { actions: [G(1), Q(1, 'snow')], h0: 800, snow: S({ alpha: 90 }) });
err('Schneerechner: α negativ', { actions: [G(1), Q(1, 'snow')], h0: 800, snow: S({ alpha: -5 }) });
err('Schneerechner: Ce = 0.9', { actions: [G(1), Q(1, 'snow')], h0: 800, snow: S({ Ce: 0.9 }) });
err('Schneerechner: CT = 1.2', { actions: [G(1), Q(1, 'snow')], h0: 800, snow: S({ CT: 1.2 }) });
err('Schneerechner: Dachlänge 0', { actions: [G(1), Q(1, 'snow')], h0: 800, snow: S({ Lr: 0 }) });
yes('Schneerechner ohne Schnee-Zeile ohne Wirkung', !compute({ actions: [G(1)], snow: S({ alpha: 999 }) }).error);
yes('b_e leer erlaubt', !compute({ actions: [G(1)], be: '' }).error);

console.log(fails ? fails + ' FEHLER' : 'Alle Tests bestanden');
process.exitCode = fails ? 1 : 0;

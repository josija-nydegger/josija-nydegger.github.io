// Biegebemessung-Tool: Rechenkern (window.__bb.compute) gegen Handrechnungen, SIA 262:2025 Tabelle 8
// und eine unabhängige Faserintegration (Rechteckblock und Parabel-Rechteck-Diagramm).
// Start: node _tests/biegebemessung.test.js   (braucht einmalig "npm install" im Hauptordner)
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const file = process.argv[2] || path.join(__dirname, '..', 'public', 'tools', 'biegebemessung', 'index.html');
const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', url: 'https://josija-nydegger.ch/tools/biegebemessung/' });
const { compute, DEFAULTS, CONC } = dom.window.__bb;

let fails = 0;
const chk = (name, got, exp, tol = 1e-6) => {
  const ok = Math.abs(got - exp) <= tol * Math.max(1, Math.abs(exp));
  if (!ok) fails++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + (+got.toPrecision(7)) + ' (soll ' + (+exp.toPrecision(7)) + ')');
};
const yes = (name, cond) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name); };
const run = o => compute(Object.assign({}, DEFAULTS, o));

// ---------- f_cd gegen SIA 262:2025 Tabelle 8 (Tabelle auf 0.5 bzw. 0.1 gerundet) ----------
const tab8 = { 'C12/15': 8.0, 'C16/20': 10.5, 'C20/25': 13.5, 'C25/30': 16.5, 'C30/37': 20.0, 'C35/45': 23.3, 'C40/50': 26.7, 'C45/55': 28.8, 'C50/60': 30.9 };
for (const k in tab8) {
  const r = run({ conc: k, fck: CONC[k][0], fctm: CONC[k][1] });
  chk('f_cd ' + k + ' ≈ Tabelle 8', r.fcd, tab8[k], 0.025);
}
chk('f_cd C45/55 = (40/45)^(1/3)·45/1.5', run({ fck: 45 }).fcd, Math.cbrt(40 / 45) * 30);
chk('f_cd mit η_t = 0.85', run({ etat: 0.85 }).fcd, 0.85 * 20);
chk('f_yd B500B = 500/1.15', run({}).fyd, 500 / 1.15);
chk('f_yd B700B ≈ 610 (Tabelle 9)', run({ steel: 'B700B', fyk: 700 }).fyd, 610, 0.003);

// ---------- Handrechnung einfach bewehrt (Standardwerte) ----------
// b = 300, h = 600, c = 30, Ø_w = 10, Ø = 20 → d = 550; C30/37 → f_cd = 20; B500B → f_yd = 434.78; M_d = 250 kNm
{
  const r = run({});
  const b = 300, d = 550, fcd = 20, fyd = 500 / 1.15, M = 250e6;
  const mu = M / (b * d * d * fcd);
  const a = d * (1 - Math.sqrt(1 - 2 * mu));
  chk('d = 600 − 30 − 10 − 10', r.d, 550);
  chk("d' = 30 + 10 + 6", r.d2, 46);
  chk('μ = M/(b·d²·f_cd)', r.des.mu, mu);
  chk('x = d·(1 − √(1 − 2μ))/0.85', r.des.x, a / 0.85);
  chk('A_s = 0.85·x·b·f_cd/f_yd ≈ 1129 mm²', r.des.As, a * b * fcd / fyd);
  chk('A_s Handrechnung gerundet', r.des.As, 1129, 5e-4);
  yes('keine Druckbewehrung nötig', !r.des.comp && r.As2Erf === 0);
  yes('Ampel Bemessung grün (x/d = 0.175)', r.ampelDes === 'ok');
  yes('Vorschlag 4 Ø 20 (1257 mm²)', r.nAuto === 4 && Math.abs(r.As - 4 * Math.PI * 100) < 1e-9);
  // Mindestbewehrung: t = 0.2 m, k_t = 1/1.1, f_ct,eff = 2.9/1.1, M_cr = f_ct,eff·b·h²/6
  const fct = 2.9 / 1.1, Mcr = fct * 300 * 600 ** 2 / 6;
  chk('k_t = 1/(1 + 0.5·0.2)', r.kt, 1 / 1.1);
  chk('M_cr = f_ctd·b·h²/6', r.Mcr, Mcr);
  const aMin = d * (1 - Math.sqrt(1 - 2 * Mcr / (b * d * d * fcd)));
  chk('A_s,min aus M_Rd = M_cr', r.AsMin, aMin * b * fcd / fyd);
  // Biegewiderstand 4 Ø 20 + 2 Ø 12 (Montagestäbe zählen mit)
  yes('M_Rd ≥ M_d', r.okM && r.res.MRd > 250e6);
  chk('lichter Abstand 4 Ø 20 = (300 − 80 − 80)/3', r.sClear, (300 - 2 * 40 - 80) / 3);
}

// ---------- Handrechnung mit Druckbewehrung ----------
// b = 300, h = 500 → d = 500 − 30 − 10 − 10 = 450, d' = 30 + 10 + 7 = 47 (Ø' 14); C25/30; M_d = 400 kNm; Grenze 0.35·435/f_yd
{
  const r = run({ h: 500, Md: 400, conc: 'C25/30', fck: 25, fctm: 2.6, ds2: 14 });
  const b = 300, d = 450, d2 = 47, fcd = 25 / 1.5, fyd = 500 / 1.15, Es = 200000;
  const x = 0.35 * 435 / fyd * d, a = 0.85 * x;
  const Fc = a * b * fcd, Mc = Fc * (d - a / 2), dM = 400e6 - Mc;
  const s2 = Math.min(fyd, Es * 0.0035 * (x - d2) / x);
  const As2 = dM / (s2 * (d - d2));
  const As = (Fc + As2 * s2) / fyd;
  yes('Druckbewehrung nötig', r.des.comp);
  chk('x = 0.35·435/f_yd·d', r.des.x, x);
  chk('M_c = F_c·z', r.des.Mc, Mc);
  chk("σ_s' (fliesst)", r.des.sigS2, s2);
  chk("A_s' = ΔM/(σ_s'·(d − d'))", r.As2Erf, As2);
  chk('A_s = (F_c + A_s\'·σ_s\')/f_yd', r.des.As, As);
  yes('Bemessungs-x/d grün', r.ampelDes === 'ok');
  // Mit genau A_s und A_s' muss M_Rd = M_d und x = x_lim sein
  const back = r.resist(As, As2);
  chk('Kontrolle M_Rd(A_s, A_s\') = M_d', back.MRd, 400e6, 1e-7);
  chk('Kontrolle x', back.x, x, 1e-7);
}

// ---------- Druckbewehrung, die nicht fliesst ----------
{
  const r = run({ h: 300, Md: 120, c: 40, ds2: 26, lim: '0.35' });
  const d = r.d, d2 = r.d2, x = r.des.x;
  const eps2 = 0.0035 * (x - d2) / x;
  yes("σ_s' < f_yd bei grossem d'", r.des.sigS2 < r.fyd);
  chk("σ_s' = E_s·ε_s'", r.des.sigS2, 200000 * eps2);
  const back = r.resist(r.des.As, r.des.As2);
  chk('Kontrolle M_Rd = M_d (σ_s\' elastisch)', back.MRd, 120e6, 1e-7);
  void d;
}

// ---------- Ohne Druckbewehrung: Zugbewehrung fliesst nicht ----------
{
  const r = run({ Md: 740, lim: 'none' });
  yes('x/d über Fliessgrenze', r.des.xi > r.xiY);
  yes('Ampel rot', r.ampelDes === 'bad');
  const back = r.resist(r.des.As, 0);
  chk('Kontrolle M_Rd = M_d mit σ_s < f_yd', back.MRd, 740e6, 1e-7);
  yes('σ_s < f_yd', r.des.sigS < r.fyd);
  yes('Moment zu gross → Fehlermeldung', !!run({ Md: 900, lim: 'none' }).error);
}

// ---------- Rückrechnung für viele Kombinationen: M_Rd(A_s,erf, A_s',erf) = M_d ----------
{
  let n = 0, bad = 0, skip = 0;
  for (const b of [200, 300, 1000]) for (const h of [200, 450, 800]) for (const conc of ['C20/25', 'C30/37', 'C50/60'])
    for (const steel of ['B500B', 'B700B']) for (const lim of ['0.35', '0.50']) for (const k of [0.05, 0.15, 0.3, 0.45]) {
      const fck = CONC[conc][0], fyk = steel === 'B700B' ? 700 : 500;
      const p = { b, h, conc, fck, fctm: CONC[conc][1], steel, fyk, lim, Md: 0 };
      const r0 = run(p);
      const Md = k * b * r0.d * r0.d * r0.fcd / 1e6;
      const r = run(Object.assign(p, { Md }));
      if (r.error) {
        // Zulässig nur, wenn die Druckbewehrung bei x = x_lim nicht in der Druckzone läge
        const xl = (lim === '0.35' ? r0.xi35 : r0.xi50) * r0.d;
        if (/Druckzone \(d' ≥ x\)/.test(r.error) && xl <= r0.d2) { skip++; continue; }
        bad++; console.log('FAIL Fehler bei', JSON.stringify(p), r.error); continue;
      }
      const back = r.resist(r.des.As, r.des.As2);
      n++;
      if (Math.abs(back.MRd - Md * 1e6) > 1e-6 * Md * 1e6) { bad++; console.log('FAIL Rückrechnung', JSON.stringify(p), back.MRd / 1e6, Md); }
      const limOf = v => v === '0.35' ? r.xi35 : r.xi50;
      if (r.des.xi > limOf(p.lim) + 1e-9) { bad++; console.log('FAIL x/d über Grenze', JSON.stringify(p)); }
    }
  fails += bad;
  console.log((bad ? 'FAIL' : 'OK  ') + ' Rückrechnung M_Rd = M_d und x/d ≤ Grenze für ' + n + ' Kombinationen (' + skip + ' mit d\' ≥ x_lim korrekt abgewiesen)');
}

// ---------- Unabhängige Faserintegration ----------
// Ebenbleiben, Randstauchung 3.5 ‰, Beton als Fasern, Stahl elastisch-ideal plastisch.
function fiber(b, h, d, d2, As, As2, fcd, fyd, Es, law) {
  const N = 4000;
  const stress = e => law === 'block' ? null : (e >= 0.002 ? fcd : fcd * (1 - (1 - e / 0.002) ** 2));
  const forces = x => {
    let Fc = 0, Mc = 0;
    const dz = h / N;
    for (let i = 0; i < N; i++) {
      const z = (i + 0.5) * dz;
      let s = 0;
      if (law === 'block') s = z <= 0.85 * x ? fcd : 0;
      else { const e = 0.0035 * (x - z) / x; s = e > 0 ? stress(e) : 0; }
      Fc += s * b * dz; Mc += s * b * dz * (d - z);
    }
    const st = t => Math.max(-fyd, Math.min(fyd, Es * 0.0035 * (x - t) / x));
    return { N: Fc + As2 * st(d2) + As * st(d), M: Mc + As2 * st(d2) * (d - d2), x };
  };
  let lo = 1e-6, hi = h;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (forces(m).N < 0) lo = m; else hi = m; }
  return forces((lo + hi) / 2);
}
{
  for (const o of [{}, { h: 500, Md: 400, conc: 'C25/30', fck: 25, fctm: 2.6, ds2: 14 }, { b: 1000, h: 250, Md: 60, ds: 12, ds2: 10 }]) {
    const p = Object.assign({}, DEFAULTS, o), r = compute(p);
    const blk = fiber(p.b, p.h, r.d, r.d2, r.As, r.As2, r.fcd, r.fyd, p.Es, 'block');
    chk('Faser (Rechteckblock) M_Rd ' + JSON.stringify(o), r.res.MRd, blk.M, 2e-3);
    chk('Faser (Rechteckblock) x ' + JSON.stringify(o), r.res.x, blk.x, 2e-3);
    const pr = fiber(p.b, p.h, r.d, r.d2, r.As, r.As2, r.fcd, r.fyd, p.Es, 'parabola');
    chk('Parabel-Rechteck M_Rd ≈ Rechteckblock ' + JSON.stringify(o), r.res.MRd, pr.M, 0.02);
  }
}

// ---------- Eingaben prüfen ----------
yes('b = 0 → Fehlermeldung', !!run({ b: 0 }).error);
yes('h = NaN → Fehlermeldung', !!run({ h: NaN }).error);
yes('negatives Moment → Fehlermeldung', !!run({ Md: -10 }).error);
yes('n = 2.5 → Fehlermeldung', !!run({ n: 2.5 }).error);
yes("d' ≥ d → Fehlermeldung", !!run({ h: 80 }).error);
yes('M_d = 0 → nur Mindestbewehrung', (r => !r.error && r.des.As === 0 && r.AsErf === r.AsMin)(run({ Md: 0 })));
yes('B500A: grünes x/d wird gelb', run({ steel: 'B500A', fyk: 500, eud: 0.02 }).ampelRes === 'warn');
yes('zu viele Stäbe → Abstand zu klein', (r => r.sClear < r.sMin)(run({ n: 8 })));

console.log(fails ? fails + ' FEHLER' : 'Alle Tests bestanden');
process.exitCode = fails ? 1 : 0;

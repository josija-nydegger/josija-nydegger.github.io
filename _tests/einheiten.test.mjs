// Einheiten-Umrechner: Engine src/lib/einheiten.ts gegen bekannte Umrechnungen.
// Ohne Abhängigkeiten: Node 24 führt die TypeScript-Datei direkt aus (Typen werden nur entfernt).
// Start: node _tests/einheiten.test.mjs
import { convert, evaluate, formatNumber, parseNumber, parseUnit } from '../src/lib/einheiten.ts';

let fails = 0;
const chk = (name, got, exp, tol = 1e-9) => {
  const ok = typeof got === 'number' && Math.abs(got - exp) <= tol * Math.max(1, Math.abs(exp));
  if (!ok) fails++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + (typeof got === 'number' ? +got.toPrecision(10) : got) + ' (soll ' + exp + ')');
};
const yes = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (cond || info === undefined ? '' : ': ' + info)); };
const eq = (name, got, exp) => yes(name + ': ' + JSON.stringify(got), got === exp, 'soll ' + JSON.stringify(exp));

/** Hauptresultat einer Eingabe mit Zieleinheit */
const val = (q, opts) => {
  const r = convert(q, opts);
  return r && r.ok ? r.main.value : 'Fehler: ' + (r ? r.error : 'leer');
};
const err = q => {
  const r = convert(q);
  return r && !r.ok ? r.error : '';
};

// ---------- 1) Bekannte Paare aus der Aufgabe ----------
chk('1 kN/cm² = 10 MPa', val('1 kN/cm2 in MPa'), 10);
chk('1 N/mm² = 1000 kN/m²', val('1 N/mm² in kN/m²'), 1000);
chk('1 cm⁴ = 10\'000 mm⁴', val('1 cm4 in mm4'), 10000);
chk('1 kNm = 1\'000\'000 Nmm', val('1 kNm in Nmm'), 1e6);
chk('25 kN/m³ = 2548.42 kg/m³ (g = 9.81)', val('25 kN/m3 in kg/m3'), 25000 / 9.81);
eq('25 kN/m³ in kg/m³ angezeigt mit 4 Stellen', convert('25 kN/m3 in kg/m3').main.display, '2’548 kg/m³');
yes('25 kN/m³ → kg/m³ nennt g = 9.81', convert('25 kN/m3 in kg/m3').mainG === 9.81);
chk('100 % = 45°', val('100 % in °'), 45);
chk('3.5 kN/m * 6 m = 21 kN', val('3.5 kN/m * 6 m in kN'), 21);
{
  const r = convert('3.5 kN/m * 6 m');
  yes('3.5 kN/m * 6 m ohne Ziel: Hauptresultat 21 kN', r.ok && r.main.unit === 'kN' && r.main.value === 21 && r.category === 'Kraft', r.ok && r.main.display);
}
yes('"1 kN in MPa" ergibt einen Fehler', err('1 kN in MPa').includes('kN und MPa sind nicht kompatibel'), err('1 kN in MPa'));
chk('MN / mN = 10⁹', parseUnit('MN').factor / parseUnit('mN').factor, 1e9);
chk('1 mN in MN = 10⁻⁹', val('1 mN in MN'), 1e-9);
yes('mN und MN haben dieselbe Dimension', parseUnit('mN').dim.join() === parseUnit('MN').dim.join());
chk("\"1'250,5 kN\" wird als 1250.5 kN gelesen", val("1'250,5 kN in kN"), 1250.5);
chk("\"1'250,5 kN\" = 1'250'500 N", val("1'250,5 kN in N"), 1250500);

// ---------- 2) Kategorien aus der Aufgabe, je mit Gegenprobe ----------
const pairs = [
  // Kraft
  ['1 MN in kN', 1000], ['2500 N in kN', 2.5],
  // Linienlast, Federsteifigkeit
  ['1 kN/m in N/mm', 1], ['1 N/mm in N/m', 1000], ['1 MN/m in kN/m', 1000],
  // Flächenlast / Spannung
  ['1 MPa in Pa', 1e6], ['1 kPa in kN/m²', 1], ['1 bar in MPa', 0.1], ['1 bar in kN/m2', 100], ['1 N/m2 in Pa', 1], ['30 N/mm2 in kN/cm2', 3],
  // Moment
  ['1 kNm in kNcm', 100], ['1 Nm in Nmm', 1000], ['1 kN·m in Nm', 1000], ['1 kN*m in kNm', 1], ['1 kNm in kJ', 1],
  // Länge, Fläche, Volumen
  ['1 m in mm', 1000], ['1 cm in mm', 10], ['1 m² in cm²', 1e4], ['1 m^2 in mm2', 1e6], ['1 m³ in l', 1000], ['1 l in cm3', 1000], ['1 m3 in mm³', 1e9],
  // Bewehrung pro Meter
  ['1 cm²/m in mm²/m', 100], ['5.65 cm2/m in mm2/m', 565],
  // Trägheits- und Widerstandsmoment
  ['1 m4 in cm4', 1e8], ['1 cm3 in mm3', 1000],
  // Dichte, Wichte, Bettungsmodul
  ['1 t/m3 in kg/m3', 1000], ['1 MN/m3 in kN/m3', 1000],
  // Rotationsfeder
  ['1 kNm/rad in Nmm/rad', 1e6], ['1 MNm/rad in kNm/rad', 1000]
];
for (const [q, exp] of pairs) {
  chk(q, val(q), exp);
  // Gegenprobe: Ergebnis zurückrechnen
  const [lhs, to] = q.split(' in ');
  const from = lhs.replace(/^[\d.]+\s*/, '');
  chk('  zurück: ' + exp + ' ' + to + ' in ' + from, val(exp + ' ' + to + ' in ' + from), Number(lhs.match(/^[\d.]+/)[0]));
}

// ---------- 3) Masse ↔ Kraft über g ----------
chk('1 t in kN (g = 9.81)', val('1 t in kN'), 9.81);
chk('1 t in kN (g = 10)', val('1 t in kN', { g: 10 }), 10);
chk('100 kg in kN (g = 9.81)', val('100 kg in kN'), 0.981);
chk('1 kN in kg (g = 9.81)', val('1 kN in kg'), 1000 / 9.81);
chk('1 kN/m² in kg/m² (g = 10) ≈ 100', val('1 kN/m2 in kg/m2', { g: 10 }), 100);
chk('2.5 t/m³ in kN/m³ (g = 10)', val('2.5 t/m3 in kN/m3', { g: 10 }), 25);
yes('g = 10 wird beim Hauptresultat genannt', convert('1 t in kN', { g: 10 }).mainG === 10);
yes('ohne Masse ↔ Kraft kein g', convert('1 kN in N').mainG === null);
{
  const r = convert('1 t');
  const gGroup = r.ok && r.groups.find(gr => gr.g);
  yes('1 t ohne Ziel: Gruppe Gewichtskraft mit g im Titel', !!gGroup && gGroup.title.includes('g = 9.81 m/s²'), gGroup && gGroup.title);
  yes('1 t ohne Ziel: 9.81 kN in der Gruppe', !!gGroup && gGroup.rows.some(x => x.unit === 'kN' && Math.abs(x.value - 9.81) < 1e-9));
  yes('1 t ohne Ziel: Rechenweg nennt g, falls in kN gefragt', convert('1 t in kN').steps.some(s => s.includes('g = 9.81')));
}
yes('Masse → Länge bleibt ein Fehler', err('1 kg in m').includes('nicht kompatibel'), err('1 kg in m'));

// ---------- 4) Gross-/Kleinschreibung strikt ----------
chk('1 Mm = 10⁹ mm', val('1 Mm in mm'), 1e9);
yes('"KN" ist unbekannt, mit Vorschlag kN', err('1 KN').includes('«kN»'), err('1 KN'));
yes('"Mpa" ist unbekannt, mit Vorschlag MPa', err('1 Mpa').includes('«MPa»'), err('1 Mpa'));
yes('"kn" ist unbekannt', err('1 kn').includes('Unbekannte Einheit'), err('1 kn'));

// ---------- 5) Schreibweisen ----------
chk('Dezimalkomma 1,5 m in mm', val('1,5 m in mm'), 1500);
chk('Dezimalpunkt 1.5 m in mm', val('1.5 m in mm'), 1500);
chk('Exponent 1e6 Nmm in kNm', val('1e6 Nmm in kNm'), 1);
chk('10^3 N in kN', val('10^3 N in kN'), 1);
for (const u of ['m2', 'm^2', 'm²']) chk('Schreibweise ' + u, val('1 ' + u + ' in cm2'), 1e4);
for (const u of ['kNm', 'kN·m', 'kN*m', 'kN m']) chk('Schreibweise ' + u, val('1 ' + u + ' in Nm'), 1000);
for (const t of [' in ', ' -> ', ' → ', ' to ', '->']) chk(`Zieleinheit mit "${t.trim()}"`, val('12.5 kN/cm2' + t + 'MPa'), 125);
chk('µ und u gleichwertig', val('1000 µm in mm'), val('1000 um in mm'));
chk('Klammern: (2 + 3) kN in N', val('(2 + 3) kN in N'), 5000);
chk('kN/(m·s) wie kN/m/s', evaluate('1 kN/(m·s)').value, evaluate('1 kN/m/s').value);
chk('Addition 1 m + 50 cm in mm', val('1 m + 50 cm in mm'), 1500);
chk('Vorzeichen -5 kN in N', val('-5 kN in N'), -5000);
chk('Dimensionslos 1 MPa / 1 kN/m²', val('1 MPa / 1 kN/m2'), 1000);
chk('parseNumber "1\'250,5"', parseNumber("1'250,5"), 1250.5);
chk('parseNumber "1’250’000"', parseNumber('1’250’000'), 1250000);
yes('parseNumber "12\'50" ungültig', parseNumber("12'50") === null);
yes('halb getippte Zieleinheit ("12 kN i") zeigt die Liste', convert('12 kN i').ok && convert('12 kN i').groups.length > 0);
yes('leeres Feld ergibt null', convert('   ') === null);

// ---------- 6) Fehlermeldungen ----------
yes('kN/m und MPa nicht kompatibel', err('1 kN/m in MPa').startsWith('kN/m und MPa sind nicht kompatibel'), err('1 kN/m in MPa'));
yes('Addition verschiedener Dimensionen', err('2 kg + 3 m').includes('nur bei gleicher Dimension'), err('2 kg + 3 m'));
yes('Division durch null', err('1 kN / 0').includes('null'), err('1 kN / 0'));
yes('Tausender-Apostroph falsch gesetzt', err("12'50 kN").includes('Dreiergruppen'), err("12'50 kN"));
yes('Zahl ohne Rechenzeichen', err('3 m 2').includes('Rechenzeichen'), err('3 m 2'));
yes('Wert fehlt', err('in MPa').includes('Wert fehlt'), err('in MPa'));
yes('Unbekannte Zieleinheit', err('1 kN in xy').includes('Unbekannte Einheit «xy»'), err('1 kN in xy'));
yes('Klammer fehlt', err('(1 kN + 2 kN').includes('Klammer'), err('(1 kN + 2 kN'));

// ---------- 7) Temperatur: absolut und Differenz ----------
chk('20 °C = 293.15 K', val('20 °C in K'), 293.15);
chk('0 K = −273.15 °C', val('0 K in °C'), -273.15);
chk('−20 °C = 253.15 K', val('-20 °C in K'), 253.15);
eq('20 °C in K angezeigt (Verschiebung nicht weggerundet)', convert('20 °C in K').main.display, '293.15 K');
chk('ΔT 20 °C = ΔT 20 K', val('ΔT 20 °C in K'), 20);
chk('Δ20 °C = 20 K', val('Δ20 °C in K'), 20);
chk('dT 20 K = 20 °C', val('dT 20 K in °C'), 20);
yes('unter dem absoluten Nullpunkt', err('-300 °C').includes('Nullpunkt'), err('-300 °C'));
yes('absolute Temperatur: Hinweis auf Δ', convert('20 °C').hints.some(h => h.includes('Δ')));
yes('°C in Rechnungen als Differenz, mit Hinweis', convert('20 °C + 5 K').hints.some(h => h.includes('Temperaturdifferenz')));
chk('Wärmedehnung 1e-5 /K · 30 K · 10 m in mm', val('1e-5 /K * 30 K * 10 m in mm'), 3);

// ---------- 8) Neigung (über tan) ----------
chk('100 % = 45°', val('100 % in °'), 45);
chk('45° = 100 %', val('45° in %'), 100);
chk('45 Grad = 100 %', val('45 Grad in %'), 100);
chk('30° in %', val('30° in %'), 100 * Math.tan(Math.PI / 6));
chk('5 % = 1:20', val('5 % in 1:n'), 20);
eq('5 % in 1:n angezeigt', convert('5 % in 1:n').main.display, '1 : 20');
chk('1:20 = 5 %', val('1:20 in %'), 5);
chk('1:20 = 50 ‰', val('1 : 20 in ‰'), 50);
chk('12 ‰ = 1.2 %', val('12 ‰ in %'), 1.2);
chk('0.5 rad in °', val('0.5 rad in °'), (0.5 * 180) / Math.PI);
chk('−2 % in °', val('-2 % in °'), (Math.atan(-0.02) * 180) / Math.PI);
yes('ohne Ziel: Liste mit °, %, ‰, 1:n, rad', convert('30°').groups[0].rows.map(x => x.unit).join() === '°,%,‰,1:n,rad');
yes('90° ist keine Neigung', err('90°').includes('−90° und 90°'), err('90°'));
yes('1:0 ungültig', err('1:0').includes('nicht 0'), err('1:0'));
yes('Neigung nicht in MPa', err('5 % in MPa').includes('nur in °'), err('5 % in MPa'));
yes('kN nicht in %', err('1 kN in %').includes('Neigungen'), err('1 kN in %'));

// ---------- 9) Hinweise bei mehrdeutigen Dimensionen ----------
const hint = (q, word) => yes(`Hinweis bei ${q}: ${word}`, convert(q).hints.some(h => h.includes(word)), JSON.stringify(convert(q).hints));
hint('1 kN/m2', 'Spannung');
hint('1 kNm', 'Energie');
hint('1 kN/m', 'Federsteifigkeit');
hint('1 kN/m3', 'Bettungsmodul');
hint('1 kNm/rad', 'dimensionslos');
hint('1 cm3', 'Widerstandsmoment');
yes('kNm/rad ohne Ziel: Kategorie Rotationsfeder', convert('10 kNm/rad').category === 'Rotationsfeder');
yes('cm²/m ohne Ziel: Kategorie Bewehrung pro Meter', convert('5 cm2/m').category === 'Bewehrung pro Meter');
yes('mm ohne Ziel: Kategorie Länge', convert('5 mm').category === 'Länge');

// ---------- 10) Ausgabe: Stellen, Artefakte, wissenschaftliche Schreibweise ----------
eq('0.1 + 0.2 ohne Artefakt', formatNumber(0.1 + 0.2).text, '0.3');
eq('1 cm⁴ in mm⁴ ohne Artefakt', convert('1 cm4 in mm4').main.text, '10’000');
eq('Tausender-Apostroph', formatNumber(1250000).text, '1’250’000');
eq('kopierbar ohne Apostroph', formatNumber(1250000).plain, '1250000');
eq('4 signifikante Stellen', formatNumber(2548.41997).text, '2’548');
eq('6 signifikante Stellen', formatNumber(2548.41997, 6).text, '2’548.42');
eq('2 signifikante Stellen', formatNumber(2548.41997, 2).text, '2’500');
eq('gross: wissenschaftlich', formatNumber(1.25e9).text, '1.25 · 10⁹');
eq('klein: wissenschaftlich', formatNumber(1.25e-5).text, '1.25 · 10⁻⁵');
eq('klein: kopierbar', formatNumber(1.25e-5).plain, '1.25e-5');
eq('negativ mit echtem Minus', formatNumber(-0.5).text, '−0.5');
eq('null', formatNumber(0).text, '0');
eq('Stellen aus Optionen', convert('25 kN/m3 in kg/m3', { sig: 6 }).main.display, '2’548.42 kg/m³');
eq('kopieren: Zahl und Einheit', convert('12.5 kN/cm2 in MPa').main.copy, '125 MPa');
eq('kopieren: Grad ohne Leerzeichen', convert('100 % in °').main.copy, '45°');

// ---------- 11) Rechenweg ----------
{
  const st = convert('12.5 kN/cm2 in MPa').steps;
  yes('Rechenweg: Faktor und Dimension von kN/cm²', st.some(s => s.includes('kN/cm² = 10⁷ N/m²') && s.includes('[−1, 1, −2, 0]')), JSON.stringify(st));
  yes('Rechenweg: Umrechnung in MPa', st.some(s => s.includes('/ 10⁶ = 125 MPa')), JSON.stringify(st));
  const st2 = convert('3.5 kN/m * 6 m').steps;
  yes('Rechenweg: Multiplikation in SI', st2.some(s => s === '3’500 N/m · 6 m = 21’000 N'), JSON.stringify(st2));
}

console.log(fails ? fails + ' FEHLER' : 'Alle Tests bestanden');
process.exitCode = fails ? 1 : 0;

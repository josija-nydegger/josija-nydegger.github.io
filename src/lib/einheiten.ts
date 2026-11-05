// Einheiten-Engine für den Einheiten-Umrechner (/tools/einheiten/).
// Reine Funktionen ohne DOM: Text wie "12.5 kN/cm2 in MPa" → Wert, Einheit, Liste, Hinweise, Rechenweg.
// Getestet mit _tests/einheiten.test.mjs. Node führt diese Datei dort direkt aus (Typen werden nur entfernt),
// darum nur "löschbare" TypeScript-Syntax: keine enums, namespaces oder Parameter-Properties.
//
// Prinzip: Jede Einheit hat einen Faktor zur SI-Basis und einen Dimensionsvektor [m, kg, s, K].
// Zusammengesetzte Einheiten (kN/cm², kNm/rad, cm²/m) werden zerlegt: Faktoren multiplizieren,
// Exponenten addieren. Umgerechnet wird nur bei gleicher Dimension; Masse ↔ Kraft nur ausdrücklich über g.
// Sonderfälle mit eigener Logik: Temperatur (absolut mit Verschiebung, Differenz ohne) und Neigung (über tan).

/** Exponenten der Basiseinheiten m, kg, s, K */
export type Dim = [number, number, number, number];

export interface Options {
  /** Erdbeschleunigung in m/s² für Masse ↔ Kraft (Standard 9.81) */
  g?: number;
  /** Signifikante Stellen der Ausgabe (Standard 4) */
  sig?: number;
}

export interface Row {
  /** Einheit, wie angezeigt (z. B. "kN/m²", "1:n") */
  unit: string;
  value: number;
  /** Anzeige, z. B. "1’250.5" oder "1.25 · 10⁻⁵" */
  text: string;
  /** Zum Kopieren, ohne Tausender-Apostroph, z. B. "1250.5 kN" */
  copy: string;
  /** Zahl mit Einheit für die Anzeige, z. B. "1’250.5 kN", "45°", "1 : 20" */
  display: string;
  /** Diese Zeile entspricht der eingegebenen Einheit */
  input?: boolean;
}

export interface Group {
  title: string;
  rows: Row[];
  /** g in m/s², falls die Gruppe über g umgerechnet ist */
  g?: number;
}

export interface Success {
  ok: true;
  kind: 'unit' | 'temp' | 'slope';
  /** Erkannte Eingabe, sauber geschrieben (z. B. "12.5 kN/cm²") */
  input: string;
  /** Hauptresultat (Zieleinheit oder sinnvolle Einheit der Kategorie) */
  main: Row;
  /** g in m/s², falls das Hauptresultat über g umgerechnet wurde, sonst null */
  mainG: number | null;
  category: string;
  /** Ohne Zieleinheit: alle Einheiten der Kategorie (und über g verwandte) */
  groups: Group[];
  hints: string[];
  /** Rechenweg als Textzeilen */
  steps: string[];
  /** Wert in SI-Basiseinheiten (Neigung: tan α, Temperatur absolut: K) */
  si: number;
  dim: Dim;
}

export interface Failure {
  ok: false;
  error: string;
}

export type Outcome = Success | Failure;

export const G_DEFAULT = 9.81;
export const SIG_DEFAULT = 4;

/** Fehler in der Eingabe (wird als Meldung angezeigt) */
class InputError extends Error {}

// ---------- Dimensionen ----------

const ZERO: Dim = [0, 0, 0, 0];
/** Kraft / Masse = Beschleunigung [m/s²] */
const G_DIM: Dim = [1, 0, -2, 0];
const dimAdd = (a: Dim, b: Dim, k = 1): Dim => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2], a[3] + k * b[3]];
export const dimEq = (a: Dim, b: Dim): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
const isZero = (d: Dim) => dimEq(d, ZERO);

// ---------- Einheiten (Atome) ----------

interface AtomDef {
  factor: number;
  dim: Dim;
  /** Verschiebung zur SI-Basis, nur °C (absolute Temperatur) */
  offset?: number;
  temp?: boolean;
  angle?: boolean;
}

// SI-Vorsätze; welche Vorsätze eine Einheit erlaubt, steht bei der Einheit. Gross-/Kleinschreibung ist strikt.
const PREFIX: Record<string, number> = { n: 1e-9, µ: 1e-6, u: 1e-6, m: 1e-3, c: 1e-2, d: 1e-1, h: 1e2, k: 1e3, M: 1e6, G: 1e9 };
const ATOMS = new Map<string, AtomDef>();
function def(names: string[], factor: number, dim: Dim, prefixes = '', extra: Partial<AtomDef> = {}) {
  for (const n of names) {
    ATOMS.set(n, { factor, dim, ...extra });
    for (const p of prefixes) ATOMS.set(p + n, { factor: factor * PREFIX[p], dim, ...extra });
  }
}
def(['m'], 1, [1, 0, 0, 0], 'nµumcdkM');           // mm, cm, dm, km, Mm
def(['g'], 1e-3, [0, 1, 0, 0], 'µumkM');            // kg (Basis), Mg
def(['t'], 1e3, [0, 1, 0, 0]);                      // Tonne = 1000 kg
def(['s'], 1, [0, 0, 1, 0], 'm');
def(['K'], 1, [0, 0, 0, 1], '', { temp: true });
def(['°C', '℃', 'degC'], 1, [0, 0, 0, 1], '', { temp: true, offset: 273.15 });
def(['N'], 1, [1, 1, -2, 0], 'nµumkMG');            // mN, kN, MN, GN
def(['Pa'], 1, [-1, 1, -2, 0], 'hkMG');             // hPa, kPa, MPa, GPa
def(['bar'], 1e5, [-1, 1, -2, 0], 'm');
def(['J'], 1, [2, 1, -2, 0], 'kMG');
def(['l', 'L'], 1e-3, [3, 0, 0, 0], 'mcd');         // Liter
def(['rad'], 1, ZERO, 'm', { angle: true });
def(['°', 'Grad', 'deg'], Math.PI / 180, ZERO, '', { angle: true });
const MAX_ATOM = Math.max(...[...ATOMS.keys()].map(k => k.length));

// ---------- Hilfsfunktionen für Text ----------

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const UNSUP: Record<string, string> = Object.fromEntries(Object.entries(SUP).map(([k, v]) => [v, k]));
/** Hochgestellte Zahl, z. B. sup(-5) = "⁻⁵" */
export const sup = (n: number | string): string => String(n).replace(/[0-9-]/g, c => SUP[c]);
const minus = (s: string) => s.replace(/-/g, '−');
const isUnitStart = (c: string) => /[A-Za-zµ°℃%‰]/.test(c);
const isRunChar = (c: string) => /[A-Za-zµ°℃]/.test(c);

/** Gleichwertige Zeichen vereinheitlichen (Mikro, Minus, Mal-Zeichen, Leerzeichen) */
function normalize(s: string): string {
  return s
    .replace(/μ/g, 'µ')                   // griechisches My → Mikrozeichen
    .replace(/[−–]/g, '-')                // Minus, Halbgeviertstrich
    .replace(/[×⋅•∙]/g, '·')
    .replace(/[   ]/g, ' ');
}

// ---------- Zahlen formatieren ----------

const stripZeros = (m: string) => (m.includes('.') ? m.replace(/\.?0+$/, '') : m);

/**
 * Zahl mit sig signifikanten Stellen, ohne Gleitkomma-Artefakte.
 * text: Anzeige mit Tausender-Apostroph (’) und echtem Minus; ab 10⁹ und unter 10⁻³ wissenschaftlich.
 * plain: zum Kopieren (Dezimalpunkt, ohne Apostroph, wissenschaftlich als 1.25e-5).
 */
export function formatNumber(x: number, sig = SIG_DEFAULT): { text: string; plain: string } {
  if (!isFinite(x)) return x > 0 ? { text: '∞', plain: 'Infinity' } : { text: '−∞', plain: '-Infinity' };
  const p = Math.min(15, Math.max(1, Math.round(sig)));
  const r = Number(x.toPrecision(p));
  if (r === 0) return { text: '0', plain: '0' };
  const a = Math.abs(r);
  if (a >= 1e9 || a < 1e-3) {
    const [m, e] = r.toExponential(p - 1).split('e');
    const mant = stripZeros(m);
    const exp = Number(e);
    return { text: minus(mant) + ' · 10' + sup(exp), plain: mant + 'e' + exp };
  }
  const plain = String(r); // in diesem Bereich nie in Exponentenschreibweise
  const [int, frac] = plain.replace('-', '').split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return { text: (r < 0 ? '−' : '') + grouped + (frac ? '.' + frac : ''), plain };
}

/** Faktor für den Rechenweg: Zehnerpotenzen als 10ⁿ, sonst als Zahl */
function formatFactor(f: number): string {
  const k = Math.log10(Math.abs(f));
  if (Math.abs(k - Math.round(k)) < 1e-9) {
    const e = Math.round(k);
    return (f < 0 ? '−' : '') + (e === 0 ? '1' : e === 1 ? '10' : '10' + sup(e));
  }
  return formatNumber(f, 8).text;
}

/** Name der SI-Einheit einer Dimension: N, N/m², N·m, kg/m³, m/s², "" (dimensionslos) */
export function siUnit(d: Dim): string {
  const parts: [string, number][] = [];
  if (d[1] === 1 && d[2] === -2) parts.push(['N', 1], ['m', d[0] - 1], ['K', d[3]]);
  else parts.push(['kg', d[1]], ['m', d[0]], ['s', d[2]], ['K', d[3]]);
  const pos = parts.filter(p => p[1] > 0).map(([u, e]) => u + (e === 1 ? '' : sup(e)));
  const neg = parts.filter(p => p[1] < 0).map(([u, e]) => u + (e === -1 ? '' : sup(-e)));
  if (!pos.length && !neg.length) return '';
  const num = pos.length ? pos.join('·') : '1';
  if (!neg.length) return num;
  return num + '/' + (neg.length > 1 ? '(' + neg.join('·') + ')' : neg[0]);
}

const fmtDim = (d: Dim) => '[' + d.map(x => minus(String(x))).join(', ') + ']';

// ---------- Parser ----------

interface UnitPart { name: string; exp: number; def: AtomDef }
export interface UnitInfo {
  factor: number;
  dim: Dim;
  /** Sauber geschrieben, z. B. "kN/cm²" */
  text: string;
  parts: UnitPart[];
}
interface Quantity { v: number; dim: Dim }
interface Literal { num: number; unit: UnitInfo | null }
interface Op { a: Quantity; op: string; b: Quantity; r: Quantity }

/** Einen Buchstabenblock wie "kNm" in bekannte Einheiten zerlegen (längste zuerst, mit Rückverfolgung) */
function segment(run: string): string[] | null {
  if (run === '') return [];
  for (let len = Math.min(run.length, MAX_ATOM); len > 0; len--) {
    const head = run.slice(0, len);
    if (!ATOMS.has(head)) continue;
    const rest = segment(run.slice(len));
    if (rest) return [head, ...rest];
  }
  return null;
}

/** Vorschlag bei falscher Gross-/Kleinschreibung, z. B. "KN" → "kN" */
function suggest(run: string): string | null {
  const lower = new Map<string, string>();
  for (const k of ATOMS.keys()) if (!lower.has(k.toLowerCase())) lower.set(k.toLowerCase(), k);
  // häufige Einheiten zuerst, damit "mm" vor "Mm" und "kn" → "kN" kommt
  for (const k of ['mm', 'm', 'kN', 'N', 'MPa', 'kPa', 'Pa', 'kg', 'cm', 'MN', 'K']) lower.set(k.toLowerCase(), k);
  const seg = (s: string): string[] | null => {
    if (s === '') return [];
    for (let len = Math.min(s.length, MAX_ATOM); len > 0; len--) {
      const hit = lower.get(s.slice(0, len).toLowerCase());
      if (!hit) continue;
      const rest = seg(s.slice(len));
      if (rest) return [hit, ...rest];
    }
    return null;
  };
  const r = seg(run);
  return r && r.join('') !== run ? r.join('') : null;
}

class Parser {
  s: string;
  i = 0;
  lits: Literal[] = [];
  ops: Op[] = [];
  parens = false;
  angle = false;
  celsius = false;

  constructor(s: string) {
    this.s = s;
  }

  ws() {
    while (this.i < this.s.length && /\s/.test(this.s.charAt(this.i))) this.i++;
  }
  peek(): string {
    this.ws();
    return this.s.charAt(this.i);
  }

  /** Ganzer Ausdruck bis zum Ende */
  parseAll(): Quantity {
    if (this.peek() === '') throw new InputError('Wert fehlt, z. B. «12.5 kN/cm2 in MPa».');
    const q = this.expr();
    const c = this.peek();
    if (c !== '') throw new InputError(this.unexpected(c));
    return q;
  }

  /** Nur eine Einheit (für die Zieleinheit) */
  parseUnitOnly(): UnitInfo {
    this.ws();
    const u = this.unitTail();
    if (!u || this.peek() !== '') throw new InputError(`Zieleinheit «${this.s.trim()}» nicht verstanden. Beispiel: «in MPa».`);
    return u;
  }

  unexpected(c: string): string {
    if (c === "'" || c === '’') return 'Tausender-Apostroph nur zwischen Dreiergruppen, z. B. «1\'250».';
    if (c === ')') return 'Zu viele schliessende Klammern.';
    if (c === ':') return 'Verhältnis 1:n nur für Neigungen, z. B. «1:20 in %».';
    if (/\d/.test(c)) return 'Zahl an unerwarteter Stelle. Rechenzeichen (* / + −) zwischen den Grössen?';
    return `Unerwartetes Zeichen «${c}».`;
  }

  expr(): Quantity {
    let q = this.term();
    for (;;) {
      const c = this.peek();
      if (c !== '+' && c !== '-') return q;
      this.i++;
      const b = this.term();
      if (!dimEq(q.dim, b.dim)) {
        throw new InputError(`${c === '+' ? 'Addition' : 'Subtraktion'} nur bei gleicher Dimension (${siUnit(q.dim) || 'Zahl'} ${c} ${siUnit(b.dim) || 'Zahl'}).`);
      }
      const r = { v: c === '+' ? q.v + b.v : q.v - b.v, dim: q.dim };
      this.ops.push({ a: q, op: c, b, r });
      q = r;
    }
  }

  term(): Quantity {
    let q = this.unary();
    for (;;) {
      const c = this.peek();
      if (c !== '*' && c !== '·' && c !== '/') return q;
      this.i++;
      const b = this.unary();
      let r: Quantity;
      if (c === '/') {
        if (b.v === 0) throw new InputError('Division durch null.');
        r = { v: q.v / b.v, dim: dimAdd(q.dim, b.dim, -1) };
      } else r = { v: q.v * b.v, dim: dimAdd(q.dim, b.dim) };
      this.ops.push({ a: q, op: c === '/' ? '/' : '·', b, r });
      q = r;
    }
  }

  unary(): Quantity {
    const c = this.peek();
    if (c === '-' || c === '+') {
      this.i++;
      const q = this.unary();
      return c === '-' ? { v: -q.v, dim: q.dim } : q;
    }
    return this.primary();
  }

  primary(): Quantity {
    const c = this.peek();
    if (c === '(') {
      this.i++;
      this.parens = true;
      const q = this.expr();
      if (this.peek() !== ')') throw new InputError('Schliessende Klammer fehlt.');
      this.i++;
      const u = this.unitTail();
      return u ? { v: q.v * u.factor, dim: dimAdd(q.dim, u.dim) } : q;
    }
    const n = this.number();
    if (n !== null) {
      let num = n;
      if (this.peek() === '^') {
        const m = /^\^\s*([+-]?\d+)/.exec(this.s.slice(this.i));
        if (!m) throw new InputError('Nach ^ wird eine ganze Zahl erwartet, z. B. «10^6».');
        this.i += m[0].length;
        num = num ** Number(m[1]);
      }
      const u = this.unitTail();
      this.lits.push({ num, unit: u });
      return u ? { v: num * u.factor, dim: u.dim } : { v: num, dim: ZERO };
    }
    const u = this.unitTail();
    if (u) {
      this.lits.push({ num: 1, unit: u });
      return { v: u.factor, dim: u.dim };
    }
    if (c === '') throw new InputError('Ausdruck unvollständig.');
    throw new InputError(this.unexpected(c));
  }

  /** Zahl mit Dezimalpunkt oder -komma, Tausender-Apostroph (1'250,5) und Exponent (1.2e3) */
  number(): number | null {
    this.ws();
    const m = /^(?=[.,]?\d)(?:\d{1,3}(?:['’ʼ]\d{3})+|\d+)?(?:[.,]\d+)?(?:[eE][+-]?\d+)?/.exec(this.s.slice(this.i));
    if (!m || m[0] === '') return null;
    this.i += m[0].length;
    return parseFloat(m[0].replace(/['’ʼ]/g, '').replace(',', '.'));
  }

  /** Einheit nach einer Zahl: Blöcke wie "kN", "cm2", verbunden mit / * · oder Leerzeichen */
  unitTail(): UnitInfo | null {
    const start = this.i;
    this.ws();
    if (!isUnitStart(this.s.charAt(this.i))) {
      this.i = start;
      return null;
    }
    const u: UnitInfo = { factor: 1, dim: [...ZERO], text: '', parts: [] };
    this.group(u, 1, '');
    for (;;) {
      const save = this.i;
      this.ws();
      const c = this.s.charAt(this.i);
      if (c === '/' || c === '*' || c === '·') {
        this.i++;
        this.ws();
        if (!isUnitStart(this.s.charAt(this.i))) {
          this.i = save; // Rechenzeichen zwischen Grössen, z. B. "3.5 kN/m * 6 m"
          break;
        }
        this.group(u, c === '/' ? -1 : 1, c === '/' ? '/' : '·');
      } else if (isUnitStart(c)) {
        this.group(u, 1, this.i > save ? '·' : '');
      } else {
        this.i = save;
        break;
      }
    }
    return u;
  }

  /** Ein Buchstabenblock mit Exponent, z. B. "kNm", "cm2", "m^-1", "mm⁴" */
  group(u: UnitInfo, sign: number, sep: string) {
    const c = this.s.charAt(this.i);
    if (c === '%' || c === '‰') throw new InputError(`${c} nur für Neigungen, z. B. «5 % in °».`);
    let run = '';
    while (this.i < this.s.length && isRunChar(this.s.charAt(this.i))) run += this.s.charAt(this.i++);
    const names = segment(run);
    // Temperatur nur als eigener Block (m·K, 1/K), sonst wäre "KN" = Kelvin · Newton
    if (!names || (names.length > 1 && names.some(n => ATOMS.get(n)?.temp))) {
      const s = suggest(run);
      throw new InputError(`Unbekannte Einheit «${run}».` + (s ? ` Gross-/Kleinschreibung beachten: meinten Sie «${s}»?` : ''));
    }
    // Exponent: ^2, ^-1, ², ⁻¹ oder Ziffern direkt nach den Buchstaben (m2)
    let exp = 1;
    let m = /^\^\s*([+-]?\d+)/.exec(this.s.slice(this.i)) || /^([⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(this.s.slice(this.i)) || /^(\d+)(?![.,]\d)/.exec(this.s.slice(this.i));
    if (m) {
      this.i += m[0].length;
      exp = Number(m[1].replace(/./g, ch => UNSUP[ch] ?? ch));
      if (!exp) throw new InputError(`Exponent 0 bei «${run}» ergibt keine Einheit.`);
    }
    names.forEach((name, k) => {
      const d = ATOMS.get(name) as AtomDef;
      const e = sign * (k === names.length - 1 ? exp : 1); // Exponent gilt für die letzte Einheit des Blocks
      u.factor *= d.factor ** e;
      u.dim = dimAdd(u.dim, d.dim, e);
      u.parts.push({ name, exp: e, def: d });
      if (d.angle) this.angle = true;
      if (d.offset) this.celsius = true;
    });
    const shown = run.replace('degC', '°C').replace('℃', '°C');
    u.text += sep + shown + (exp === 1 ? '' : sup(exp));
  }
}

// Einheit aus einem Text (z. B. "kN/m²"), mit Zwischenspeicher
const unitCache = new Map<string, UnitInfo>();
export function parseUnit(text: string): UnitInfo {
  let u = unitCache.get(text);
  if (!u) {
    u = new Parser(normalize(text)).parseUnitOnly();
    unitCache.set(text, u);
  }
  return u;
}

/** Ausdruck auswerten: Wert in SI-Basiseinheiten und Dimension */
export function evaluate(text: string): { value: number; dim: Dim } {
  const q = new Parser(normalize(text)).parseAll();
  return { value: q.v, dim: q.dim };
}

/** Zahl lesen wie im Eingabefeld (Dezimalkomma, Tausender-Apostroph), null wenn ungültig */
export function parseNumber(text: string): number | null {
  const p = new Parser(normalize(text));
  const n = p.number();
  return n !== null && p.peek() === '' ? n : null;
}

// ---------- Kategorien ----------

interface Category {
  name: string;
  /** Anzeige-Reihenfolge */
  units: string[];
  /** Reihenfolge für das Hauptresultat ohne Zieleinheit */
  prefer?: string[];
  /** Passt die eingegebene Einheit besonders zu dieser Kategorie (bei gleicher Dimension)? */
  match?: (unit: string) => boolean;
  hint?: string;
  /** Verwandte Kategorie über g (Masse ↔ Kraft) */
  viaG?: { name: string; units: string[] };
}

const CATEGORIES: Category[] = [
  { name: 'Kraft', units: ['N', 'kN', 'MN'], prefer: ['kN', 'N', 'MN'], viaG: { name: 'Masse', units: ['kg', 't'] } },
  { name: 'Masse', units: ['kg', 't'], viaG: { name: 'Gewichtskraft', units: ['N', 'kN', 'MN'] } },
  {
    name: 'Linienlast / Federsteifigkeit', units: ['N/m', 'kN/m', 'N/mm', 'MN/m'], prefer: ['kN/m', 'N/mm', 'MN/m', 'N/m'],
    hint: 'kN/m kann eine Linienlast oder eine Federsteifigkeit sein. Die Umrechnung ist dieselbe (1 kN/m = 1 N/mm).'
  },
  {
    name: 'Flächenlast / Spannung', units: ['Pa', 'kPa', 'MPa', 'N/m²', 'kN/m²', 'N/mm²', 'kN/cm²', 'bar'],
    prefer: ['MPa', 'kN/m²', 'kN/cm²', 'N/mm²', 'kPa', 'bar', 'N/m²', 'Pa'],
    hint: 'kN/m² und MPa haben dieselbe Dimension: Flächenlast oder Spannung (1 kN/m² = 0.001 MPa).',
    viaG: { name: 'Masse pro Fläche', units: ['kg/m²'] }
  },
  {
    name: 'Rotationsfeder', units: ['Nmm/rad', 'kNm/rad', 'MNm/rad'], prefer: ['kNm/rad', 'MNm/rad', 'Nmm/rad'],
    match: u => u.includes('rad'),
    hint: 'rad ist dimensionslos: kNm/rad hat dieselbe Dimension wie ein Moment (kNm). Die Bedeutung ergibt sich aus der Eingabe.'
  },
  {
    name: 'Moment / Energie', units: ['Nmm', 'Nm', 'kNcm', 'kNm'], prefer: ['kNm', 'kNcm', 'Nm', 'Nmm'],
    hint: 'kNm kann ein Moment oder eine Energie (Arbeit) sein: 1 kNm = 1 kJ.'
  },
  {
    name: 'Bewehrung pro Meter', units: ['mm²/m', 'cm²/m'], prefer: ['cm²/m', 'mm²/m'],
    match: u => u.includes('/'),
    hint: 'Bewehrung pro Meter hat die Dimension einer Länge (1 cm²/m = 0.1 mm).'
  },
  { name: 'Länge', units: ['mm', 'cm', 'm'], prefer: ['m', 'mm', 'cm'] },
  { name: 'Fläche', units: ['mm²', 'cm²', 'm²'], prefer: ['cm²', 'mm²', 'm²'] },
  {
    name: 'Volumen / Widerstandsmoment', units: ['mm³', 'cm³', 'm³', 'l'], prefer: ['cm³', 'mm³', 'm³', 'l'],
    hint: 'mm³ kann ein Volumen, ein Widerstandsmoment oder ein statisches Moment sein.'
  },
  { name: 'Trägheitsmoment', units: ['mm⁴', 'cm⁴', 'm⁴'], prefer: ['cm⁴', 'mm⁴', 'm⁴'] },
  { name: 'Dichte', units: ['kg/m³', 't/m³'], viaG: { name: 'Wichte', units: ['kN/m³'] } },
  {
    name: 'Wichte / Bettungsmodul', units: ['kN/m³', 'MN/m³'],
    hint: 'kN/m³ kann eine Wichte oder ein Bettungsmodul sein (1 MN/m³ = 1000 kN/m³).',
    viaG: { name: 'Dichte', units: ['kg/m³', 't/m³'] }
  },
  { name: 'Masse pro Fläche', units: ['kg/m²', 't/m²'], viaG: { name: 'Flächenlast', units: ['kN/m²'] } },
  { name: 'Masse pro Länge', units: ['kg/m', 't/m'], viaG: { name: 'Linienlast', units: ['kN/m'] } },
  { name: 'Temperaturdifferenz', units: ['K', '°C'] },
  { name: 'Beschleunigung', units: ['m/s²'] }
];

const catDim = (c: Category) => parseUnit(c.units[0]).dim;

function findCategory(dim: Dim, unitText: string | null): Category | null {
  const cands = CATEGORIES.filter(c => dimEq(catDim(c), dim));
  if (!cands.length) return null;
  if (unitText) {
    const hit = cands.find(c => c.units.includes(unitText)) || cands.find(c => c.match && c.match(unitText));
    if (hit) return hit;
  }
  return cands.find(c => !c.match) || cands[0];
}
const categoryName = (dim: Dim, unitText: string | null) =>
  findCategory(dim, unitText)?.name || (isZero(dim) ? 'Zahl ohne Einheit' : siUnit(dim));

// ---------- Umrechnen ----------

const near = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));

function makeRow(unit: string, value: number, sig: number, input = false): Row {
  const f = formatNumber(value, sig);
  const sep = unit === '' || unit.startsWith('°') && unit !== '°C' ? '' : ' ';
  return { unit, value, text: f.text, copy: f.plain + sep + unit, display: f.text + sep + unit, input };
}

/** Wert (SI) in eine Zieleinheit; über g, falls sich die Dimensionen genau um g unterscheiden */
function toUnit(si: number, dim: Dim, target: UnitInfo, g: number): { value: number; g: number | null } | null {
  if (dimEq(dim, target.dim)) return { value: si / target.factor, g: null };
  if (dimEq(dimAdd(dim, G_DIM), target.dim)) return { value: (si * g) / target.factor, g };       // Masse → Kraft
  if (dimEq(dimAdd(dim, G_DIM, -1), target.dim)) return { value: si / g / target.factor, g };     // Kraft → Masse
  return null;
}

const gText = (g: number) => `g = ${formatNumber(g, 6).text} m/s²`;

/**
 * Haupteinstieg: Text auswerten.
 * Gibt null zurück, wenn das Feld leer ist; sonst Resultat oder Fehlermeldung.
 */
export function convert(input: string, opts: Options = {}): Outcome | null {
  const g = opts.g && opts.g > 0 && isFinite(opts.g) ? opts.g : G_DEFAULT;
  const sig = Math.min(15, Math.max(1, Math.round(opts.sig ?? SIG_DEFAULT)));
  const s = normalize(input).trim();
  if (!s) return null;
  try {
    const { lhs, target } = splitTarget(s);
    if (!lhs) throw new InputError('Wert fehlt, z. B. «12.5 kN/cm2 in MPa».');
    const slope = parseSlope(lhs);
    if (slope) return convertSlope(slope, target, sig);
    if (target !== null && parseSlopeTarget(target)) throw new InputError(`In ${target} lassen sich nur Neigungen umrechnen (°, rad, %, ‰, 1:n).`);
    return convertUnits(lhs, target, g, sig);
  } catch (e) {
    if (e instanceof InputError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Eingabe und Zieleinheit trennen: "in", "to", "->", "→", "=>". Halb getippt ("12 kN i") zählt als ohne Ziel. */
function splitTarget(s: string): { lhs: string; target: string | null } {
  const m = /(?:^|\s+)(?:in|to)(?:\s+|$)|\s*(?:->|→|=>)\s*/.exec(s);
  if (!m) {
    const partial = /\s+(?:i|-|=)$/.exec(s); // nicht "t": das ist die Tonne
    return { lhs: (partial ? s.slice(0, partial.index) : s).trim(), target: null };
  }
  const lhs = s.slice(0, m.index).trim();
  const target = s.slice(m.index + m[0].length).trim();
  return { lhs, target: target === '' ? null : target };
}

// ---------- Allgemeine Einheiten und Temperatur ----------

function convertUnits(lhs: string, targetText: string | null, g: number, sig: number): Success {
  // Temperaturdifferenz: "Δ20 °C", "ΔT 20 °C", "dT 20 °C"
  const dm = /^(?:[Δ∆]T?|dT(?=[\s\d.,+-]))\s*/.exec(lhs);
  const delta = !!dm;
  const expr = dm ? lhs.slice(dm[0].length) : lhs;
  if (targetText !== null && /^[Δ∆]/.test(targetText)) targetText = targetText.replace(/^[Δ∆]T?\s*/, '');

  const p = new Parser(expr);
  const q = p.parseAll();
  // Genau eine Zahl mit Einheit (ohne Rechnung); Vorzeichen aus dem Ergebnis, weil "-" nicht zur Zahl gehört
  const lit = p.lits.length === 1 && p.ops.length === 0 && !p.parens ? p.lits[0] : null;
  const single = lit ? { num: lit.unit ? q.v / lit.unit.factor : q.v, unit: lit.unit } : null;
  const inUnit = single && single.unit ? single.unit : null;
  const target = targetText !== null ? new Parser(targetText).parseUnitOnly() : null;
  const steps: string[] = [];
  const hints: string[] = [];
  const sx = (v: number) => formatNumber(v, Math.max(6, sig)).text;

  // Absolute Temperatur: genau eine Zahl mit °C oder K
  const pureTemp = (u: UnitInfo | null) => !!u && u.parts.length === 1 && u.parts[0].exp === 1 && !!u.parts[0].def.temp;
  if (!delta && single && pureTemp(inUnit)) {
    const u = inUnit as UnitInfo;
    const c = !!u.parts[0].def.offset;
    const kelvin = c ? single.num + 273.15 : single.num;
    if (kelvin < -1e-9) throw new InputError('Unter dem absoluten Nullpunkt (0 K = −273.15 °C).');
    if (target && !pureTemp(target)) {
      if (dimEq(target.dim, u.dim)) throw new InputError('Absolute Temperaturen nur in °C oder K. Für Differenzen Δ voranstellen, z. B. «Δ20 °C».');
      throw new InputError(`${u.text} und ${target.text} sind nicht kompatibel (Temperatur ≠ ${categoryName(target.dim, target.text)}).`);
    }
    // mindestens zwei Nachkommastellen, sonst ginge die Verschiebung 273.15 in der Rundung unter
    const tsig = (v: number) => Math.max(sig, Math.floor(Math.log10(Math.abs(v) || 1)) + 3);
    const rows = [makeRow('°C', kelvin - 273.15, tsig(kelvin - 273.15), c), makeRow('K', kelvin, tsig(kelvin), !c)];
    const toC = target ? !!target.parts[0].def.offset : !c;
    const main = rows[toC ? 0 : 1];
    const inText = formatNumber(single.num, 15).text + ' ' + u.text;
    steps.push(c ? `T = ${inText} + 273.15 = ${sx(kelvin)} K` : `T = ${inText}`);
    if (toC) steps.push(`T = ${sx(kelvin)} K − 273.15 = ${sx(kelvin - 273.15)} °C`);
    hints.push(`Absolute Temperatur. Als Temperaturdifferenz gilt 1 K = 1 °C: für Differenzen Δ voranstellen, z. B. «Δ${formatNumber(single.num, sig).plain} ${u.text} in K».`);
    return {
      ok: true, kind: 'temp', input: inText, main, mainG: null, category: 'Temperatur',
      groups: target ? [] : [{ title: 'Temperatur', rows }], hints, steps, si: kelvin, dim: u.dim
    };
  }
  if (p.celsius && !delta) hints.push('°C in Rechnungen und zusammengesetzten Einheiten als Temperaturdifferenz gerechnet (1 °C = 1 K).');
  if (delta && q.dim[3] === 0) throw new InputError('Δ nur vor Temperaturen, z. B. «Δ20 °C».');

  // Rechenweg: Einheiten, Grössen, Rechenschritte
  const si = siUnit(q.dim);
  const qText = (x: Quantity) => (sx(x.v) + ' ' + siUnit(x.dim)).trim();
  const seen = new Set<string>();
  for (const l of p.lits) {
    if (!l.unit || seen.has(l.unit.text)) continue;
    seen.add(l.unit.text);
    const us = siUnit(l.unit.dim);
    steps.push(`${l.unit.text} = ${formatFactor(l.unit.factor)}${us ? ' ' + us : ''}   Dimension [m, kg, s, K] = ${fmtDim(l.unit.dim)}`);
  }
  for (const l of p.lits) {
    if (l.unit && !near(l.unit.factor, 1)) steps.push(`${sx(l.num)} ${l.unit.text} = ${qText({ v: l.num * l.unit.factor, dim: l.unit.dim })}`);
  }
  for (const o of p.ops) steps.push(`${qText(o.a)} ${o.op} ${qText(o.b)} = ${qText(o.r)}`);

  const inputText = single
    ? (formatNumber(single.num, 15).text + (inUnit ? ' ' + inUnit.text : '')).trim()
    : expr.replace(/\s+/g, ' ');
  const shownInput = (delta ? 'Δ' : '') + inputText;
  const cat = findCategory(q.dim, inUnit ? inUnit.text : null);
  if (cat?.hint) hints.push(cat.hint);
  else if (p.angle && !isZero(q.dim)) hints.push('rad und ° sind dimensionslos und fallen bei der Umrechnung weg.');

  // Mit Zieleinheit
  if (target) {
    const r = toUnit(q.v, q.dim, target, g);
    if (!r) {
      const src = inUnit ? inUnit.text : si || 'Zahl ohne Einheit';
      const a = categoryName(q.dim, inUnit ? inUnit.text : null);
      const b = categoryName(target.dim, target.text);
      throw new InputError(`${src} und ${target.text} sind nicht kompatibel` + (a !== b ? ` (${a} ≠ ${b}).` : '.'));
    }
    const main = makeRow(target.text, r.value, sig);
    if (r.g) {
      const viaSi = q.v * (dimEq(dimAdd(q.dim, G_DIM), target.dim) ? r.g : 1 / r.g);
      const tdim = target.dim;
      steps.push(dimEq(dimAdd(q.dim, G_DIM), target.dim)
        ? `Masse → Kraft mit ${gText(r.g)}: ${qText(q)} · ${formatNumber(r.g, 6).text} m/s² = ${qText({ v: viaSi, dim: tdim })}`
        : `Kraft → Masse mit ${gText(r.g)}: ${qText(q)} / ${formatNumber(r.g, 6).text} m/s² = ${qText({ v: viaSi, dim: tdim })}`);
      if (!near(target.factor, 1)) steps.push(`${qText({ v: viaSi, dim: tdim })} / ${formatFactor(target.factor)} = ${main.text} ${target.text}`);
    } else if (!near(target.factor, 1) || target.text !== si) {
      steps.push(`${qText(q)} / ${formatFactor(target.factor)} = ${main.text} ${target.text}`);
    }
    if (delta) hints.unshift('Temperaturdifferenz: 1 K = 1 °C.');
    return {
      ok: true, kind: 'unit', input: shownInput, main, mainG: r.g, category: cat ? cat.name : categoryName(q.dim, null),
      groups: [], hints, steps, si: q.v, dim: q.dim
    };
  }

  // Ohne Zieleinheit: Liste der Kategorie, Hauptresultat in einer passenden Einheit
  const groups: Group[] = [];
  let main: Row;
  if (cat) {
    const rows = cat.units.map(u => makeRow(u, q.v / parseUnit(u).factor, sig, !!inUnit && inUnit.text === u));
    groups.push({ title: delta ? 'Temperaturdifferenz ΔT' : cat.name, rows });
    if (cat.viaG) {
      const gRows = cat.viaG.units.flatMap(u => {
        const r = toUnit(q.v, q.dim, parseUnit(u), g);
        return r ? [makeRow(u, r.value, sig)] : [];
      });
      groups.push({ title: `${cat.viaG.name} (mit ${gText(g)})`, rows: gRows, g });
    }
    const pref = (cat.prefer || cat.units).map(u => ({ u, f: parseUnit(u).factor }))
      .filter(c => !inUnit || p.ops.length || !near(c.f, inUnit.factor));
    const inRange = pref.find(c => {
      const v = Math.abs(q.v / c.f);
      return q.v === 0 || (v >= 1 && v < 10000);
    });
    const pick = inRange || pref[0] || { u: cat.units[0], f: parseUnit(cat.units[0]).factor };
    main = makeRow(pick.u, q.v / pick.f, sig);
    if (!near(pick.f, 1) || pick.u !== si) steps.push(`${qText(q)} / ${formatFactor(pick.f)} = ${main.text} ${pick.u}`);
  } else {
    main = makeRow(si, q.v, sig);
    groups.push({ title: isZero(q.dim) ? 'Zahl ohne Einheit' : 'SI-Einheiten', rows: [main] });
  }
  if (delta) hints.unshift('Temperaturdifferenz: 1 K = 1 °C.');
  return {
    ok: true, kind: 'unit', input: shownInput, main, mainG: null, category: cat ? cat.name : categoryName(q.dim, null),
    groups, hints, steps, si: q.v, dim: q.dim
  };
}

// ---------- Neigung (nichtlinear über tan) ----------

type SlopeUnit = 'deg' | 'rad' | '%' | '‰' | 'ratio';
interface Slope { t: number; from: SlopeUnit; text: string }

const SLOPE_UNITS: Record<string, SlopeUnit> = { '°': 'deg', Grad: 'deg', grad: 'deg', deg: 'deg', rad: 'rad', '%': '%', '‰': '‰' };

function parseSlopeTarget(t: string): SlopeUnit | null {
  const s = t.replace(/\s+/g, '');
  if (/^(?:1:[nx]?|:|1:n)$/i.test(s)) return 'ratio';
  return SLOPE_UNITS[s] || null;
}

/** Neigung erkennen: "30°", "30 Grad", "0.5 rad", "5 %", "12 ‰", "1:20" */
function parseSlope(lhs: string): Slope | null {
  const m = /^(.*?)\s*(°|Grad|grad|deg|rad|%|‰)$/.exec(lhs);
  if (m && !/[A-Za-z]$/.test(m[1])) {
    const n = parseSigned(m[1]);
    if (n === null) return null;
    const from = SLOPE_UNITS[m[2]];
    let t: number;
    if (from === 'deg' || from === 'rad') {
      const a = from === 'deg' ? (n * Math.PI) / 180 : n;
      if (Math.abs(a) >= Math.PI / 2 - 1e-12) throw new InputError('Neigungswinkel nur zwischen −90° und 90°.');
      t = Math.tan(a);
    } else t = from === '%' ? n / 100 : n / 1000;
    const unit = m[2] === 'grad' || m[2] === 'Grad' || m[2] === 'deg' ? '°' : m[2];
    return { t, from, text: formatNumber(n, 15).text + (unit === '°' ? '°' : ' ' + unit) };
  }
  const r = /^([^:]+):([^:]+)$/.exec(lhs);
  if (r) {
    const a = parseSigned(r[1]);
    const b = parseSigned(r[2]);
    if (a === null || b === null) throw new InputError('Verhältnis als «1:n» eingeben, z. B. «1:20».');
    if (b === 0) throw new InputError('Bei 1:n darf n nicht 0 sein.');
    return { t: a / b, from: 'ratio', text: `${formatNumber(a, 15).text} : ${formatNumber(b, 15).text}` };
  }
  return null;
}
function parseSigned(s: string): number | null {
  const m = /^\s*([+-]?)\s*(.*?)\s*$/.exec(s);
  if (!m) return null;
  const n = parseNumber(m[2]);
  return n === null ? null : m[1] === '-' ? -n : n;
}

function convertSlope(sl: Slope, targetText: string | null, sig: number): Success {
  const target = targetText === null ? null : parseSlopeTarget(targetText);
  if (targetText !== null && !target) {
    throw new InputError(`Neigung lässt sich nur in °, rad, %, ‰ oder 1:n umrechnen, nicht in «${targetText}».`);
  }
  const a = Math.atan(sl.t);
  const deg = (a * 180) / Math.PI;
  const ratioRow = (): Row => {
    if (sl.t === 0) return { unit: '1:n', value: Infinity, text: '1 : ∞', copy: '1:∞', display: '1 : ∞', input: sl.from === 'ratio' };
    const f = formatNumber(1 / sl.t, sig);
    return { unit: '1:n', value: 1 / sl.t, text: '1 : ' + f.text, copy: '1:' + f.plain, display: '1 : ' + f.text, input: sl.from === 'ratio' };
  };
  const rows: Record<SlopeUnit, Row> = {
    deg: makeRow('°', deg, sig, sl.from === 'deg'),
    '%': makeRow('%', sl.t * 100, sig, sl.from === '%'),
    '‰': makeRow('‰', sl.t * 1000, sig, sl.from === '‰'),
    ratio: ratioRow(),
    rad: makeRow('rad', a, sig, sl.from === 'rad')
  };
  rows.deg.copy = formatNumber(deg, sig).plain + '°';
  const mainKey: SlopeUnit = target || (sl.from === 'deg' || sl.from === 'rad' ? '%' : 'deg');
  const sx = (v: number) => formatNumber(v, Math.max(6, sig)).text;
  const steps: string[] = [];
  if (sl.from === 'deg' || sl.from === 'rad') steps.push(`tan α = tan(${sl.text}) = ${sx(sl.t)}`);
  else if (sl.from === 'ratio') steps.push(`tan α = ${sl.text.replace(' : ', ' / ')} = ${sx(sl.t)}`);
  else steps.push(`tan α = ${sl.text} / ${sl.from === '%' ? 100 : 1000} = ${sx(sl.t)}`);
  steps.push(`α = arctan(${sx(sl.t)}) = ${sx(deg)}° = ${sx(a)} rad`);
  steps.push(`Neigung = 100 · tan α = ${sx(sl.t * 100)} %`);
  if (sl.t !== 0) steps.push(`1 : n mit n = 1 / tan α = ${sx(1 / sl.t)}`);
  return {
    ok: true, kind: 'slope', input: sl.text, main: rows[mainKey], mainG: null, category: 'Neigung',
    groups: target ? [] : [{ title: 'Neigung', rows: [rows.deg, rows['%'], rows['‰'], rows.ratio, rows.rad] }],
    hints: ['Neigung und Winkel hängen über tan zusammen, nicht linear: 100 % = 45°.'],
    steps, si: sl.t, dim: [...ZERO]
  };
}

/** Kategorien für die Übersicht auf der Seite (Name und Einheiten) */
export const categories = (): { name: string; units: string[] }[] => [
  ...CATEGORIES.filter(c => c.name !== 'Masse pro Länge').map(c => ({ name: c.name, units: c.units })),
  { name: 'Temperatur (absolut)', units: ['°C', 'K'] },
  { name: 'Neigung', units: ['°', '%', '‰', '1:n', 'rad'] }
];

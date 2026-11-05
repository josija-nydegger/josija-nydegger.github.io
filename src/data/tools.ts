// Liste der Tools für /tools/ und /en/tools/ (neueste zuerst).
// Neues Tool: Ordner public/tools/<name>/index.html ablegen (ohne Front Matter) und hier oben einen Eintrag ergänzen.
import type { Lang } from './i18n';

type Tool = {
  url: string;
  year: number;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  tags: Record<Lang, string[]>;
};

export const tools: Tool[] = [
  {
    url: '/tools/einheiten/',
    year: 2026,
    title: {
      de: 'Einheiten-Umrechner',
      en: 'Unit converter'
    },
    description: {
      de: 'Einheiten aus dem Bauingenieurwesen umrechnen und mit ihnen rechnen: Kräfte, Lasten, Spannungen, Momente, Querschnittswerte, Bewehrung aus Ø und Abstand, Bettung, Bauphysik und Energie, Durchfluss, Neigung und Temperatur, Masse in Kraft mit wählbarem g. Eingabe als Text, offline als App installierbar.',
      en: 'Convert and calculate with structural engineering units: forces, loads, stresses, moments, section properties, reinforcement from bar diameter and spacing, subgrade moduli, building physics and energy, flow rate, slope and temperature, mass to force with selectable g. Free-text input, installable as an offline app.'
    },
    tags: {
      de: ['Einheiten', 'Statik', 'App'],
      en: ['Units', 'Structural analysis', 'App']
    }
  },
  {
    url: '/tools/lastkombinationen/',
    year: 2026,
    title: {
      de: 'Lastkombinationen (SIA 260)',
      en: 'Load combinations (SIA 260)'
    },
    description: {
      de: 'Lastkombinationen nach SIA 260:2013 für Tragsicherheit (Typ 2) und Gebrauchstauglichkeit: massgebende Bemessungslast aus ständigen und veränderlichen Einwirkungen, Schneelast nach SIA 261, mit Rechenweg und Übergabe ans Balken-Tool.',
      en: 'Load combinations to SIA 260:2013 for ultimate limit state (type 2) and serviceability: governing design load from permanent and variable actions, snow load to SIA 261, with step-by-step calculation and transfer to the beam tool.'
    },
    tags: {
      de: ['Einwirkungen', 'Bemessung', 'SIA 260'],
      en: ['Actions', 'Design', 'SIA 260']
    }
  },
  {
    url: '/tools/biegebemessung/',
    year: 2026,
    title: {
      de: 'Biegebemessung Rechteckquerschnitt (SIA 262)',
      en: 'Bending design of rectangular sections (SIA 262)'
    },
    description: {
      de: 'Erforderliche Biegebewehrung eines Stahlbeton-Rechteckquerschnitts nach SIA 262:2025, mit Druck- und Mindestbewehrung, Stabwahl, Biegewiderstand, x/d-Ampel und Rechenweg.',
      en: 'Required flexural reinforcement of a rectangular reinforced concrete section to SIA 262:2025, with compression and minimum reinforcement, bar selection, bending resistance, x/d check and step-by-step calculation.'
    },
    tags: {
      de: ['Stahlbeton', 'Bemessung', 'SIA 262'],
      en: ['Reinforced concrete', 'Design', 'SIA 262']
    }
  },
  {
    url: '/tools/balken/',
    year: 2026,
    title: {
      de: 'Balken mit Auskragung',
      en: 'Overhanging beam'
    },
    description: {
      de: 'Querkraft, Biegemoment, Durchbiegung und Auflagerkräfte für Einfeld- und Durchlaufträger mit Kragarmen, Punkt- und Linienlasten, mit Rechenweg.',
      en: 'Shear force, bending moment, deflection and support reactions for simply supported and continuous beams with cantilevers under point and line loads, with step-by-step calculation.'
    },
    tags: {
      de: ['Statik', 'Träger', 'Durchbiegung'],
      en: ['Structural analysis', 'Beams', 'Deflection']
    }
  },
  {
    url: '/tools/querschnittswerte/',
    year: 2026,
    title: {
      de: 'Querschnittswerte',
      en: 'Section properties'
    },
    description: {
      de: 'Fläche, Schwerpunkt, Trägheits- und Widerstandsmomente (elastisch und plastisch) für Standard- und zusammengesetzte Querschnitte, mit Rechenweg.',
      en: 'Area, centroid, second moments of area and elastic and plastic section moduli for standard and composite sections, with step-by-step calculation.'
    },
    tags: {
      de: ['Statik', 'Querschnitte'],
      en: ['Structural analysis', 'Cross-sections']
    }
  }
];

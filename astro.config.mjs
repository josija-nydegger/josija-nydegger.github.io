// Einstellungen für Astro. Die Adressen sind dieselben wie früher unter Jekyll (siehe _notizen/astro-migration.md).
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkMathExtras from './src/lib/remark-math-extras.mjs';

export default defineConfig({
  site: 'https://josija-nydegger.ch',

  // Ausgabe spiegelt src/pages: cv.astro → /cv.html, en/index.astro → /en/index.html
  build: { format: 'preserve' },

  markdown: {
    // Wie bisher keine Farben für Code-Blöcke
    syntaxHighlight: false,
    // remark/rehype statt des neuen Standards Sätteri, weil es für KaTeX erprobte Plugins gibt.
    // Formeln (LaTeX) werden beim Build gesetzt: $…$ inline, $$…$$ als eigener Absatz.
    // Fehler in Formeln erscheinen rot, statt den Build abzubrechen.
    // Nach Änderungen an diesen Plugins den Cache löschen (Ordner .astro/), sonst bleiben alte Beiträge stehen.
    processor: unified({
      // Typografie wie bisher bei kramdown: -- → Halbgeviertstrich (–), --- → Geviertstrich (—)
      smartypants: { dashes: 'oldschool' },
      remarkPlugins: [remarkMath, remarkMathExtras],
      rehypePlugins: [[rehypeKatex, { throwOnError: false }]]
    })
  }
});

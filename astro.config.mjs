// Einstellungen für Astro. Alle Adressen bleiben wie unter Jekyll (siehe _notizen/astro-migration.md).
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://josija-nydegger.ch',

  // Ausgabe spiegelt src/pages: cv.astro → /cv.html, en/index.astro → /en/index.html
  build: { format: 'preserve' },

  markdown: {
    // Wie bisher keine Farben für Code-Blöcke
    syntaxHighlight: false
  }
});

// Grundeinstellungen der Website (bisher _config.yml).

export const site = {
  title: 'Josija Nydegger',
  // Untertitel für <title> der Startseiten, wie bisher immer Deutsch (siehe Befunde in _notizen/astro-migration.md)
  tagline: 'Bauingenieurwesen · BIM · Digital Construction',
  description: 'Persönliche Website von Josija Nydegger – Bauingenieurwesen an der BFH, Arbeiten, Projekte und Blog zu Tragwerken, BIM und Digital Construction.',
  url: 'https://josija-nydegger.ch',
  timezone: 'Europe/Zurich',

  // E-Mail-Adresse, Base64-kodiert, damit Bots sie im Quelltext nicht finden.
  // Wird erst im Browser per JavaScript zusammengesetzt (siehe src/layouts/Base.astro).
  // Neue Adresse kodieren z. B. mit: printf 'neue@adresse.ch' | base64
  emailB64: 'aGFsbG9Aam9zaWphLW55ZGVnZ2VyLmNo',

  author: {
    name: 'Josija Nydegger',
    url: 'https://josija-nydegger.ch'
  },

  social: [
    'https://www.linkedin.com/in/josija-nydegger',
    'https://github.com/josija-nydegger',
    'https://www.instagram.com/josija.nydegger',
    'https://www.strava.com/athletes/8047977',
    'https://orcid.org/0009-0005-4270-2574'
  ]
} as const;

/** Absolute Adresse aus einem Pfad, z. B. absoluteUrl('/cv.html') */
export const absoluteUrl = (path: string) => site.url + path;

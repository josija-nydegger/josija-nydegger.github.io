// Feste Texte für die gemeinsamen Layouts und Komponenten in beiden Sprachen (bisher _data/i18n.yml).
// Texte, die nur auf einer Seite vorkommen (z. B. Abschnittstitel), stehen direkt in der Seite.

export const langs = ['de', 'en'] as const;
export type Lang = (typeof langs)[number];

export const i18n = {
  de: {
    name: 'Deutsch',
    locale: 'de_CH',
    homeUrl: '/',
    feedUrl: '/feed.xml',
    feedTitle: 'Josija Nydegger – Blog',
    tagline: 'Bauingenieurwesen · BIM · Digital Construction',
    langLabel: 'Sprache',
    back: 'Zurück',
    blog: 'Blog',
    rssTitle: 'RSS-Feed abonnieren',
    noPosts: 'Die ersten Beiträge folgen bald.',
    // Blogbeitrag
    readingTime: 'Min. Lesezeit',
    postNav: 'Weitere Beiträge',
    prevPost: 'Vorheriger Beitrag',
    nextPost: 'Nächster Beitrag',
    // Hell / Dunkel / System
    themeLabel: 'Farbschema',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System'
  },
  en: {
    name: 'English',
    locale: 'en_US',
    homeUrl: '/en/',
    feedUrl: '/en/feed.xml',
    feedTitle: 'Josija Nydegger – Blog (English)',
    tagline: 'Civil Engineering · BIM · Digital Construction',
    langLabel: 'Language',
    back: 'Back',
    blog: 'Blog',
    rssTitle: 'Subscribe to the RSS feed',
    noPosts: 'The first posts are coming soon.',
    // Blog post
    readingTime: 'min read',
    postNav: 'More posts',
    prevPost: 'Previous post',
    nextPost: 'Next post',
    // Light / Dark / System
    themeLabel: 'Color scheme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System'
  }
} as const satisfies Record<Lang, Record<string, string>>;

export const otherLang = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');

const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Datum wie bisher: Deutsch "3.11.2026", Englisch "3 Nov 2026".
 * Von Hand statt mit Intl, weil Intl je nach Version "Sept" statt "Sep" liefert.
 * Beitragsdaten sind Kalendertage (UTC-Mitternacht, siehe src/lib/posts.ts).
 */
export function formatDate(date: Date, lang: Lang): string {
  const d = date.getUTCDate(), m = date.getUTCMonth(), y = date.getUTCFullYear();
  return lang === 'en' ? `${d} ${monthsEn[m]} ${y}` : `${d}.${m + 1}.${y}`;
}

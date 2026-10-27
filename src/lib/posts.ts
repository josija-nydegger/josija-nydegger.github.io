// Blogbeiträge: Datum, Sprache und Adresse aus dem Dateinamen (wie bei Jekyll), Lesezeit, älter/neuer.
import { getCollection, type CollectionEntry } from 'astro:content';
import { otherLang, type Lang } from '../data/i18n';
import { pages, type PageRef } from '../data/pages';
import { site } from '../data/site';

export type Post = {
  entry: CollectionEntry<'blog'>;
  lang: Lang;
  /** Kalendertag als UTC-Mitternacht (Anzeige mit formatDate, Feed mit xmlDate) */
  date: Date;
  url: string;
  title: string;
  description: string;
  ref: string;
  image?: string;
};

// "en/2026-11-03-getting-started" → Sprache, Datum, Slug
const ID = /^(?:(en)\/)?(\d{4}-\d{2}-\d{2})-(.+)$/;

function toPost(entry: CollectionEntry<'blog'>): Post {
  const m = entry.id.match(ID);
  if (!m) throw new Error(`Beitrag ohne Datum im Dateinamen: ${entry.id}`);
  const lang: Lang = m[1] === 'en' ? 'en' : 'de';
  const slug = entry.data.slug ?? m[3];
  const date = entry.data.date ? calendarDay(entry.data.date) : new Date(m[2] + 'T00:00:00Z');
  return {
    entry,
    lang,
    date,
    url: (lang === 'en' ? '/en' : '') + `/blog/${slug}/`,
    title: entry.data.title,
    description: entry.data.description,
    ref: entry.data.ref,
    image: entry.data.image
  };
}

// Tag in der Zeitzone der Website, als UTC-Mitternacht
function calendarDay(d: Date): Date {
  return new Date(d.toLocaleDateString('sv-SE', { timeZone: site.timezone }) + 'T00:00:00Z');
}

/**
 * Veröffentlichte Beiträge, neueste zuerst, optional nur einer Sprache.
 * Wie bei GitHub Pages: Beiträge mit Datum in der Zukunft oder "published: false" erscheinen nicht.
 */
export async function getPosts(lang?: Lang): Promise<Post[]> {
  const today = calendarDay(new Date());
  const posts = (await getCollection('blog'))
    .filter(e => e.data.published)
    .map(toPost)
    .filter(p => p.date <= today && (!lang || p.lang === lang));
  // Neueste zuerst; am gleichen Tag wie Jekyll nach Dateiname absteigend
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime() || b.entry.id.localeCompare(a.entry.id));
}

/** Älterer und neuerer Beitrag derselben Sprache (posts: neueste zuerst, nur diese Sprache) */
export function neighbours(posts: Post[], post: Post): { older?: Post; newer?: Post } {
  const i = posts.findIndex(p => p.url === post.url);
  if (i < 0) return {};
  return { newer: posts[i - 1], older: posts[i + 1] };
}

/**
 * Lesezeit wie bisher: rund 200 Wörter pro Minute, mindestens 1 Minute.
 * Gezählt im fertigen HTML; die unsichtbare MathML-Kopie der Formeln (KaTeX) zählt nicht mit.
 */
export function readingTime(html: string): number {
  const text = html
    .replace(/<span class="katex-mathml">[\s\S]*?<\/math><\/span>/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.floor((words + 100) / 200));
}

/** Datum für Atom-Feeds wie bei Jekyll: Mitternacht in der Zeitzone der Website, z. B. 2026-11-03T00:00:00+01:00 */
export function xmlDate(date: Date): string {
  const day = date.toISOString().slice(0, 10);
  const offset = new Intl.DateTimeFormat('en', { timeZone: site.timezone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(day + 'T12:00:00Z'))
    .find(p => p.type === 'timeZoneName')!.value.replace('GMT', '') || '+00:00';
  return `${day}T00:00:00${offset}`;
}

/**
 * Adresse des Gegenstücks in der anderen Sprache (gleiche "ref"), sonst undefined.
 * Wie bisher zuerst bei den Seiten, dann bei den Beiträgen.
 */
export async function counterpartUrl(ref: string | undefined, lang: Lang): Promise<string | undefined> {
  if (!ref) return undefined;
  const other = otherLang(lang);
  if (ref in pages) return (pages[ref as PageRef] as Partial<Record<Lang, string>>)[other];
  return (await getPosts(other)).find(p => p.ref === ref)?.url;
}

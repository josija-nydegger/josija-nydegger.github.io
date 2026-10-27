// Atom-Feeds /feed.xml (Deutsch) und /en/feed.xml (Englisch), bisher _includes/atom.xml.
// Bis 20 Beiträge der Sprache, neueste zuerst, mit vollem Inhalt.
import { i18n, type Lang } from '../data/i18n';
import { site, absoluteUrl } from '../data/site';
import { getPosts, xmlDate, xmlDateTime } from './posts';

// Wie der Liquid-Filter xml_escape
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Formeln im Feed nur als MathML: Feed-Reader laden das KaTeX-Stylesheet nicht und würden
 * sonst jede Formel doppelt zeigen. Entfernt jedes <span class="katex-html">…</span> samt verschachtelten <span>.
 */
function mathmlOnly(html: string): string {
  const open = '<span class="katex-html"';
  let out = '', pos = 0, start: number;
  while ((start = html.indexOf(open, pos)) !== -1) {
    out += html.slice(pos, start);
    const tag = /<(\/?)span\b[^>]*>/g;
    tag.lastIndex = start;
    let depth = 0, m: RegExpExecArray | null;
    while ((m = tag.exec(html))) {
      depth += m[1] ? -1 : 1;
      if (depth === 0) break;
    }
    pos = m ? tag.lastIndex : html.length;
  }
  return out + html.slice(pos);
}

export async function atomFeed(lang: Lang): Promise<Response> {
  const t = i18n[lang];
  const self = absoluteUrl(t.feedUrl);
  const posts = (await getPosts(lang)).slice(0, 20);
  const updated = posts.length > 0 ? xmlDate(posts[0].date) : xmlDateTime(new Date());

  const entries = posts.map(post => {
    const url = absoluteUrl(post.url);
    const modified = post.entry.data.last_modified_at;
    return `
  <entry>
    <title type="html">${esc(post.title)}</title>
    <link href="${url}" rel="alternate" type="text/html"/>
    <id>${url}</id>
    <published>${xmlDate(post.date)}</published>
    <updated>${modified ? xmlDate(modified) : xmlDate(post.date)}</updated>${post.description ? `
    <summary type="html">${esc(post.description)}</summary>` : ''}
    <content type="html" xml:base="${url}">${esc(mathmlOnly(post.entry.rendered?.html ?? ''))}</content>
  </entry>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}">
  <title>${esc(t.feedTitle)}</title>
  <subtitle>${esc(t.tagline)}</subtitle>
  <link href="${self}" rel="self" type="application/atom+xml"/>
  <link href="${absoluteUrl(t.homeUrl)}" rel="alternate" type="text/html" hreflang="${lang}"/>
  <id>${self}</id>
  <updated>${updated}</updated>
  <author><name>${esc(site.author.name)}</name><uri>${site.author.url}</uri></author>${entries}
</feed>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}

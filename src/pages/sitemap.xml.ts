// Sitemap für Suchmaschinen: /sitemap.xml, bisher jekyll-sitemap.
// Enthält alle Seiten aus src/pages (ohne 404 und Beitragsvorlagen), alle Beiträge (mit lastmod)
// und die statischen HTML- und PDF-Dateien aus public/ (z. B. Tools, Arbeiten).
import fs from 'node:fs';
import path from 'node:path';
import { absoluteUrl } from '../data/site';
import { getPosts, xmlDate } from '../lib/posts';

// Statische Dateien, die nicht in die Sitemap gehören
const EXCLUDE = [/^google[0-9a-f]+\.html$/, /^404\.html$/];

const toUrl = (file: string) => '/' + file.replace(/(^|\/)index\.html$/, '$1');

function pageUrls(): string[] {
  return Object.keys(import.meta.glob('./**/*.astro'))
    .map(k => k.slice(2, -'.astro'.length))
    .filter(p => !p.includes('[') && p !== '404')
    .map(p => (p === 'index' || p.endsWith('/index') ? '/' + p.slice(0, -'index'.length) : `/${p}.html`));
}

function staticUrls(dir = path.join(process.cwd(), 'public'), base = ''): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const rel = base + e.name;
    if (e.isDirectory()) return staticUrls(path.join(dir, e.name), rel + '/');
    if (!/\.(html?|xhtml|pdf)$/.test(e.name) || EXCLUDE.some(re => re.test(rel))) return [];
    return [toUrl(rel)];
  });
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const entry = (url: string, lastmod?: string) =>
  `<url>\n<loc>${esc(encodeURI(absoluteUrl(url)))}</loc>\n${lastmod ? `<lastmod>${lastmod}</lastmod>\n` : ''}</url>\n`;

export async function GET() {
  const posts = await getPosts();
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + posts.map(p => entry(p.url, xmlDate(p.entry.data.last_modified_at ?? p.date))).join('')
    + pageUrls().map(u => entry(u)).join('')
    + staticUrls().sort().map(u => entry(u)).join('')
    + '</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

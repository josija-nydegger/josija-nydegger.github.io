// Blogbeiträge: src/content/blog/ (Deutsch) und src/content/blog/en/ (Englisch).
// Dateiname wie bei Jekyll: JJJJ-MM-TT-titel-mit-bindestrichen.md (Datum und Adresse kommen daraus, siehe src/lib/posts.ts).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    // Nur Dateien mit Datum vorne gelten als Beitrag (wie _posts bei Jekyll)
    pattern: ['[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md', 'en/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md'],
    // ID = Pfad ohne Endung, unverändert, z. B. "en/2026-11-03-getting-started"
    generateId: ({ entry }) => entry.replace(/\.md$/, '')
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ref: z.string(),
    image: z.string().optional(),
    // Optional wie bei Jekyll: anderes Datum bzw. andere Adresse als im Dateinamen
    date: z.coerce.date().optional(),
    slug: z.string().optional(),
    last_modified_at: z.coerce.date().optional(),
    published: z.boolean().default(true)
  })
});

export const collections = { blog };

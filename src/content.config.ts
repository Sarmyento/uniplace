import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog Uniplace — Fase 1 (24 posts) + lotes futuros.
 * Campos extras (fase, funil, icp…) são metadados de produção; não vazam custo.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),
    pubDate: z.coerce.date(),
    fase: z.number().optional(),
    id: z.string().optional(),
    funil: z.string().optional(),
    icp: z.string().optional(),
    cta_primary: z.string().optional(),
    pub_order: z.number().optional(),
    status: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };

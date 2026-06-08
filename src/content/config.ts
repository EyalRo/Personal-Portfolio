import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    image: z.string().optional(),
  }),
});

export const collections = { work };

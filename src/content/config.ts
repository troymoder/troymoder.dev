import { defineCollection, z } from "astro:content";

const blog = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string(),
        tags: z.array(z.string()),
    }),
});

const project = defineCollection({
    type: "content",
    schema: z.object({
        name: z.string(),
        tagLine: z.string(),
        url: z.string(),
        order: z.number(),
        links: z.array(z.object({
            name: z.string(),
            url: z.string(),
        })).optional(),
    }),
});

export const collections = { blog, project };

import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const blog = defineCollection({
    loader: glob({ base: `${import.meta.dirname}/content/blog`, pattern: "**/*.{md,mdx}" }),
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string(),
        tags: z.array(z.string()),
    }),
});

const project = defineCollection({
    loader: glob({ base: `${import.meta.dirname}/content/project`, pattern: "**/*.{md,mdx}" }),
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

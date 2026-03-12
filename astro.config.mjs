import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import {
    transformerMetaHighlight,
    transformerMetaWordHighlight,
    transformerNotationDiff,
    transformerNotationErrorLevel,
} from "@shikijs/transformers";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import { rehypeExternalLinks, rehypeHeadingAnchors } from "./plugins/rehype.mjs";
import { remarkReadingTime } from "./plugins/remark.mjs";
import { transformerCodeBlock } from "./plugins/shiki";

export default defineConfig({
    site: "https://troymoder.dev",
    integrations: [
        mdx(),
        svelte(),
        pagefind(),
    ],
    markdown: {
        shikiConfig: {
            theme: "github-light",
            transformers: [
                transformerNotationDiff(),
                transformerNotationErrorLevel(),
                transformerMetaHighlight(),
                transformerMetaWordHighlight(),
                transformerCodeBlock(),
            ],
        },
        remarkPlugins: [remarkReadingTime],
        rehypePlugins: [rehypeHeadingAnchors, rehypeExternalLinks],
    },
    vite: {
        server: {
            watch: {
                ignored: ["**/.direnv/**"],
            },
        },
    },
});

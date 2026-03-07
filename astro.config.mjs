import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import {
    transformerNotationDiff,
    transformerNotationErrorLevel,
    transformerNotationFocus,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
} from "@shikijs/transformers";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import { rehypeHeadingAnchors } from "./plugins/rehype.mjs";
import { remarkReadingTime } from "./plugins/remark.mjs";
import { transformerCopyButton } from "./plugins/shiki.mjs";

export default defineConfig({
    site: "https://troymoder.dev",
    integrations: [mdx(), svelte(), pagefind()],
    markdown: {
        shikiConfig: {
            theme: "github-light",
            transformers: [
                transformerNotationDiff(),
                transformerNotationHighlight(),
                transformerNotationFocus(),
                transformerNotationWordHighlight(),
                transformerNotationErrorLevel(),
                transformerCopyButton(),
            ],
        },
        remarkPlugins: [remarkReadingTime],
        rehypePlugins: [rehypeHeadingAnchors],
    },
    vite: {
        server: {
            watch: {
                ignored: ["**/.direnv/**"],
            },
        },
    },
});

import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import astroExpressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import { rehypeExternalLinks, rehypeHeadingAnchors } from "./plugins/rehype.mjs";
import { remarkReadingTime } from "./plugins/remark.mjs";
import expressiveConfig from "./plugins/expressive-code/config.ts";

function restartOnEcPluginChange() {
    return {
        name: "restart-on-ec-plugin-change",
        configureServer(server) {
            server.watcher.add("./plugins/expressive-code/**");
            server.watcher.on("change", (path) => {
                if (path.includes("plugins/expressive-code")) {
                    console.log(`\n[expressive-code] Plugin changed: ${path}, restarting...`);
                    server.restart();
                }
            });
        },
    };
}

export default defineConfig({
    site: "https://troymoder.dev",
    integrations: [
        astroExpressiveCode(expressiveConfig),
        mdx(),
        svelte(),
        pagefind(),
    ],
    markdown: {
        remarkPlugins: [remarkReadingTime],
        rehypePlugins: [rehypeHeadingAnchors, rehypeExternalLinks],
    },
    vite: {
        plugins: [restartOnEcPluginChange()],
        server: {
            watch: {
                ignored: ["**/.direnv/**"],
            },
        },
    },
});

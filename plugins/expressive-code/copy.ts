import type { ExpressiveCodePlugin } from "astro-expressive-code";
import copyClient from "./copy.client.js?raw";

export function pluginCopy(): ExpressiveCodePlugin {
    return {
        name: "copy",
        jsModules: [copyClient],
    };
}

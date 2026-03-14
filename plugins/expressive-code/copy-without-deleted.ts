import type { ExpressiveCodePlugin } from "astro-expressive-code";
import copyWithoutDeletedClient from "./copy-without-deleted.client.js?raw";

export function pluginCopyWithoutDeleted(): ExpressiveCodePlugin {
    return {
        name: "copy-without-deleted",
        jsModules: [copyWithoutDeletedClient],
    };
}

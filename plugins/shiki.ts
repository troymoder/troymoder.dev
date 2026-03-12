import type { ShikiTransformer } from "shiki";

export function transformerCodeBlock(): ShikiTransformer {
    return {
        name: "code-block",
        pre(node) {
            node.properties["data-code-block"] = "";

            const meta = this.options.meta?.__raw || "";
            const directives = meta.split(/\s+/);

            for (const directive of directives) {
                if (directive === "no-lines") {
                    node.properties["data-no-lines"] = "";
                } else if (directive === "no-fold") {
                    node.properties["data-no-fold"] = "";
                }
            }
        },
    };
}

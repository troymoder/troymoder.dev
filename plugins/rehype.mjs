import { visit } from "unist-util-visit";

const headingTags = new Set(["h1", "h2", "h3", "h4"]);

export function rehypeHeadingAnchors() {
    return (tree) => {
        visit(tree, "element", (node) => {
            if (headingTags.has(node.tagName)) {
                node.properties["data-heading-anchor"] = "";
            }
        });
    };
}

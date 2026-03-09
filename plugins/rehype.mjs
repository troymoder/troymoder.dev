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

export function rehypeExternalLinks() {
    return (tree) => {
        visit(tree, "element", (node) => {
            if (node.tagName === "a" && node.properties?.href) {
                const href = node.properties.href;
                if (href.startsWith("http://") || href.startsWith("https://")) {
                    node.properties.target = "_blank";
                    node.properties.rel = "noopener noreferrer";
                }
            }
        });
    };
}

export function transformerCopyButton() {
    return {
        name: "copy-button",
        pre(node) {
            node.properties["data-copy"] = "";
        },
    };
}

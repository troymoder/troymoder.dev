import { type ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element } from "hast";
import diffStyleClient from "./diff-style.client.js?raw";
import diffStyleCss from "./diff-style.css?raw";

export function pluginDiffStyle(): ExpressiveCodePlugin {
    let hasDiffLines = false;

    return {
        name: "diff-style",
        baseStyles: diffStyleCss,
        jsModules: [diffStyleClient],
        hooks: {
            postprocessRenderedLine: ({ renderData }) => {
                const classes = renderData.lineAst.properties?.className;
                if (Array.isArray(classes) && (classes.includes("ins") || classes.includes("del"))) {
                    hasDiffLines = true;
                }
            },
            postprocessRenderedBlock: ({ renderData }) => {
                if (!hasDiffLines) return;
                hasDiffLines = false;

                const toggle: Element = {
                    type: "element",
                    tagName: "div",
                    properties: { className: ["diff-view-toggle"] },
                    children: [
                        {
                            type: "element",
                            tagName: "button",
                            properties: { dataView: "split", className: ["active"] },
                            children: [{ type: "text", value: "Split" }],
                        },
                        {
                            type: "element",
                            tagName: "button",
                            properties: { dataView: "unified" },
                            children: [{ type: "text", value: "Unified" }],
                        },
                        {
                            type: "element",
                            tagName: "button",
                            properties: { dataView: "old" },
                            children: [{ type: "text", value: "Old" }],
                        },
                        {
                            type: "element",
                            tagName: "button",
                            properties: { dataView: "new" },
                            children: [{ type: "text", value: "New" }],
                        },
                    ],
                };

                renderData.blockAst.children.unshift(toggle);
            },
        },
    };
}

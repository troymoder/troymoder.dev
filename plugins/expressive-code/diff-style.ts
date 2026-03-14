import { type ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element, ElementContent } from "hast";
import diffStyleClient from "./diff-style.client.js?raw";
import diffStyleCss from "./diff-style.css?raw";

function cloneElement(el: Element): Element {
    return {
        type: "element",
        tagName: el.tagName,
        properties: { ...el.properties, className: [...(el.properties?.className as string[] || [])] },
        children: el.children.map(child =>
            child.type === "element" ? cloneElement(child) : { ...child }
        ) as ElementContent[],
    };
}

function isInsOrDel(el: Element): "ins" | "del" | null {
    const classes = el.properties?.className;
    if (!Array.isArray(classes)) return null;
    if (classes.includes("ins")) return "ins";
    if (classes.includes("del")) return "del";
    return null;
}

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

                const blockAst = renderData.blockAst;

                let figure: Element | undefined;
                let pre: Element | undefined;
                let code: Element | undefined;

                if (blockAst.tagName === "figure") {
                    figure = blockAst;
                } else {
                    figure = blockAst.children.find(
                        (child): child is Element => child.type === "element" && child.tagName === "figure",
                    );
                }
                if (!figure) return;

                pre = figure.children.find(
                    (child): child is Element => child.type === "element" && child.tagName === "pre",
                );
                if (!pre) return;

                code = pre.children.find(
                    (child): child is Element => child.type === "element" && child.tagName === "code",
                );
                if (!code) return;

                const oldCode = cloneElement(code);
                const newCode = cloneElement(code);

                oldCode.children = oldCode.children.filter(child => {
                    if (child.type !== "element") return true;
                    const type = isInsOrDel(child);
                    if (type === "ins") return false;
                    if (type === "del") {
                        (child.properties!.className as string[]) = (child.properties!.className as string[]).filter(
                            c => c !== "del",
                        );
                    }
                    return true;
                });

                newCode.children = newCode.children.filter(child => {
                    if (child.type !== "element") return true;
                    const type = isInsOrDel(child);
                    if (type === "del") return false;
                    if (type === "ins") {
                        (child.properties!.className as string[]) = (child.properties!.className as string[]).filter(
                            c => c !== "ins",
                        );
                    }
                    return true;
                });

                const createPre = (codeEl: Element, view: string, hidden: boolean): Element => ({
                    type: "element",
                    tagName: "pre",
                    properties: {
                        ...(pre.properties || {}),
                        dataView: view,
                        ...(hidden ? { dataNoCopy: true } : {}),
                    },
                    children: [codeEl],
                });

                const oldPre = createPre(oldCode, "old", true);
                const newPre = createPre(newCode, "new", true);

                pre.properties = pre.properties || {};
                pre.properties.dataView = "unified";

                const preIndex = figure.children.indexOf(pre);
                figure.children.splice(preIndex + 1, 0, oldPre, newPre);

                const toggle: Element = {
                    type: "element",
                    tagName: "div",
                    properties: { className: ["diff-view-toggle"] },
                    children: [
                        {
                            type: "element",
                            tagName: "button",
                            properties: { dataView: "unified", className: ["active"] },
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

                if (blockAst.tagName === "figure") {
                    figure.children.unshift(toggle);
                } else {
                    blockAst.children.unshift(toggle);
                }
            },
        },
    };
}

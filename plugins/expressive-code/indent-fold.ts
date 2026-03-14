import { AttachedPluginData, type ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element } from "hast";
import indentFoldCss from "./indent-fold.css?raw";
import indentFoldClient from "./indent-fold.client.js?raw";

interface FoldRegion {
    start: number;
    end: number;
    collapsed: boolean;
}

function getIndent(text: string): number {
    const match = text.match(/^(\s*)/);
    return match?.[1]?.length ?? 0;
}

function parseCollapseMeta(meta: string): Set<number> {
    const collapsed = new Set<number>();
    const match = meta.match(/collapse=\{([^}]+)\}/);
    if (!match) return collapsed;
    
    const parts = match[1]!.split(",");
    for (const part of parts) {
        const trimmed = part.trim();
        const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1]!, 10);
            const end = parseInt(rangeMatch[2]!, 10);
            for (let i = start; i <= end; i++) {
                collapsed.add(i);
            }
        } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num)) {
                collapsed.add(num);
            }
        }
    }
    return collapsed;
}

function parseRegions(lines: string[], collapsedLines: Set<number>): FoldRegion[] {
    const regions: FoldRegion[] = [];
    const n = lines.length;
    const indents: number[] = [];

    for (let i = 0; i < n; i++) {
        const line = lines[i];
        if (line === undefined) {
            indents.push(-1);
            continue;
        }
        const isEmpty = line.trim() === "";
        indents.push(isEmpty ? -1 : getIndent(line));
    }

    const stack: { index: number; indent: number }[] = [];

    for (let i = 0; i <= n; i++) {
        const indent = i < n ? (indents[i] ?? -Infinity) : -Infinity;
        if (indent === -1) continue;

        while (stack.length > 0) {
            const top = stack[stack.length - 1];
            if (!top || indent > top.indent) break;
            const { index } = stack.pop()!;
            if (i - 1 > index) {
                regions.push({ start: index, end: i - 1, collapsed: collapsedLines.has(index + 1) });
            }
        }

        if (i < n && indent !== -Infinity) {
            stack.push({ index: i, indent });
        }
    }

    const nextNonEmptyIndent: number[] = new Array(n).fill(-Infinity);
    let lastSeen: number = -Infinity;
    for (let i = n - 1; i >= 0; i--) {
        nextNonEmptyIndent[i] = lastSeen;
        const ind = indents[i];
        if (ind !== undefined && ind !== -1) {
            lastSeen = ind;
        }
    }

    return regions.filter((r) => {
        const startIndent = indents[r.start];
        const nextIndent = nextNonEmptyIndent[r.start];
        return startIndent !== undefined && startIndent !== -1 && nextIndent !== undefined && nextIndent > startIndent;
    });
}


interface PluginIndentFoldData {
    foldRegions: FoldRegion[];
}

// Create a singleton instance that allows attaching this type of data
// to any object and to retrieve it later.
// Note: Exporting is optional. This can be useful if multiple plugins
//       need to work together.
export const pluginIndentFoldData = new AttachedPluginData<PluginIndentFoldData>(
    // This function initializes the attached data
    // in case nothing was attached to an object yet
    () => ({ foldRegions: [] })
  )

export function pluginIndentFold(): ExpressiveCodePlugin {
    return {
        name: "indent-fold",
        baseStyles: indentFoldCss,
        jsModules: [indentFoldClient],
        hooks: {
            preprocessCode: ({ codeBlock }) => {
                const meta = codeBlock.meta || "";
                const collapsedLines = parseCollapseMeta(meta);
                const lines = codeBlock.getLines().map((line) => line.text);
                const regions = parseRegions(lines, collapsedLines);
                
                if (regions.length === 0) return;
                const data = pluginIndentFoldData.getOrCreateFor(codeBlock);

                data.foldRegions = regions;
            },
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginIndentFoldData.getOrCreateFor(codeBlock);
                const foldRegions = data.foldRegions;
                if (!foldRegions) return;

                const region = foldRegions.find(r => r.start === lineIndex);

                const lineAst = renderData.lineAst;
                lineAst.properties = lineAst.properties || {};
                lineAst.properties["data-line-num"] = String(lineIndex);

                const isInsideCollapsedRegion = foldRegions.some(
                    r => r.collapsed && lineIndex > r.start && lineIndex <= r.end
                );
                if (isInsideCollapsedRegion) {
                    lineAst.properties["data-folded"] = "";
                }

                if (region) {
                    lineAst.properties["data-foldable"] = "";
                    lineAst.properties["data-fold-start"] = String(region.start);
                    lineAst.properties["data-fold-end"] = String(region.end);
                    if (region.collapsed) {
                        lineAst.properties["data-collapsed"] = "";
                    }

                    const chevron: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["fold-chevron"] },
                        children: [],
                    };

                    const ellipsis: Element = {
                        type: "element",
                        tagName: "button",
                        properties: { className: ["fold-ellipsis"] },
                        children: [{ type: "text", value: "..." }],
                    };

                    const gutterDiv = lineAst.children.find(
                        (child): child is Element =>
                            child.type === "element" &&
                            child.tagName === "div" &&
                            Array.isArray(child.properties?.className) &&
                            child.properties.className.includes("gutter")
                    );
                    if (gutterDiv) {
                        gutterDiv.children.push(chevron);
                    }

                    const codeDiv = lineAst.children.find(
                        (child): child is Element =>
                            child.type === "element" &&
                            child.tagName === "div" &&
                            Array.isArray(child.properties?.className) &&
                            child.properties.className.includes("code")
                    );
                    if (codeDiv) {
                        codeDiv.children.push(ellipsis);
                    }
                }
            },
        },
    };
}

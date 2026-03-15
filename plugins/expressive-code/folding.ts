import { AttachedPluginData, type ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element } from "hast";
import { getSection, pluginBlockConfigData } from "./block-config.ts";
import foldingClient from "./folding.client.js?raw";

interface FoldRegion {
    start: number;
    end: number;
    collapsed: boolean;
}

function getIndent(text: string): number {
    const match = text.match(/^(\s*)/);
    return match?.[1]?.length ?? 0;
}

function parseCollapseSection(lines: string[]): Set<number> {
    const collapsed = new Set<number>();

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

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

interface PluginFoldingData {
    foldRegions: FoldRegion[];
}

export const pluginFoldingData = new AttachedPluginData<PluginFoldingData>(
    () => ({ foldRegions: [] }),
);

export function pluginFolding(): ExpressiveCodePlugin {
    return {
        name: "folding",
        baseStyles: ({ cssVar }) => `
            .ec-line[data-foldable] .gutter { position: relative; }

            .ec-line[data-foldable] .fold-chevron {
                display: inline-flex;
                width: 1.2em;
                height: 1lh;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                pointer-events: auto !important;
                opacity: 0;
                transition: opacity 0.15s ease, color 0.15s ease;
                color: ${cssVar("gutterForeground")};
                user-select: none;
                position: absolute;
                transform: translateX(-1px);
                right: 0;
                top: 0;

                &::before {
                    content: "";
                    width: 0;
                    height: 0;
                    border-left: 5px solid currentColor;
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                    transition: transform 0.15s ease;
                    transform: rotate(90deg);
                }

                &:hover { color: ${cssVar("codeForeground")}; }
            }

            .expressive-code:hover .ec-line[data-foldable] .fold-chevron { opacity: 1; }

            .ec-line[data-collapsed] .fold-chevron {
                opacity: 1;
                &::before { transform: rotate(0deg); }
            }

            .ec-line[data-folded] { display: none !important; }

            .fold-ellipsis {
                display: none;
                color: #6b6b6b;
                font-style: normal;
                cursor: pointer;
                user-select: none;
                border: none;
                background: #f9c89b4d;
                border-radius: 3px;
                margin-left: 0.5em;
                padding: 0 0.4em;
                font: inherit;
                transition: background 0.15s ease, color 0.15s ease;

                &:hover { color: #232333; background: #f9c89be6; }
            }

            .ec-line[data-collapsed] .fold-ellipsis { display: inline; }
        `,
        jsModules: [foldingClient],
        hooks: {
            preprocessCode: ({ codeBlock }) => {
                const blockConfigData = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const collapseLines = getSection(blockConfigData.sections, "collapse");
                const collapsedLines = collapseLines ? parseCollapseSection(collapseLines) : new Set<number>();

                const lines = codeBlock.getLines().map((line) => line.text);
                const regions = parseRegions(lines, collapsedLines);

                if (regions.length === 0) return;
                const data = pluginFoldingData.getOrCreateFor(codeBlock);
                data.foldRegions = regions;
            },
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginFoldingData.getOrCreateFor(codeBlock);
                const foldRegions = data.foldRegions;
                if (!foldRegions) return;

                const region = foldRegions.find(r => r.start === lineIndex);

                const lineAst = renderData.lineAst;
                lineAst.properties = lineAst.properties || {};
                lineAst.properties["data-line-num"] = String(lineIndex);

                const isInsideCollapsedRegion = foldRegions.some(
                    r => r.collapsed && lineIndex > r.start && lineIndex <= r.end,
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
                        properties: { className: ["fold-ellipsis"], dataNoCopy: true },
                        children: [{ type: "text", value: "..." }],
                    };

                    const gutterDiv = lineAst.children.find(
                        (child): child is Element =>
                            child.type === "element"
                            && child.tagName === "div"
                            && Array.isArray(child.properties?.className)
                            && child.properties.className.includes("gutter"),
                    );
                    if (gutterDiv) {
                        gutterDiv.children.push(chevron);
                    }

                    const codeDiv = lineAst.children.find(
                        (child): child is Element =>
                            child.type === "element"
                            && child.tagName === "div"
                            && Array.isArray(child.properties?.className)
                            && child.properties.className.includes("code"),
                    );
                    if (codeDiv) {
                        codeDiv.children.push(ellipsis);
                    }
                }
            },
        },
    };
}

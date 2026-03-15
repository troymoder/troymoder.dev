import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element, Text } from "hast";
import { fromHtml } from "hast-util-from-html";
import MarkdownIt from "markdown-it";
import { getSection, pluginBlockConfigData } from "./block-config.ts";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        tooltips: TooltipsStyleSettings;
    }
}

interface TooltipsStyleSettings {
    underlineCol: string;
    underlineColHov: string;
    bg: string;
    txt: string;
    brd: string;
    shd: string;
    codeBg: string;
    rad: string;
    pad: string;
    font: string;
    fontSz: string;
    maxWd: string;
}

export const tooltipsStyleSettings = new PluginStyleSettings({
    defaultValues: {
        tooltips: {
            underlineCol: "color-mix(in srgb, currentColor 50%, transparent)",
            underlineColHov: "currentColor",
            bg: "#ffffff",
            txt: "#27272a",
            brd: "#e4e4e7",
            shd: "rgba(0, 0, 0, 0.1)",
            codeBg: "rgba(0, 0, 0, 0.05)",
            rad: "6px",
            pad: "0.75rem 1rem",
            font: "system-ui, -apple-system, sans-serif",
            fontSz: "0.875rem",
            maxWd: "400px",
        },
    },
});

const md = new MarkdownIt({ html: true });

interface Tooltip {
    target: string;
    content: string;
    html: string;
    line?: number;
}

function parseInlineMarkdown(content: string): string {
    return md.renderInline(content);
}

function parseHoverSection(lines: string[]): Tooltip[] {
    const tooltips: Tooltip[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^(.+?):\s*(.+)$/);
        if (!match) continue;

        const target = match[1]!.trim();
        const content = match[2]!.trim();
        const html = parseInlineMarkdown(content);
        const lineMatch = target.match(/^(.+?)@(\d+)$/);

        if (lineMatch) {
            tooltips.push({
                target: lineMatch[1]!,
                content,
                html,
                line: parseInt(lineMatch[2]!, 10) - 1,
            });
        } else {
            tooltips.push({ target, content, html });
        }
    }

    return tooltips;
}

function wrapTextWithTooltip(node: Element, lineIndex: number, tooltip: Tooltip): boolean {
    if (tooltip.line !== undefined && tooltip.line !== lineIndex) {
        return false;
    }

    let found = false;

    function processChildren(children: (Element | Text)[]): (Element | Text)[] {
        const result: (Element | Text)[] = [];

        for (const child of children) {
            if (child.type === "text") {
                const text = child.value;
                const idx = text.indexOf(tooltip.target);

                if (idx !== -1 && !found) {
                    found = true;
                    const before = text.slice(0, idx);
                    const after = text.slice(idx + tooltip.target.length);

                    if (before) {
                        result.push({ type: "text", value: before });
                    }

                    const htmlTree = fromHtml(tooltip.html, { fragment: true });
                    const tooltipEl: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["tooltip-content"], dataNoCopy: true },
                        children: htmlTree.children as (Element | Text)[],
                    };
                    const wrapper: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["tooltip-trigger"], tabIndex: -1 },
                        children: [
                            { type: "text", value: tooltip.target },
                            tooltipEl,
                        ],
                    };
                    result.push(wrapper);

                    if (after) {
                        result.push({ type: "text", value: after });
                    }
                } else {
                    result.push(child);
                }
            } else if (child.type === "element") {
                if (!found && child.children) {
                    child.children = processChildren(child.children as (Element | Text)[]);
                }
                result.push(child);
            }
        }

        return result;
    }

    node.children = processChildren(node.children as (Element | Text)[]);
    return found;
}

export function pluginTooltips(): ExpressiveCodePlugin {
    return {
        name: "tooltips",
        styleSettings: tooltipsStyleSettings,
        baseStyles: ({ cssVar }) => `
            .tooltip-trigger {
                position: relative;
                cursor: help;
                border-bottom: 1px dashed ${cssVar("tooltips.underlineCol")};

                &:hover, &.pinned {
                    border-bottom-style: solid;
                    border-bottom-color: ${cssVar("tooltips.underlineColHov")};
                }

                &:hover .tooltip-content {
                    opacity: 1;
                    visibility: visible;
                }
            }

            .tooltip-content {
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                z-index: 100;
                max-width: ${cssVar("tooltips.maxWd")};
                width: max-content;
                padding: ${cssVar("tooltips.pad")};
                font-family: ${cssVar("tooltips.font")};
                font-size: ${cssVar("tooltips.fontSz")};
                line-height: 1.5;
                white-space: normal;
                color: ${cssVar("tooltips.txt")};
                background: ${cssVar("tooltips.bg")};
                border: 1px solid ${cssVar("tooltips.brd")};
                border-radius: ${cssVar("tooltips.rad")};
                box-shadow: 0 4px 12px ${cssVar("tooltips.shd")};
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease;

                &::before {
                    content: "";
                    position: absolute;
                    top: -6px;
                    left: 12px;
                    width: 10px;
                    height: 10px;
                    background: ${cssVar("tooltips.bg")};
                    border-left: 1px solid ${cssVar("tooltips.brd")};
                    border-top: 1px solid ${cssVar("tooltips.brd")};
                    transform: rotate(45deg);
                }

                &::after {
                    content: "";
                    position: absolute;
                    top: -8px;
                    left: 0;
                    right: 0;
                    height: 8px;
                }

                code {
                    padding: 0.125rem 0.375rem;
                    font-family: "JetBrains Mono", monospace;
                    font-size: 0.8125rem;
                    background: ${cssVar("tooltips.codeBg")};
                    border-radius: 3px;
                }
            }
        `,
        hooks: {
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const hoverLines = getSection(data.sections, "hover");
                if (!hoverLines) return;

                const tooltips = parseHoverSection(hoverLines);
                if (tooltips.length === 0) return;

                const lineAst = renderData.lineAst;

                for (const tooltip of tooltips) {
                    wrapTextWithTooltip(lineAst, lineIndex, tooltip);
                }
            },
        },
    };
}

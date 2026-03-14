import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element, Text } from "hast";
import { fromHtml } from "hast-util-from-html";
import MarkdownIt from "markdown-it";
import { getSection, pluginBlockConfigData } from "./block-config";
import hoverAnnotationsCss from "./hover-annotations.css?raw";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        hoverAnnotations: HoverAnnotationsStyleSettings;
    }
}

interface HoverAnnotationsStyleSettings {
    underlineCol: string;
    underlineColHov: string;
    tooltipBg: string;
    tooltipTxt: string;
    tooltipBrd: string;
    tooltipShd: string;
    tooltipCodeBg: string;
    tooltipRad: string;
    tooltipPad: string;
    tooltipFont: string;
    tooltipFontSz: string;
    tooltipMaxWd: string;
}

export const hoverAnnotationsStyleSettings = new PluginStyleSettings({
    defaultValues: {
        hoverAnnotations: {
            underlineCol: "color-mix(in srgb, currentColor 50%, transparent)",
            underlineColHov: "currentColor",
            tooltipBg: "#ffffff",
            tooltipTxt: "#27272a",
            tooltipBrd: "#e4e4e7",
            tooltipShd: "rgba(0, 0, 0, 0.1)",
            tooltipCodeBg: "rgba(0, 0, 0, 0.05)",
            tooltipRad: "6px",
            tooltipPad: "0.75rem 1rem",
            tooltipFont: "system-ui, -apple-system, sans-serif",
            tooltipFontSz: "0.875rem",
            tooltipMaxWd: "400px",
        },
    },
});

const md = new MarkdownIt({ html: true });

interface HoverAnnotation {
    target: string;
    content: string;
    html: string;
    line?: number;
}

function parseInlineMarkdown(content: string): string {
    return md.renderInline(content);
}

function parseHoverSection(lines: string[]): HoverAnnotation[] {
    const annotations: HoverAnnotation[] = [];

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
            annotations.push({
                target: lineMatch[1]!,
                content,
                html,
                line: parseInt(lineMatch[2]!, 10) - 1,
            });
        } else {
            annotations.push({ target, content, html });
        }
    }

    return annotations;
}

function wrapTextWithAnnotation(
    node: Element,
    lineIndex: number,
    annotation: HoverAnnotation,
): boolean {
    if (annotation.line !== undefined && annotation.line !== lineIndex) {
        return false;
    }

    let found = false;

    function processChildren(children: (Element | Text)[]): (Element | Text)[] {
        const result: (Element | Text)[] = [];

        for (const child of children) {
            if (child.type === "text") {
                const text = child.value;
                const idx = text.indexOf(annotation.target);

                if (idx !== -1 && !found) {
                    found = true;
                    const before = text.slice(0, idx);
                    const after = text.slice(idx + annotation.target.length);

                    if (before) {
                        result.push({ type: "text", value: before });
                    }

                    const htmlTree = fromHtml(annotation.html, { fragment: true });
                    const tooltip: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["hover-tooltip"], dataNoCopy: true },
                        children: htmlTree.children as (Element | Text)[],
                    };
                    const wrapper: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["hover-annotation"], tabIndex: -1 },
                        children: [
                            { type: "text", value: annotation.target },
                            tooltip,
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

export function pluginHoverAnnotations(): ExpressiveCodePlugin {
    return {
        name: "hover-annotations",
        styleSettings: hoverAnnotationsStyleSettings,
        baseStyles: hoverAnnotationsCss,
        hooks: {
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const hoverLines = getSection(data.sections, "hover");
                if (!hoverLines) return;

                const annotations = parseHoverSection(hoverLines);
                if (annotations.length === 0) return;

                const lineAst = renderData.lineAst;

                for (const annotation of annotations) {
                    wrapTextWithAnnotation(lineAst, lineIndex, annotation);
                }
            },
        },
    };
}

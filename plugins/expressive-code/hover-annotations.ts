import { AttachedPluginData, type ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element, Text } from "hast";
import MarkdownIt from "markdown-it";
import hoverAnnotationsCss from "./hover-annotations.css?raw";
import { fromHtml } from "hast-util-from-html";

const md = new MarkdownIt({ html: true });

interface HoverAnnotation {
    target: string;
    content: string;
    html: string;
    line?: number;
}

export interface CodeBlockConfig {
    hover?: Record<string, string>;
    title?: string;
}

interface PluginConfigData {
    annotations: HoverAnnotation[];
    config: CodeBlockConfig;
    configLineCount: number;
}

export const pluginConfigData = new AttachedPluginData<PluginConfigData>(
    () => ({ annotations: [], config: {}, configLineCount: 0 })
);

function parseConfigBlock(lines: string[]): { config: CodeBlockConfig; configLineCount: number } {
    const firstLine = lines[0]?.trim();
    if (!firstLine?.startsWith(":::")) {
        return { config: {}, configLineCount: 0 };
    }

    const config: CodeBlockConfig = {};
    let currentSection: string | null = null;
    let currentContent: string[] = [];
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const trimmed = line.trim();

        if (trimmed === ":::") {
            if (currentSection) {
                applySection(config, currentSection, currentContent);
            }
            endIndex = i;
            break;
        }

        if (trimmed.startsWith("::: ")) {
            if (currentSection) {
                applySection(config, currentSection, currentContent);
            }
            currentSection = trimmed.slice(4).trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }

    if (endIndex === -1) {
        return { config: {}, configLineCount: 0 };
    }

    return { config, configLineCount: endIndex + 1 };
}

function applySection(config: CodeBlockConfig, section: string, lines: string[]) {
    switch (section) {
        case "hover":
            config.hover = config.hover || {};
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                const match = trimmed.match(/^(.+?):\s*(.+)$/);
                if (match) {
                    config.hover[match[1]!.trim()] = match[2]!.trim();
                }
            }
            break;
        case "title":
            config.title = lines.map(l => l.trim()).filter(Boolean).join(" ");
            break;
    }
}

function parseInlineMarkdown(content: string): string {
    return md.renderInline(content);
}

function extractAnnotations(config: CodeBlockConfig): HoverAnnotation[] {
    if (!config.hover) return [];
    
    const annotations: HoverAnnotation[] = [];
    
    for (const [target, content] of Object.entries(config.hover)) {
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
    annotation: HoverAnnotation
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
                        properties: { className: ["hover-tooltip"] },
                        children: htmlTree.children as (Element | Text)[],
                    };
                    const wrapper: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["hover-annotation"] },
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
        baseStyles: hoverAnnotationsCss,
        hooks: {
            preprocessCode: ({ codeBlock }) => {
                const lines = codeBlock.getLines().map((line) => line.text);
                const { config, configLineCount } = parseConfigBlock(lines);
                
                if (configLineCount === 0) return;
                
                const data = pluginConfigData.getOrCreateFor(codeBlock);
                data.config = config;
                data.annotations = extractAnnotations(config);
                data.configLineCount = configLineCount;
                
                for (let i = 0; i < configLineCount; i++) {
                    codeBlock.deleteLine(0);
                }
            },
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginConfigData.getOrCreateFor(codeBlock);
                const annotations = data.annotations;
                if (!annotations || annotations.length === 0) return;

                const lineAst = renderData.lineAst;
                
                for (const annotation of annotations) {
                    wrapTextWithAnnotation(lineAst, lineIndex, annotation);
                }
            },
        },
    };
}

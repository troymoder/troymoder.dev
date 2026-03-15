import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element, Text } from "hast";
import { getSection, pluginBlockConfigData } from "./block-config";
import clickLinksCss from "./click-links.css?raw";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        clickLinks: ClickLinksStyleSettings;
    }
}

interface ClickLinksStyleSettings {
    underlineCol: string;
    underlineColHov: string;
}

export const clickLinksStyleSettings = new PluginStyleSettings({
    defaultValues: {
        clickLinks: {
            underlineCol: "color-mix(in srgb, currentColor 40%, transparent)",
            underlineColHov: "currentColor",
        },
    },
});

interface ClickLink {
    target: string;
    href: string;
    lines?: number[];
}

function parseLinksSection(lines: string[], anchor?: string): ClickLink[] {
    const links: ClickLink[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const arrowIdx = trimmed.lastIndexOf(" -> ");
        let targetPart: string;
        let href: string;

        if (arrowIdx !== -1) {
            targetPart = trimmed.slice(0, arrowIdx).trim();
            href = trimmed.slice(arrowIdx + 4).trim();
        } else {
            const colonMatch = trimmed.match(/^(.+?):\s+(.+)$/);
            if (!colonMatch) continue;
            targetPart = colonMatch[1]!.trim();
            href = colonMatch[2]!.trim();
        }

        if (href.startsWith(":") && anchor) {
            href = `#${anchor}${href}`;
        }

        const lineMatch = targetPart.match(/^(.+?)@([\d,]+)$/);

        if (lineMatch) {
            const target = lineMatch[1]!;
            const lineNums = lineMatch[2]!.split(",").map(n => parseInt(n.trim(), 10) - 1);
            links.push({ target, href, lines: lineNums });
        } else {
            links.push({ target: targetPart, href });
        }
    }

    return links;
}

function wrapTextWithLink(
    node: Element,
    lineIndex: number,
    link: ClickLink,
): boolean {
    if (link.lines !== undefined && !link.lines.includes(lineIndex)) {
        return false;
    }

    let found = false;

    function processChildren(children: (Element | Text)[]): (Element | Text)[] {
        const result: (Element | Text)[] = [];

        for (const child of children) {
            if (child.type === "text") {
                const text = child.value;
                const idx = text.indexOf(link.target);

                if (idx !== -1 && !found) {
                    found = true;
                    const before = text.slice(0, idx);
                    const after = text.slice(idx + link.target.length);

                    if (before) {
                        result.push({ type: "text", value: before });
                    }

                    const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
                    const anchor: Element = {
                        type: "element",
                        tagName: "a",
                        properties: {
                            className: ["click-link"],
                            href: link.href,
                            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
                        },
                        children: [{ type: "text", value: link.target }],
                    };
                    result.push(anchor);

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

export function pluginClickLinks(): ExpressiveCodePlugin {
    return {
        name: "click-links",
        styleSettings: clickLinksStyleSettings,
        baseStyles: clickLinksCss,
        hooks: {
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const linkLines = getSection(data.sections, "links");
                if (!linkLines) return;

                const anchorLines = getSection(data.sections, "anchor");
                const anchor = anchorLines?.[0]?.trim();

                const links = parseLinksSection(linkLines, anchor);
                if (links.length === 0) return;

                const lineAst = renderData.lineAst;

                for (const link of links) {
                    wrapTextWithLink(lineAst, lineIndex, link);
                }
            },
        },
    };
}

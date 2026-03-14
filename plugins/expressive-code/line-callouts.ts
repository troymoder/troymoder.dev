import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element, Text } from "hast";
import { fromHtml } from "hast-util-from-html";
import MarkdownIt from "markdown-it";
import { getSection, pluginBlockConfigData } from "./block-config";
import lineCalloutsCss from "./line-callouts.css?raw";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        lineCallouts: LineCalloutsStyleSettings;
    }
}

interface LineCalloutsStyleSettings {
    errBg: string;
    errBrd: string;
    errIcon: string;
    errUnderline: string;
    warnBg: string;
    warnBrd: string;
    warnIcon: string;
    warnUnderline: string;
    infoBg: string;
    infoBrd: string;
    infoIcon: string;
    okBg: string;
    okBrd: string;
    okIcon: string;
    noteBg: string;
    noteBrd: string;
    noteIcon: string;
    txt: string;
    pad: string;
    font: string;
    fontSz: string;
}

export const lineCalloutsStyleSettings = new PluginStyleSettings({
    defaultValues: {
        lineCallouts: {
            errBg: "#fef2f2",
            errBrd: "#fca5a5",
            errIcon: "'🚫'",
            errUnderline: "#dc2626",
            warnBg: "#fffbeb",
            warnBrd: "#fcd34d",
            warnIcon: "'⚠️'",
            warnUnderline: "#d97706",
            infoBg: "#eff6ff",
            infoBrd: "#93c5fd",
            infoIcon: "'ℹ️'",
            okBg: "#f0fdf4",
            okBrd: "#86efac",
            okIcon: "'✅'",
            noteBg: "#f5f5f5",
            noteBrd: "#d4d4d4",
            noteIcon: "'📝'",
            txt: "#27272a",
            pad: "0.5rem 0.75rem",
            font: "system-ui, -apple-system, sans-serif",
            fontSz: "0.8125rem",
        },
    },
});

const md = new MarkdownIt({ html: true });

type CalloutType = "error" | "warn" | "info" | "ok" | "note";

interface LineCallout {
    line: number;
    type: CalloutType;
    message: string;
    html: string;
    colStart?: number | undefined;
    colEnd?: number | undefined;
}

function parseLogsSection(lines: string[]): LineCallout[] {
    const callouts: LineCallout[] = [];
    const validTypes = new Set<CalloutType>(["error", "warn", "info", "ok", "note"]);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Match: type@line[colStart:colEnd]: message  OR  type@line: message
        const match = trimmed.match(/^(error|warn|info|ok|note)@(\d+)(?:\[(\d+):(\d+)\])?:\s*(.+)$/);
        if (!match) continue;

        const type = match[1] as CalloutType;
        if (!validTypes.has(type)) continue;

        const lineNum = parseInt(match[2]!, 10) - 1;
        const colStart = match[3] ? parseInt(match[3], 10) - 1 : undefined;
        const colEnd = match[4] ? parseInt(match[4], 10) : undefined;
        const message = match[5]!.trim();
        const html = md.renderInline(message);

        callouts.push({ line: lineNum, type, message, html, colStart, colEnd });
    }

    return callouts;
}

function wrapColumnRange(
    node: Element,
    callout: LineCallout,
): void {
    if (callout.colStart === undefined || callout.colEnd === undefined) return;

    let currentCol = 0;
    const start = callout.colStart;
    const end = callout.colEnd;

    function processChildren(children: (Element | Text)[]): (Element | Text)[] {
        const result: (Element | Text)[] = [];

        for (const child of children) {
            if (child.type === "text") {
                const text = child.value;
                const textStart = currentCol;
                const textEnd = currentCol + text.length;

                if (textEnd <= start || textStart >= end) {
                    result.push(child);
                    currentCol = textEnd;
                    continue;
                }

                const overlapStart = Math.max(start, textStart);
                const overlapEnd = Math.min(end, textEnd);

                const beforeLen = overlapStart - textStart;
                const afterStart = overlapEnd - textStart;

                if (beforeLen > 0) {
                    result.push({ type: "text", value: text.slice(0, beforeLen) });
                }

                const spanText = text.slice(beforeLen, afterStart);
                const span: Element = {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["callout-underline", `callout-underline-${callout.type}`] },
                    children: [{ type: "text", value: spanText }],
                };
                result.push(span);

                if (afterStart < text.length) {
                    result.push({ type: "text", value: text.slice(afterStart) });
                }

                currentCol = textEnd;
            } else if (child.type === "element") {
                child.children = processChildren(child.children as (Element | Text)[]);
                result.push(child);
            }
        }

        return result;
    }

    const codeDiv = node.children.find(
        (child): child is Element =>
            child.type === "element"
            && child.tagName === "div"
            && Array.isArray(child.properties?.className)
            && child.properties.className.includes("code"),
    );

    if (codeDiv) {
        codeDiv.children = processChildren(codeDiv.children as (Element | Text)[]);
    }
}

export function pluginLineCallouts(): ExpressiveCodePlugin {
    return {
        name: "line-callouts",
        styleSettings: lineCalloutsStyleSettings,
        baseStyles: lineCalloutsCss,
        hooks: {
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const logsLines = getSection(data.sections, "logs");
                if (!logsLines) return;

                const callouts = parseLogsSection(logsLines);
                const lineCallouts = callouts.filter(c => c.line === lineIndex);
                if (lineCallouts.length === 0) return;

                const lineAst = renderData.lineAst;
                lineAst.properties = lineAst.properties || {};

                for (const callout of lineCallouts) {
                    lineAst.properties[`data-callout-${callout.type}`] = "";

                    // Add squiggly underline for column ranges
                    wrapColumnRange(lineAst, callout);

                    const htmlTree = fromHtml(callout.html, { fragment: true });
                    const calloutEl: Element = {
                        type: "element",
                        tagName: "div",
                        properties: { className: ["line-callout", `line-callout-${callout.type}`] },
                        children: htmlTree.children as Element[],
                    };

                    lineAst.children.push(calloutEl);
                }
            },
        },
    };
}

import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element, Text } from "hast";
import { fromHtml } from "hast-util-from-html";
import MarkdownIt from "markdown-it";
import { getSection, pluginBlockConfigData } from "./block-config.ts";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        callouts: CalloutsStyleSettings;
    }
}

interface CalloutsStyleSettings {
    errorBackground: string;
    errorBorder: string;
    errorIcon: string;
    errorUnderline: string;
    warnBackground: string;
    warnBorder: string;
    warnIcon: string;
    warnUnderline: string;
    infoBackground: string;
    infoBorder: string;
    infoIcon: string;
    okBackground: string;
    okBorder: string;
    okIcon: string;
    noteBackground: string;
    noteBorder: string;
    noteIcon: string;
    textColor: string;
    codeBackground: string;
    padding: string;
    fontFamily: string;
    fontSize: string;
}

export const calloutsStyleSettings = new PluginStyleSettings({
    defaultValues: {
        callouts: {
            errorBackground: "#fef2f2",
            errorBorder: "#fca5a5",
            errorIcon: "'🚫'",
            errorUnderline: "#dc2626",
            warnBackground: "#fffbeb",
            warnBorder: "#fcd34d",
            warnIcon: "'⚠️'",
            warnUnderline: "#d97706",
            infoBackground: "#eff6ff",
            infoBorder: "#93c5fd",
            infoIcon: "'ℹ️'",
            okBackground: "#f0fdf4",
            okBorder: "#86efac",
            okIcon: "'✅'",
            noteBackground: "#f5f5f5",
            noteBorder: "#d4d4d4",
            noteIcon: "'📝'",
            textColor: "#27272a",
            codeBackground: "rgba(0, 0, 0, 0.08)",
            padding: "0.5rem 0.75rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "0.8125rem",
        },
    },
});

const md = new MarkdownIt({ html: true });

type CalloutType = "error" | "warn" | "info" | "ok" | "note";

interface Callout {
    line: number;
    type: CalloutType;
    message: string;
    html: string;
    colStart?: number | undefined;
    colEnd?: number | undefined;
}

function parseLogsSection(lines: string[]): Callout[] {
    const callouts: Callout[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^(error|warn|info|ok|note)@(\d+)(?:\[(\d+):(\d+)\])?:\s*(.+)$/);
        if (!match) continue;

        const type = match[1] as CalloutType;
        const lineNum = parseInt(match[2]!, 10) - 1;
        const colStart = match[3] ? parseInt(match[3], 10) - 1 : undefined;
        const colEnd = match[4] ? parseInt(match[4], 10) : undefined;
        const message = match[5]!.trim();
        const html = md.renderInline(message);

        callouts.push({ line: lineNum, type, message, html, colStart, colEnd });
    }

    return callouts;
}

function wrapColumnRange(node: Element, callout: Callout): void {
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

export function pluginCallouts(): ExpressiveCodePlugin {
    return {
        name: "callouts",
        styleSettings: calloutsStyleSettings,
        baseStyles: ({ cssVar }) => `
            .ec-line {
                &[data-callout-error],
                &[data-callout-warn],
                &[data-callout-info],
                &[data-callout-ok],
                &[data-callout-note] {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    grid-template-rows: auto auto;

                    > .gutter { grid-row: 1; grid-column: 1; }
                    > .code { grid-row: 1; grid-column: 2; }
                    > .line-callout { grid-row: 2; grid-column: 1 / -1; }
                }
            }

            .line-callout {
                padding: ${cssVar("callouts.padding")};
                font-family: ${cssVar("callouts.fontFamily")};
                font-size: ${cssVar("callouts.fontSize")};
                line-height: 1.4;
                color: ${cssVar("callouts.textColor")};
                border-left-width: 3px;
                border-left-style: solid;

                &::before { margin-right: 0.5rem; }

                code {
                    padding: 0.125rem 0.375rem;
                    font-family: "JetBrains Mono", monospace;
                    font-size: 0.75rem;
                    background: ${cssVar("callouts.codeBackground")};
                    border-radius: 3px;
                }
            }

            .line-callout-error {
                background: ${cssVar("callouts.errorBackground")};
                border-left-color: ${cssVar("callouts.errorBorder")};
                &::before { content: ${cssVar("callouts.errorIcon")}; }
            }

            .line-callout-warn {
                background: ${cssVar("callouts.warnBackground")};
                border-left-color: ${cssVar("callouts.warnBorder")};
                &::before { content: ${cssVar("callouts.warnIcon")}; }
            }

            .line-callout-info {
                background: ${cssVar("callouts.infoBackground")};
                border-left-color: ${cssVar("callouts.infoBorder")};
                &::before { content: ${cssVar("callouts.infoIcon")}; }
            }

            .line-callout-ok {
                background: ${cssVar("callouts.okBackground")};
                border-left-color: ${cssVar("callouts.okBorder")};
                &::before { content: ${cssVar("callouts.okIcon")}; }
            }

            .line-callout-note {
                background: ${cssVar("callouts.noteBackground")};
                border-left-color: ${cssVar("callouts.noteBorder")};
                &::before { content: ${cssVar("callouts.noteIcon")}; }
            }

            .callout-underline {
                text-decoration: wavy underline;
                text-decoration-skip-ink: none;
                text-underline-offset: 2px;
            }

            .callout-underline-error { text-decoration-color: ${cssVar("callouts.errorUnderline")}; }
            .callout-underline-warn { text-decoration-color: ${cssVar("callouts.warnUnderline")}; }
        `,
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

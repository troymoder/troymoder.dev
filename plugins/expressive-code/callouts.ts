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

export const calloutsStyleSettings = new PluginStyleSettings({
    defaultValues: {
        callouts: {
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

interface Callout {
    line: number;
    type: CalloutType;
    message: string;
    html: string;
    colStart?: number;
    colEnd?: number;
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
                padding: ${cssVar("callouts.pad")};
                font-family: ${cssVar("callouts.font")};
                font-size: ${cssVar("callouts.fontSz")};
                line-height: 1.4;
                color: ${cssVar("callouts.txt")};
                border-left-width: 3px;
                border-left-style: solid;

                &::before { margin-right: 0.5rem; }

                code {
                    padding: 0.125rem 0.375rem;
                    font-family: "JetBrains Mono", monospace;
                    font-size: 0.75rem;
                    background: rgba(0, 0, 0, 0.08);
                    border-radius: 3px;
                }
            }

            .line-callout-error {
                background: ${cssVar("callouts.errBg")};
                border-left-color: ${cssVar("callouts.errBrd")};
                &::before { content: ${cssVar("callouts.errIcon")}; }
            }

            .line-callout-warn {
                background: ${cssVar("callouts.warnBg")};
                border-left-color: ${cssVar("callouts.warnBrd")};
                &::before { content: ${cssVar("callouts.warnIcon")}; }
            }

            .line-callout-info {
                background: ${cssVar("callouts.infoBg")};
                border-left-color: ${cssVar("callouts.infoBrd")};
                &::before { content: ${cssVar("callouts.infoIcon")}; }
            }

            .line-callout-ok {
                background: ${cssVar("callouts.okBg")};
                border-left-color: ${cssVar("callouts.okBrd")};
                &::before { content: ${cssVar("callouts.okIcon")}; }
            }

            .line-callout-note {
                background: ${cssVar("callouts.noteBg")};
                border-left-color: ${cssVar("callouts.noteBrd")};
                &::before { content: ${cssVar("callouts.noteIcon")}; }
            }

            .callout-underline {
                text-decoration: wavy underline;
                text-decoration-skip-ink: none;
                text-underline-offset: 2px;
            }

            .callout-underline-error { text-decoration-color: ${cssVar("callouts.errUnderline")}; }
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

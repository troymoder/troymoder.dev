import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element } from "hast";
import MarkdownIt from "markdown-it";
import { fromHtml } from "hast-util-from-html";
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
    warnBg: string;
    warnBrd: string;
    warnIcon: string;
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
            warnBg: "#fffbeb",
            warnBrd: "#fcd34d",
            warnIcon: "'⚠️'",
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
}

function parseLogsSection(lines: string[]): LineCallout[] {
    const callouts: LineCallout[] = [];
    const validTypes = new Set<CalloutType>(["error", "warn", "info", "ok", "note"]);
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        const match = trimmed.match(/^(error|warn|info|ok|note)@(\d+):\s*(.+)$/);
        if (!match) continue;
        
        const type = match[1] as CalloutType;
        if (!validTypes.has(type)) continue;
        
        const lineNum = parseInt(match[2]!, 10) - 1;
        const message = match[3]!.trim();
        const html = md.renderInline(message);
        
        callouts.push({ line: lineNum, type, message, html });
    }
    
    return callouts;
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

import { type ExpressiveCodePlugin } from "astro-expressive-code";
import anchorsClient from "./anchors.client.js?raw";
import { getSection, pluginBlockConfigData } from "./block-config.ts";

interface AnchorConfig {
    blockId?: string;
    lineAnchors: Map<number, string>;
}

function parseAnchorSection(lines: string[]): AnchorConfig {
    const config: AnchorConfig = { lineAnchors: new Map() };

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^(\d+):\s*(.+)$/);
        if (match) {
            const lineNum = parseInt(match[1]!, 10) - 1;
            const anchorName = match[2]!.trim();
            config.lineAnchors.set(lineNum, anchorName);
        } else if (trimmed.startsWith("id:")) {
            config.blockId = trimmed.slice(3).trim();
        } else if (!trimmed.includes(":")) {
            config.blockId = trimmed;
        }
    }

    return config;
}

export function pluginAnchors(): ExpressiveCodePlugin {
    return {
        name: "anchors",
        baseStyles: `
            .ec-line[data-anchor-highlight="full"] {
                background: rgba(255, 213, 0, 0.25);
                animation: anchor-highlight-fade 3s ease-out forwards;
            }

            .ec-line[data-anchor-highlight="partial"] .code {
                position: relative;
            }

            .anchor-highlight-overlay {
                position: absolute;
                top: 0;
                bottom: 0;
                background: rgba(255, 213, 0, 0.25);
                animation: anchor-highlight-fade 3s ease-out forwards;
                pointer-events: none;
            }

            @keyframes anchor-highlight-fade {
                0% { background: rgba(255, 213, 0, 0.3); }
                70% { background: rgba(255, 213, 0, 0.15); }
                100% { background: transparent; }
            }
        `,
        jsModules: [anchorsClient],
        hooks: {
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const anchorLines = getSection(data.sections, "anchor");
                if (!anchorLines) return;

                const config = parseAnchorSection(anchorLines);
                if (!config.blockId) return;

                renderData.blockAst.properties = renderData.blockAst.properties || {};
                renderData.blockAst.properties.id = config.blockId;
            },
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const anchorLines = getSection(data.sections, "anchor");
                if (!anchorLines) return;

                const config = parseAnchorSection(anchorLines);
                if (!config.blockId) return;

                const lineAst = renderData.lineAst;
                lineAst.properties = lineAst.properties || {};
                lineAst.properties["data-line-num"] = String(lineIndex);

                const lineAnchor = config.lineAnchors.get(lineIndex);
                if (lineAnchor) {
                    lineAst.properties.id = lineAnchor;
                }
            },
        },
    };
}

import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element } from "hast";
import { getSection, pluginBlockConfigData } from "./block-config.ts";
import diffClient from "./diff.client.js?raw";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        diff: DiffStyleSettings;
    }
}

interface DiffStyleSettings {
    lineInsertedBackground: string;
    lineInsertedBorder: string;
    lineInsertedIcon: string;
    lineInsertedIconColor: string;
    lineDeletedBackground: string;
    lineDeletedBorder: string;
    lineDeletedIcon: string;
    lineDeletedIconColor: string;
    toggleColor: string;
    toggleActiveColor: string;
}

export const diffStyleSettings = new PluginStyleSettings({
    defaultValues: {
        diff: {
            lineInsertedBackground: "rgba(34, 134, 58, 0.1)",
            lineInsertedBorder: "#22863a",
            lineInsertedIcon: `"+"`,
            lineInsertedIconColor: "#22863a",
            lineDeletedBackground: "rgba(215, 58, 73, 0.1)",
            lineDeletedBorder: "#d73a49",
            lineDeletedIcon: `"-"`,
            lineDeletedIconColor: "#d73a49",
            toggleColor: "#737373",
            toggleActiveColor: "#171717",
        },
    },
});

interface DiffConfig {
    ins: Set<number>;
    del: Set<number>;
}

function parseLineRanges(value: string): Set<number> {
    const result = new Set<number>();
    for (const part of value.split(",")) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1]!, 10);
            const end = parseInt(rangeMatch[2]!, 10);
            for (let i = start; i <= end; i++) {
                result.add(i);
            }
        } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num)) {
                result.add(num);
            }
        }
    }
    return result;
}

export function parseDiffSection(lines: string[]): DiffConfig {
    const config: DiffConfig = { ins: new Set(), del: new Set() };

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("ins:")) {
            config.ins = parseLineRanges(trimmed.slice(4));
        } else if (trimmed.startsWith("del:")) {
            config.del = parseLineRanges(trimmed.slice(4));
        }
    }

    return config;
}

export function pluginDiff(): ExpressiveCodePlugin {
    return {
        name: "diff",
        styleSettings: diffStyleSettings,
        jsModules: [diffClient],
        baseStyles: ({ cssVar }) => `
            .diff-block[data-diff-mode="diff"] {
                .ec-line.ins {
                    background: ${cssVar("diff.lineInsertedBackground")};
                    border-left: 3px solid ${cssVar("diff.lineInsertedBorder")};
                    .code::before {
                        content: ${cssVar("diff.lineInsertedIcon")};
                        color: ${cssVar("diff.lineInsertedIconColor")};
                    }
                }

                .ec-line.del {
                    background: ${cssVar("diff.lineDeletedBackground")};
                    border-left: 3px solid ${cssVar("diff.lineDeletedBorder")};
                    .code::before {
                        content: ${cssVar("diff.lineDeletedIcon")};
                        color: ${cssVar("diff.lineDeletedIconColor")};
                    }
                }

                .ec-line.ins, .ec-line.del {
                    .gutter {
                        margin-inline-start: -3px;
                    }
                    .code {
                        &::before {
                            position: absolute;
                            left: 0;
                            font-family: monospace;
                            text-align: center;
                        }
                    }
                }
            }

            .diff-block[data-diff-mode="plain"] .ec-line.del {
                display: none;
            }

            .diff-block[data-diff-mode="diff"] .diff-toggle-btn[data-mode="diff"],
            .diff-block[data-diff-mode="plain"] .diff-toggle-btn[data-mode="plain"] {
                color: ${cssVar("diff.toggleActiveColor")};
                border-bottom-color: ${cssVar("diff.toggleActiveColor")};
            }

            .diff-block {
                flex-grow: 1;
            }

            .diff-toggle-wrapper {
                display: inline-flex;
                padding: 1em;
                gap: 0.75rem;
                font-size: 0.7rem;
                margin-bottom: 0.25rem;
                position: sticky;
                left: 0;
            }

            .diff-toggle-btn {
                font-size: inherit;
                font-family: inherit;
                border: none;
                background: none;
                color: ${cssVar("diff.toggleColor")};
                cursor: pointer;
                transition: color 0.15s ease;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                padding-bottom: 1px;

                &:hover {
                    color: ${cssVar("diff.toggleActiveColor")};
                }
            }
        `,
        hooks: {
            postprocessRenderedLine: ({ codeBlock, lineIndex, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const diffLines = getSection(data.sections, "diff");
                if (!diffLines) return;

                const config = parseDiffSection(diffLines);
                const lineNum = lineIndex + 1;

                const classes = renderData.lineAst.properties.className as string[] || [];

                let noCopy = false;
                if (config.ins.has(lineNum)) {
                    classes.push("ins");
                }
                if (config.del.has(lineNum)) {
                    classes.push("del");
                    noCopy = true;
                }

                renderData.lineAst.properties.className = classes;
                renderData.lineAst.properties.dataNoCopy = noCopy;
            },
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const diffLines = getSection(data.sections, "diff");
                if (!diffLines) return;

                const config = parseDiffSection(diffLines);
                if (config.del.size === 0) return;

                const diffBtn: Element = {
                    type: "element",
                    tagName: "button",
                    properties: {
                        className: ["diff-toggle-btn"],
                        type: "button",
                        "data-mode": "diff",
                    },
                    children: [{ type: "text", value: "Diff" }],
                };

                const outputBtn: Element = {
                    type: "element",
                    tagName: "button",
                    properties: {
                        className: ["diff-toggle-btn"],
                        type: "button",
                        "data-mode": "plain",
                    },
                    children: [{ type: "text", value: "Plain" }],
                };

                const toggleWrapper: Element = {
                    type: "element",
                    tagName: "div",
                    properties: { className: ["diff-toggle-wrapper"] },
                    children: [diffBtn, outputBtn],
                };

                const figureAst = renderData.blockAst;

                const wrapper: Element = {
                    type: "element",
                    tagName: "div",
                    properties: {
                        className: ["diff-block"],
                        "data-diff-mode": "diff",
                    },
                    children: [toggleWrapper, ...figureAst.children],
                };

                figureAst.children = [wrapper];
            },
        },
    };
}

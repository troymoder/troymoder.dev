import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import { getSection, pluginBlockConfigData } from "./block-config.ts";

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
}

export const diffStyleSettings = new PluginStyleSettings({
    defaultValues: {
        diff: {
            lineInsertedBackground: "rgba(34, 134, 58, 0.1)",
            lineInsertedBorder: "#22863a",
            lineInsertedIcon: "+",
            lineInsertedIconColor: "#22863a",
            lineDeletedBackground: "rgba(215, 58, 73, 0.1)",
            lineDeletedBorder: "#d73a49",
            lineDeletedIcon: "-",
            lineDeletedIconColor: "#d73a49",
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
        baseStyles: ({ cssVar, cssVarName }) => `
            .ec-line.ins {
                background: ${cssVar("diff.lineInsertedBackground")};
                border-left: 3px solid ${cssVar("diff.lineInsertedBorder")};
            }

            .ec-line.del {
                background: ${cssVar("diff.lineDeletedBackground")};
                border-left: 3px solid ${cssVar("diff.lineDeletedBorder")};
            }

            .ec-line.ins, .ec-line.del {
                .gutter {
                    margin-inline-start: -3px;
                    &::after {
                        position: absolute;
                        font-family: monospace;
                        text-align: center;
                        transform: translateX(-3px);
                    }
                }
                .code {
                    ${cssVarName("gutterBorderColor")}: transparent;
                }
            }
            .ec-line.ins .gutter::after {
                content: ${cssVar("diff.lineInsertedIcon")};
                color: ${cssVar("diff.lineInsertedIconColor")};
            }
            .ec-line.del .gutter::after {
                content: ${cssVar("diff.lineDeletedIcon")};
                color: ${cssVar("diff.lineDeletedIconColor")};
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
        },
    };
}

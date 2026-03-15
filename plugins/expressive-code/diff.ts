import { type ExpressiveCodePlugin } from "astro-expressive-code";
import { getSection, pluginBlockConfigData } from "./block-config.ts";

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
        baseStyles: ({ cssVar, cssVarName }) => `
            .ec-line.ins {
                background: rgba(34, 134, 58, 0.1);
                border-left: 3px solid #22863a;
            }

            .ec-line.del {
                background: rgba(215, 58, 73, 0.1);
                border-left: 3px solid #d73a49;
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
            .ec-line.ins .gutter::after { content: "+"; color: #22863a; }
            .ec-line.del .gutter::after { content: "-"; color: #d73a49; }

            .expressive-code:has(.diff-view-toggle) {
                figure {
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
                .copy { transform: translateY(calc(0.5rem + 2rem)); }
            }

            .diff-view-toggle {
                display: flex;
                gap: 2px;
                padding: 0.5rem;
                background: ${cssVar("codeBackground")};
                border: 1px solid ${cssVar("borderColor")};
                border-bottom: none;
                border-radius: 5px 5px 0 0;

                button {
                    padding: 0.2rem 0.5rem;
                    font-size: 0.7rem;
                    font-family: system-ui, sans-serif;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid #e0e0e0;
                    border-radius: 3px;
                    cursor: pointer;
                    color: #666;
                    transition: all 0.15s ease;

                    &:hover { background: #f5f5f5; color: #333; }
                    &.active { background: #333; border-color: #333; color: #fff; }
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
        },
    };
}

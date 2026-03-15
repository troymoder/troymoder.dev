import { type ExpressiveCodePlugin } from "astro-expressive-code";
import { getSection, pluginBlockConfigData } from "./block-config";
import diffStyleCss from "./diff-style.css?raw";

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

export function pluginDiffStyle(): ExpressiveCodePlugin {
    return {
        name: "diff-style",
        baseStyles: diffStyleCss,
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

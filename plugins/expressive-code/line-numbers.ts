import { type ExpressiveCodePlugin } from "astro-expressive-code";
import { h, setInlineStyle } from "astro-expressive-code/hast";
import { getSection, pluginBlockConfigData, type BlockConfigSection } from "./block-config";
import lineNumbersCss from "./line-numbers.css?raw";
import { parseDiffSection } from "./diff-style";

function getDeletedLines(sections: BlockConfigSection[]): Set<number> {
    const diffLines = getSection(sections, "diff");
    if (!diffLines) return new Set();

    const config = parseDiffSection(diffLines);

    return config.del;
}

export function pluginLineNumbers(): ExpressiveCodePlugin {
    return {
        name: "line-numbers",
        baseStyles: lineNumbersCss,
        hooks: {
            preprocessCode: ({ codeBlock, addGutterElement }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const deletedLines = getDeletedLines(data.sections);

                let displayNum = 0;

                addGutterElement({
                    renderPhase: "earlier",
                    renderLine: ({ lineIndex }) => {
                        const lineNum = lineIndex + 1;
                        const isDeleted = deletedLines.has(lineNum);

                        if (!isDeleted) {
                            displayNum++;
                        }

                        return h("div.ln", { "aria-hidden": "true" }, isDeleted ? "" : `${displayNum}`);
                    },
                    renderPlaceholder: () => h("div.ln"),
                });
            },
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                const deletedLines = getDeletedLines(data.sections);

                const totalLines = codeBlock.getLines().length;
                const endLineNumber = totalLines - deletedLines.size;
                const lnWidth = endLineNumber.toString().length;

                if (lnWidth > 2) {
                    setInlineStyle(renderData.blockAst, "--lnWidth", `${lnWidth}ch`);
                }
            },
        },
    };
}

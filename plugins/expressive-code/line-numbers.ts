import { type ExpressiveCodePlugin } from "astro-expressive-code";
import { h, setInlineStyle } from "astro-expressive-code/hast";
import { type BlockConfigSection, getSection, pluginBlockConfigData } from "./block-config.ts";
import { parseDiffSection } from "./diff.ts";

function getDeletedLines(sections: BlockConfigSection[]): Set<number> {
    const diffLines = getSection(sections, "diff");
    if (!diffLines) return new Set();

    const config = parseDiffSection(diffLines);

    return config.del;
}

export function pluginLineNumbers(): ExpressiveCodePlugin {
    return {
        name: "line-numbers",
        baseStyles: ({ cssVar }) => `
            .gutter {
                position: relative;
            }

            .gutter .ln {
                display: inline-flex;
                justify-content: flex-end;
                align-items: flex-start;
                box-sizing: content-box;
                min-width: var(--lnWidth);
                padding-inline: 1.5ch 2.5ch;
                color: ${cssVar("gutterForeground")};

                .highlight & { color: ${cssVar("gutterHighlightForeground")}; }
            }

            pre {
                margin-left: calc(-1 * (var(--lnWidth) + 4ch));
            }
        `,
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

                setInlineStyle(renderData.blockAst, "--lnWidth", `${lnWidth}ch`);
            },
        },
    };
}

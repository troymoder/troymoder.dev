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
                position: sticky;
                left: 0;
                z-index: 1;
                background: inherit;
                border-inline-end: ${cssVar("gutterBorderWidth")} solid ${cssVar("gutterBorderColor")};
                &::before {
                    content: "";
                    position: absolute;
                    z-index: -1;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: ${cssVar("codeBackground")};
                }
                &::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    background: inherit;
                }
                + .code {
                    border-inline-start: 0;
                }
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
                margin-left: min(
                    -0.5em,
                    max(
                        calc(-1 * (100vw - var(--content-max-width)) / 2 + 0.5em),
                        calc(-1 * (var(--lnWidth) + 4ch))
                    )
                );
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

                setInlineStyle(renderData.blockAst, "--lnWidth", `${Math.max(lnWidth, 2)}ch`);
            },
        },
    };
}

import { type ExpressiveCodePlugin, PluginStyleSettings } from "astro-expressive-code";
import type { Element } from "hast";
import { getSection, pluginBlockConfigData } from "./block-config.ts";
import copyClient from "./copy.client.js?raw";
import copyIcon from "./copy.svg?raw";

declare module "astro-expressive-code" {
    export interface StyleSettings {
        copy: CopyStyleSettings;
    }
}

interface CopyStyleSettings {
    buttonBackground: string;
    buttonBackgroundHover: string;
    buttonBorder: string;
    buttonBorderHover: string;
    buttonColor: string;
    buttonColorHover: string;
    feedbackBackground: string;
    feedbackColor: string;
}

export const copyStyleSettings = new PluginStyleSettings({
    defaultValues: {
        copy: {
            buttonBackground: "#f5f5f5",
            buttonBackgroundHover: "#e5e5e5",
            buttonBorder: "#d4d4d4",
            buttonBorderHover: "#a3a3a3",
            buttonColor: "#737373",
            buttonColorHover: "#404040",
            feedbackBackground: "#22c55e",
            feedbackColor: "#fff",
        },
    },
});

export function pluginCopy(): ExpressiveCodePlugin {
    return {
        name: "copy",
        styleSettings: copyStyleSettings,
        baseStyles: ({ cssVar }) => `
            .expressive-code {
                position: relative;
            }

            .expressive-code .copy-button-wrapper {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.15s ease;
            }

            .expressive-code:hover .copy-button-wrapper,
            .expressive-code:focus-within .copy-button-wrapper {
                opacity: 1;
            }

            .expressive-code .copy-button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 2rem;
                height: 2rem;
                padding: 0;
                border: 1px solid ${cssVar("copy.buttonBorder")};
                border-radius: 4px;
                background: ${cssVar("copy.buttonBackground")};
                color: ${cssVar("copy.buttonColor")};
                cursor: pointer;
                transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
            }

            .expressive-code .copy-button:hover {
                background: ${cssVar("copy.buttonBackgroundHover")};
                border-color: ${cssVar("copy.buttonBorderHover")};
                color: ${cssVar("copy.buttonColorHover")};
            }

            .expressive-code .copy-button svg {
                width: 1rem;
                height: 1rem;
                pointer-events: none;
            }

            .expressive-code .copy-feedback {
                position: absolute;
                top: 0;
                right: 2.5rem;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                background: ${cssVar("copy.feedbackBackground")};
                color: ${cssVar("copy.feedbackColor")};
                border-radius: 4px;
                white-space: nowrap;
                opacity: 0;
                transform: translateX(0.5rem);
                transition: opacity 0.15s ease, transform 0.15s ease;
                pointer-events: none;
            }

            .expressive-code .copy-feedback.show {
                opacity: 1;
                transform: translateX(0);
            }
        `,
        jsModules: [copyClient],
        hooks: {
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                if (getSection(data.sections, "no-copy")) return;

                const button: Element = {
                    type: "element",
                    tagName: "button",
                    properties: {
                        className: ["copy-button"],
                        type: "button",
                        title: "Copy code",
                        "aria-label": "Copy code to clipboard",
                    },
                    children: [
                        {
                            type: "raw",
                            value: copyIcon,
                        },
                    ],
                };

                const feedback: Element = {
                    type: "element",
                    tagName: "div",
                    properties: { className: ["copy-feedback"] },
                    children: [{ type: "text", value: "Copied!" }],
                };

                const wrapper: Element = {
                    type: "element",
                    tagName: "div",
                    properties: { className: ["copy-button-wrapper"] },
                    children: [button, feedback],
                };

                const figureAst = renderData.blockAst;
                figureAst.children.push(wrapper);
            },
        },
    };
}

import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";
import { pluginBlockConfig } from "./block-config.ts";
import { pluginClickLinks } from "./click-links.ts";
import { pluginCodeAnchors } from "./code-anchors.ts";
import { pluginCopyWithoutDeleted } from "./copy-without-deleted.ts";
import { pluginDiffStyle } from "./diff-style.ts";
import { pluginHoverAnnotations } from "./hover-annotations.ts";
import { pluginIndentFold } from "./indent-fold.ts";
import { pluginLineCallouts } from "./line-callouts.ts";
import { troyModerTheme } from "./theme.ts";

export default defineEcConfig({
    themes: [troyModerTheme],
    plugins: [
        pluginLineNumbers(),
        pluginBlockConfig(),
        pluginClickLinks(),
        pluginCodeAnchors(),
        pluginDiffStyle(),
        pluginHoverAnnotations(),
        pluginIndentFold(),
        pluginLineCallouts(),
        pluginCopyWithoutDeleted(),
    ],
    styleOverrides: {
        borderRadius: "5px",
        borderWidth: "1px",
        codeFontFamily: "'JetBrains Mono', monospace, serif",
        codeFontSize: "1em",
        codeLineHeight: "1.4",
        codePaddingBlock: "1em",
        codePaddingInline: "1em",
        frames: {
            frameBoxShadowCssValue: "none",
        },
        textMarkers: {
            markBorderColor: "transparent",
            insBorderColor: "transparent",
            delBorderColor: "transparent",
        },
    },
    defaultProps: {
        showLineNumbers: true,
    },
});

import { defineEcConfig } from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginIndentFold } from "./indent-fold.ts";
import { pluginCopyWithoutDeleted } from "./copy-without-deleted.ts";
import { pluginHoverAnnotations } from "./hover-annotations.ts";
import { troyModerTheme } from "./theme.ts";

export default defineEcConfig({
    themes: [troyModerTheme],
    plugins: [pluginLineNumbers(), pluginHoverAnnotations(), pluginIndentFold(), pluginCopyWithoutDeleted()],
    styleOverrides:  {
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

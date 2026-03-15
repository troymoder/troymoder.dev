import { defineEcConfig } from "astro-expressive-code";
import { pluginAnchors } from "./anchors.ts";
import { pluginBlockConfig } from "./block-config.ts";
import { pluginCallouts } from "./callouts.ts";
import { pluginCopy } from "./copy.ts";
import { pluginDiff } from "./diff.ts";
import { pluginFolding } from "./folding.ts";
import { pluginLineNumbers } from "./line-numbers.ts";
import { pluginLinks } from "./links.ts";
import { troyModerTheme } from "./theme.ts";
import { pluginTooltips } from "./tooltips.ts";

export default defineEcConfig({
    themes: [troyModerTheme],
    frames: false,
    textMarkers: false,
    plugins: [
        pluginBlockConfig(),
        pluginLineNumbers(),
        pluginLinks(),
        pluginAnchors(),
        pluginDiff(),
        pluginTooltips(),
        pluginFolding(),
        pluginCallouts(),
        pluginCopy(),
    ],
    styleOverrides: {
        borderRadius: "5px",
        borderWidth: "1px",
        codeFontFamily: "'JetBrains Mono', monospace, serif",
        codeFontSize: "1em",
        codeLineHeight: "1.4",
        codePaddingBlock: "1em",
        codePaddingInline: "1em",
    },
});

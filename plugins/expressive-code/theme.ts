import { ExpressiveCodeTheme } from "astro-expressive-code";

const colors = {
    bg: "#fffcfa",
    fg: "#1a1a2e",
    muted: "#888888",
    border: "#e8e4e0",
    primary: "#f0e6dc",
};

export const troyModerTheme = new ExpressiveCodeTheme({
    name: "troy-moder",
    type: "light",
    styleOverrides: {
        diff: {
            // lineInsertedIcon: "",
            // lineDeletedIcon: "",
        },
    },
    colors: {
        "editor.background": colors.bg,
        "editor.foreground": colors.fg,
        "editorLineNumber.foreground": colors.muted,
        "editorLineNumber.activeForeground": colors.fg,
        "editor.selectionBackground": colors.primary,
        "editor.lineHighlightBackground": colors.primary + "4d",
        "editorBracketMatch.background": colors.primary + "80",
        "editorBracketMatch.border": colors.border,
        "focusBorder": colors.border,
        "titleBar.border": colors.border,
        "scrollbarSlider.background": colors.border + "80",
        "scrollbarSlider.hoverBackground": colors.border,
    },
    tokenColors: [
        {
            scope: ["comment", "punctuation.definition.comment"],
            settings: { foreground: "#a0a0a0", fontStyle: "italic" },
        },
        {
            scope: ["string", "string.quoted"],
            settings: { foreground: "#22863a" },
        },
        {
            scope: ["constant.numeric", "constant.language"],
            settings: { foreground: "#005cc5" },
        },
        {
            scope: ["keyword", "storage.type", "storage.modifier"],
            settings: { foreground: "#AB3AD7" },
        },
        {
            scope: ["entity.name.function", "support.function"],
            settings: { foreground: "#425EC1" },
        },
        {
            scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
            settings: { foreground: "#c23a3a" },
        },
        {
            scope: ["variable", "variable.other"],
            settings: { foreground: colors.fg },
        },
        {
            scope: ["variable.parameter"],
            settings: { foreground: "#2e6b8a" },
        },
        {
            scope: ["entity.name.tag"],
            settings: { foreground: "#22863a" },
        },
        {
            scope: ["entity.other.attribute-name"],
            settings: { foreground: "#6f42c1" },
        },
        {
            scope: ["punctuation", "meta.brace"],
            settings: { foreground: "#444d56" },
        },
        {
            scope: ["constant.other.placeholder", "variable.interpolation"],
            settings: { foreground: "#005cc5" },
        },
        {
            scope: ["meta.diff.header", "meta.diff.index"],
            settings: { foreground: "#6f42c1" },
        },
        {
            scope: ["markup.inserted"],
            settings: { foreground: "#22863a", background: "#e6ffed" },
        },
        {
            scope: ["markup.deleted"],
            settings: { foreground: "#d73a49", background: "#ffeef0" },
        },
    ],
});

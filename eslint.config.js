import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...eslintPluginSvelte.configs["flat/recommended"],
    ...eslintPluginAstro.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ["**/*.svelte"],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    },
    {
        ignores: [
            "node_modules/",
            "dist/",
            ".astro/",
            "pnpm-lock.yaml",
        ],
    },
);

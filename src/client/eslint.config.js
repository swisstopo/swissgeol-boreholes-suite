import tanstackQuery from "@tanstack/eslint-plugin-query";
import compatPlugin from "eslint-plugin-compat";
import cypress from "eslint-plugin-cypress/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import noHardcodedColors from "./eslint-rules/no-hardcoded-colors.js";

// oxlint (.oxlintrc.json) runs every rule it implements natively, including all type-aware ones.
// This config only holds what oxlint cannot run natively. None of it needs type information, so
// ESLint parses without building a TypeScript program, which is what used to make it slow.
export default defineConfig([
  globalIgnores([
    "**/dist",
    "tsconfig.json",
    "eslint.config.js",
    "**/cypress/downloads",
    "**/dev",
    "**/.vscode",
    "server.cjs",
  ]),
  {
    extends: [cypress.configs.recommended, ...tanstackQuery.configs["flat/recommended"]],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Needs type information, which this config deliberately does not provide. Without it the rule
      // returns early and checks nothing, so it is switched off rather than left looking active.
      "@tanstack/query/no-void-query-fn": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["src/AppTheme.ts", "src/mui.theme.d.ts", "cypress/**", "**/*.test.ts", "**/*.test.tsx"],
    plugins: {
      local: { rules: { "no-hardcoded-colors": noHardcodedColors } },
    },
    rules: {
      "local/no-hardcoded-colors": "warn",
    },
  },
  {
    // Flags browser APIs outside the support baseline declared by "browserslist" in package.json.
    // Scoped to shipped source: tests and Cypress specs do not run in the target browsers.
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    plugins: {
      compat: compatPlugin,
    },
    rules: {
      "compat/compat": "error",
    },
  },
  {
    // oxlint does not lint JSON. A duplicate key in a locale file silently drops a translation.
    files: ["**/*.json"],
    rules: {
      "no-dupe-keys": "error",
    },
  },
]);

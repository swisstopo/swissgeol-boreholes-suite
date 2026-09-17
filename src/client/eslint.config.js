import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import cypress from "eslint-plugin-cypress/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import noHardcodedColors from "./eslint-rules/no-hardcoded-colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([globalIgnores(["**/dist", "tsconfig.json", "eslint.config.js", "**/cypress/downloads",  "**/dev","**/.vscode", "server.cjs"]),
  {
    extends: [
        js.configs.recommended,
        react.configs.flat.recommended,
        react.configs.flat["jsx-runtime"],
        prettierRecommended,
        ...tseslint.configs.recommended,
        cypress.configs.recommended,
        jsxA11y.flatConfigs.recommended,
        ...tanstackQuery.configs["flat/recommended"],
    ],
    plugins: {
        "react-refresh": reactRefresh,
    },
    languageOptions: {
        globals: {
            ...globals.browser,
        },
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "prettier/prettier": "error",
        "react-refresh/only-export-components": ["warn", {
            allowConstantExport: true,
        }],
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/display-name": "off",
    },
  },
  {
    // React Compiler diagnostics.
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    rules: {
      // Off pending a dedicated cleanup: 53 violations across 39 files.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // Type-aware linting.
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
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
    files: ['**/*[cC]ontext.ts', '**/*[cC]ontext.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
]);

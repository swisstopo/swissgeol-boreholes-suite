import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-plugin-prettier";
import cypress from "eslint-plugin-cypress";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/dist", "tsconfig.json", "eslint.config.mjs", "**/cypress/downloads",  "**/dev","**/.vscode", "server.cjs"]),
  {
    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:cypress/recommended",
        "plugin:jsx-a11y/recommended",
    )),
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "react-refresh": reactRefresh,
        prettier: fixupPluginRules(prettier),
        cypress: fixupPluginRules(cypress),
    },
    languageOptions: {
        globals: {
            ...globals.browser,
        },
        parser: tsParser,
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

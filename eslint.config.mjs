import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";
import airbnbConfig from "eslint-config-airbnb";
import tsParser from "@typescript-eslint/parser";

// Exporting flat configuration
export default [
  {
    files: ["src/**/*.{js,mjs,ts}"],
    languageOptions: {
      parser: tsParser, // Use TypeScript parser for both JS and TS files
      globals: { ...globals.browser, ...globals.jest, process: "readonly", require: 'readonly',__dirname: 'readonly'}, // Enable Jest and browser globals
    },
    plugins: {
      prettier: prettierPlugin,
      "@typescript-eslint": tseslint,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...airbnbConfig.rules,

      // Consolidated Prettier rules
      "prettier/prettier": ["error", { "semi": true }],

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'error',
    },
  },
];

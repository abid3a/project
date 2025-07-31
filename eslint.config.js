// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // Path resolution
      'import/no-unresolved': 'off', // Disable this rule as it conflicts with TypeScript path mapping
      
      // Code quality improvements
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'warn',
      'import/no-duplicates': 'warn',
      
      // Prefer const over let when variables are not reassigned
      'prefer-const': 'error',
      
      // Enforce consistent spacing
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // Enforce consistent semicolons
      'semi': ['error', 'always'],
      
      // Enforce consistent quotes
      'quotes': ['error', 'single', { avoidEscape: true }],
    },
  }
]);

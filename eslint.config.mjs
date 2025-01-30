import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
// noinspection NpmUsedModulesInstalled
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

import airbnbRules from './airbnb-eslint-rules.mjs';
import airbnbTypescriptRules from './airbnb-typescript-eslint-rules.mjs';

export default typescriptEslint.config(
  eslint.configs.recommended,
  typescriptEslint.configs.strictTypeChecked,
  typescriptEslint.configs.stylisticTypeChecked,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  importPlugin.flatConfigs.recommended,
  ...airbnbRules,
  ...airbnbTypescriptRules,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'arrow-body-style': 0,
      'class-methods-use-this': 0,
      'import/no-unresolved': 0,
      'import/prefer-default-export': 0,
      'no-await-in-loop': 0,
      'no-bitwise': 2,
      'no-console': [1, { allow: ['warn', 'error'] }],
      'no-continue': 0,
      'no-multiple-empty-lines': 2,
      'no-param-reassign': 2,
      'no-restricted-syntax': [2, 'ForInStatement', 'LabeledStatement', 'WithStatement'],
      'no-return-assign': [2, 'except-parens'],
      'no-undef': 0,
      'no-unused-vars': 0,
      'object-curly-newline': 0,
      'prettier/prettier': 1,
      quotes: [2, 'single', { allowTemplateLiterals: true }],
      semi: [2, 'always'],

      'max-len': [
        2,
        120,
        2,
        {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],

      '@stylistic/lines-between-class-members': 0,

      '@typescript-eslint/prefer-nullish-coalescing': [2, { ignorePrimitives: { boolean: true, string: true } }],
      '@typescript-eslint/consistent-type-definitions': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-unused-vars': [1, { caughtErrors: 'none' }],
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      '@typescript-eslint/no-confusing-void-expression': [2, { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-misused-promises': [2, { checksVoidReturn: false }],
      '@typescript-eslint/no-dynamic-delete': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/restrict-template-expressions': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/no-extraneous-class': 0,
      '@typescript-eslint/no-redundant-type-constituents': 0,
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 0,
      '@typescript-eslint/explicit-function-return-type': [2, { allowExpressions: true }],

      'import/order': [
        2,
        {
          groups: ['builtin', 'external', 'internal'],

          pathGroups: [
            {
              pattern:
                '@+(api|components|compositions|directives|enums|interfaces|layouts|modules|services|utils|views)/**',
              group: 'internal',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '*.scss',
              group: 'index',

              patternOptions: {
                matchBase: true,
              },
            },
          ],

          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
);

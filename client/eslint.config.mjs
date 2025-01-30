import eslintPluginVue from 'eslint-plugin-vue';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
// noinspection NpmUsedModulesInstalled
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

import baseEslintConfig from '../eslint.config.mjs';

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  ...pluginVueA11y.configs['flat/recommended'],
  {
    extends: [...baseEslintConfig, ...eslintPluginVue.configs['flat/recommended']],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'import/extensions': 0,
      'import/named': 0,

      '@typescript-eslint/no-unsafe-argument': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/no-unsafe-return': 0,
      '@typescript-eslint/prefer-function-type': 0,
      '@typescript-eslint/unified-signatures': 0,

      'vue/attribute-hyphenation': [2, 'never'],
      'vue/max-attributes-per-line': 0,
      'vue/v-on-event-hyphenation': [2, 'never'],
      'vuejs-accessibility/anchor-has-content': 0,
      'vuejs-accessibility/heading-has-content': 0,

      'import/order': [
        2,
        {
          groups: ['builtin', 'external', 'internal'],
          pathGroups: [
            {
              pattern: 'vue',
              group: 'external',
              position: 'before',
            },
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
              patternOptions: { matchBase: true },
            },
          ],
          pathGroupsExcludedImportTypes: ['vue'],
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

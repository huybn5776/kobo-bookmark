module.exports = {
  root: true,
  env: {
    es2020: true,
    browser: true,
  },
  extends: [
    '../.eslintrc.js',
    'plugin:vue/vue3-essential',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/eslint-config-typescript',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import', 'jsx-a11y'],
  ignorePatterns: ['dist/**', '.eslintrc.js', 'config-overrides.js'],
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  rules: {
    // override rule from 'plugin:@typescript-eslint/recommended'
    'react/jsx-filename-extension': 0,

    '@typescript-eslint/explicit-function-return-type': [2, { allowExpressions: true }],

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
            pattern: '@+(api|components|compositions|directives|enums|interfaces|layouts|modules|services|utils|views)/**',
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

    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/label-has-associated-control': [
      2,
      {
        some: ['nesting', 'id'],
        labelComponents: [],
        labelAttributes: [],
        controlComponents: [],
        depth: 25,
      },
    ],
    'jsx-a11y/no-static-element-interactions': 0,

    'vue/component-tags-order': [
      'error',
      {
        order: ['template', 'script', 'style'],
      },
    ],
    'vue/attributes-order': 1,
  },
};

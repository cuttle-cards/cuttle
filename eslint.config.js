const js = require('@eslint/js');
const globals = require('globals');
const vue = require('eslint-plugin-vue');
const vuetify = require('eslint-plugin-vuetify');
const prettier = require('eslint-plugin-prettier');
const noOnlyTests = require('eslint-plugin-no-only-tests');

const normalizeGlobals = (input) =>
  Object.fromEntries(Object.entries(input || {}).map(([ key, value ]) => [ key.trim(), value ]));

const nodeGlobals = {
  ...normalizeGlobals(globals.node),
  fetch: 'readonly',
  Headers: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
};

const browserGlobals = normalizeGlobals(globals.browser);

const sharedTestRules = {
  'import/no-unresolved': [ 'off' ],
};

const sailsGlobals = {
  _: true,
  sails: true,
  userService: true,
  // Models
  Card: true,
  Season: true,
  Match: true,
  User: true,
  Game: true,
  UserSpectatingGame: true,
  GameStateRow: true,
  Identity: true,
};

const clientFiles = '**/client/**/*.{j,t}s?(x)';
const storybookFiles = '**/(.storybook|stories)/**/*.{j,t}s?(x)';
const apiFiles = '**/api/**/*.{j,t}s?(x)';
const unitTestFiles = '**/tests/unit/**/*.{j,t}s?(x)';
const e2eTestFiles = '**/tests/e2e/**/*.{j,t}s?(x)';
const browserFiles = [
  'src/**/*.{js,ts,vue}',
  'stories/**/*.{js,ts,vue}',
  '.storybook/**/*.{js,ts}',
  'utils/**/*.{js,ts}',
  'vitest.config.mjs',
];

module.exports = [
  {
    ignores: [ 'node_modules/*', 'assets/*' ],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...vuetify.configs['flat/base'],
  {
    files: [ '**/*.{js,cjs,mjs,ts,vue}' ],
    plugins: {
      vue,
      vuetify,
      prettier,
      'no-only-tests': noOnlyTests,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      'eol-last': [ 'error', 'always' ],
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
      'array-bracket-spacing': [ 'error', 'always' ],
      'object-curly-spacing': [ 'error', 'always' ],
      'spaced-comment': [
        'error',
        'always',
        {
          block: {
            markers: [ '!' ],
            exceptions: [ '*' ],
          },
          line: {
            markers: [ '/', '//' ],
            exceptions: [ '*', '/' ],
          },
        },
      ],
      'newline-per-chained-call': [ 'error', { ignoreChainWithDepth: 2 } ],
      indent: [ 'error', 2, { SwitchCase: 1 } ],
      'vue/html-indent': [ 'error' ],
      'vue/multi-word-component-names': [ 'error' ],
      'prefer-destructuring': [ 'error' ],
      'no-else-return': [
        'error',
        {
          allowElseIf: true,
        },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: true,
        },
      ],
      'keyword-spacing': [ 'error', { before: true, after: true } ],
      'no-case-declarations': 'error',
      'no-unused-vars': [ 'error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' } ],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      quotes: [ 'error', 'single', { allowTemplateLiterals: true } ],
      semi: [ 'error', 'always' ],
      curly: 'error',
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 3,
          },
          multiline: {
            max: 1,
          },
        },
      ],
      'vue/first-attribute-linebreak': [
        'error',
        {
          singleline: 'beside',
          multiline: 'below',
        },
      ],
    },
  },
  {
    files: browserFiles,
    languageOptions: {
      globals: browserGlobals,
    },
  },
  {
    files: [ clientFiles ],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
  {
    files: [ storybookFiles ],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
  {
    files: [ apiFiles ],
    languageOptions: {
      globals: sailsGlobals,
    },
    rules: {
      'no-undef': 'error',
      'no-prototype-builtins': 'error',
    },
  },
  {
    files: [ unitTestFiles ],
    languageOptions: {
      globals: {
        ...sailsGlobals,
        ...browserGlobals,
      },
    },
    rules: {
      ...sharedTestRules,
    },
  },
  {
    files: [ e2eTestFiles ],
    languageOptions: {
      globals: {
        ...browserGlobals,
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        describe: 'readonly',
        context: 'readonly',
        it: 'readonly',
        specify: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        badRequest: true,
        io: true,
        ready1: true,
        request: true,
        socket1: true,
        socket2: true,
        socket3: true,
        Promise: true,
      },
    },
    rules: {
      ...sharedTestRules,
      'no-only-tests/no-only-tests': 'error',
    },
  },
];

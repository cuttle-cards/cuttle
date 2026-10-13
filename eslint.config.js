const path = require('path');
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

// Keep these aliases in sync with vite.config.mjs. ESLint's CommonJS config cannot import it.
const aliases = { _: __dirname, '@': path.join(__dirname, 'src') };

const resolveSpecifier = (fromDir, spec) => {
  const alias = Object.keys(aliases).find((prefix) => spec === prefix || spec.startsWith(`${prefix}/`));
  if (alias) {
    return path.resolve(aliases[alias], spec.slice(alias.length + (spec === alias ? 0 : 1)));
  }
  return spec.startsWith('.') ? path.resolve(fromDir, spec) : null;
};

const resolvedJsonCache = new Map();
const resolvesToJson = (target) => {
  if (!resolvedJsonCache.has(target)) {
    try {
      resolvedJsonCache.set(target, require.resolve(target).endsWith('.json'));
    } catch {
      resolvedJsonCache.set(target, false);
    }
  }
  return resolvedJsonCache.get(target);
};

const jsonExtensions = {
  rules: {
    'explicit-json-extension': {
      meta: {
        type: 'problem',
        fixable: 'code',
        schema: [],
        messages: {
          missing: `'{{spec}}' resolves to a JSON file; write '{{spec}}.json' so the editor can resolve it (see #1397).`,
        },
      },
      create(context) {
        const fromDir = path.dirname(context.filename);
        const check = (node) => {
          if (node?.type !== 'Literal' || typeof node.value !== 'string' || node.value.endsWith('.json')) {
            return;
          }
          const target = resolveSpecifier(fromDir, node.value);
          if (!target || !resolvesToJson(target)) {
            return;
          }
          context.report({
            node,
            messageId: 'missing',
            data: { spec: node.value },
            fix: (fixer) => {
              const raw = context.sourceCode.getText(node);
              return fixer.replaceText(node, `${raw.slice(0, -1)}.json${raw.slice(-1)}`);
            },
          });
        };
        return {
          'CallExpression[callee.name="require"]': (node) => check(node.arguments[0]),
          ImportDeclaration: (node) => check(node.source),
          ImportExpression: (node) => check(node.source),
          ExportNamedDeclaration: (node) => check(node.source),
          ExportAllDeclaration: (node) => check(node.source),
        };
      },
    },
  },
};

module.exports = [
  {
    // The worktree dirs are git-ignored, but that doesn't stop eslint walking into them: each
    // holds a full checkout, so linting them reports errors for code that isn't this stack's.
    ignores: [ 'node_modules/*', 'assets/*', 'worktrees/*', '.claude/worktrees/*' ],
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
      'json-extensions': jsonExtensions,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      'json-extensions/explicit-json-extension': 'error',
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
      'vue/enforce-style-attribute': [ 'error', { allow: [ 'scoped' ] } ],
    },
  },
  {
    files: [ 'src/App.vue' ],
    rules: {
      'vue/enforce-style-attribute': 'off',
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
      'no-only-tests/no-only-tests': 'error',
    },
  },
];

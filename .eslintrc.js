const sharedTestRules = {
  'import/no-unresolved': [ 'off' ],
};

const sailsGlobals = {
  _: true,
  sails: true,
  cardService: true,
  gameService: true,
  userService: true,
  // Models
  Card: true,
  Season: true,
  Match: true,
  User: true,
  Game: true,
  UserSpectatingGame: true,
  GameStateRow: true,
};

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [ 'eslint:recommended', 'plugin:vue/vue3-recommended', 'plugin:vuetify/base' ],
  plugins: [ 'cypress', 'vitest', 'prettier', 'mocha' ],
  ignorePatterns: [ '/node_modules/*', '/assets/*' ],
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
        'block': {
          'markers': [ '!' ],  
          'exceptions': [ '*' ] // Allow JSDoc comments
        },
        'line': {
          'markers': [ '/', '//' ], 
          'exceptions': [ '*', '/' ] // Allow comments starting with /
        }
      }
    ],
    'newline-per-chained-call': [ 'error', { ignoreChainWithDepth: 2 } ],
    'indent': [ 'error', 2, { SwitchCase: 1 } ],
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
    'no-case-declarations': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    quotes: [ 'error', 'single', { avoidEscape: true, allowTemplateLiterals: true } ],
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
  overrides: [
    {
      files: [ '**/client/**/*.{j,t}s?(x)' ],
      extends: [ 'eslint:recommended', 'plugin:prettier/recommended', 'plugin:vue/recommended' ],
      rules: {
        'no-undef': 'error',
        'no-prototype-builtins': 'error',
        'no-case-declarations': 'error',
      },
    },
    // Storybook specific rules
    {
      files: [ '**/(.storybook|stories)/**/*.{j,t}s?(x)' ],
      extends: [ 'eslint:recommended', 'plugin:prettier/recommended', 'plugin:storybook/recommended' ],
      rules: {
        'no-undef': 'error',
        'no-prototype-builtins': 'error',
      },
    },
    // Sails specific rules
    {
      files: [ '**/api/**/*.{j,t}s?(x)' ],
      globals: sailsGlobals,
      rules: {
        'no-undef': 'error',
        'no-prototype-builtins': 'error',
      },
    },
    // Vittest specific rules
    {
      files: [ '**/tests/unit/**/*.{j,t}s?(x)' ],
      globals: sailsGlobals,
      rules: {
        ...sharedTestRules,
      },
    },
    // Cypress specific rules
    {
      files: [ '**/tests/e2e/**/*.{j,t}s?(x)' ],
      env: {
        'cypress/globals': true,
      },
      globals: {
        badRequest: true,
        cardService: true,
        io: true,
        ready1: true,
        request: true,
        socket1: true,
        socket2: true,
        socket3: true,
        Promise: true,
      },
      rules: {
        ...sharedTestRules,
        'mocha/no-exclusive-tests': 'error'
      },
    },
  ],
};

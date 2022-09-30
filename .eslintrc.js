const sharedTestRules = {
  'import/no-unresolved': ['off'],
};

module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },

  extends: [
    'plugin:vue/recommended',
    'plugin:vue/essential',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],

  plugins: ['cypress', 'jest', 'prettier'],

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },

  globals: {
    _: 'readonly',
    sails: 'readonly',
  },

  ignorePatterns: ['/node_modules/*', '/assets/*'],

  rules: {
    'prettier/prettier': 'error',
    'max-len': [
      'warn',
      {
        code: 110,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'vue/html-indent': ['error'],
    'vue/multi-word-component-names': ['warn'],
    'prefer-destructuring': ['warn'],
    'no-else-return': [
      'warn',
      {
        allowElseIf: true,
      },
    ],
    'no-case-declarations': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },

  overrides: [
    // Storybook specific rules
    {
      files: ['**/(.storybook|stories)/**/*.{j,t}s?(x)'],
      extends: ['plugin:storybook/recommended'],
      rules: {
        'no-undef': 'warn',
        'no-prototype-builtins': 'warn',
      },
    },
    // Sails specific rules
    {
      files: ['**/api/**/*.{j,t}s?(x)'],
      rules: {
        'no-undef': 'warn',
        'no-prototype-builtins': 'warn',
      },
      globals: {
        Card: true,
        Season: true,
        Match: true,
        User: true,
        Game: true,
      },
    },
    // Jest specific rules
    {
      files: ['**/tests/unit/**/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
      rules: sharedTestRules,
    },
    // Cypress specific rules
    {
      files: ['**/tests/e2e/**/*.{j,t}s?(x)'],
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
      },
      rules: sharedTestRules,
    },
  ],

  root: true,
};

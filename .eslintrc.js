module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "extends": [
    "plugin:vue/recommended",
    "plugin:vue/essential",
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": [
    "jest",
    "cypress"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "parser": "@babel/eslint-parser",
    "requireConfigFile": false
  },
  "rules": {
    "prettier/prettier": "error",
    "max-len": [
      "warn",
      {
        "code": 110,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true
      }
    ],
    "vue/html-indent": [
      "error"
    ],
    "prefer-destructuring": [
      "warn"
    ],
    "no-else-return": [
      "warn",
      {
        "allowElseIf": true
      }
    ]
  },
  "overrides": [
    {
      "files": [
        "**/tests/*.{j,t}s?(x)",
        "**/tests/unit/**/*.{j,t}s?(x)"
      ],
      "env": {
        "jest": true
      },
      "globals": {
        "badRequest": true,
        "cardService": true,
        "io": true,
        "ready1": true,
        "request": true,
        "socket1": true,
        "socket2": true,
        "socket3": true
      },
      "rules": {
        "import/no-unresolved": [
          "off"
        ]
      }
    },
    {
      "files": [
        "**/tests/e2e/**/*.{j,t}s?(x)"
      ],
      "env": {
        "cypress/globals": true
      },
      "rules": {
        "import/no-unresolved": [
          "off"
        ]
      }
    }
  ],
  "root": true
};

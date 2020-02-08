/**
 * Note: ESLint is included in our `package.json` install, but you'll want to set up 
 * your editor with the official eslint plugin as well and ensure it is running rules
 * for eslint, eslint-plugin-vue, and eslint-plugin-jest!
 */

module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest/globals": true
  },
  // Global variables set via webpack.ProvidePlugin or webpack.DefinePlugin, or for eslint to ignore
  "globals": {
    "$": false,
    "jQuery": false,
    "window.jQuery": false,
    "Tether": false,
    "SENTRY_DSN": false
  },
  "plugins": [
    "vue",
    "jest"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:vue/recommended",
    "plugin:jest/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module",
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    }
  },
  "rules": {
    "indent": ["error", 4],
    "linebreak-style": 0,
    "quotes": 0,
    "semi": [
      "error",
      "always"
    ],
    "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
    "camelcase": 0,
    "no-use-before-define": 0,
    "no-plusplus": 0,
    "consistent-return": 0,
    "no-underscore-dangle": 0,
    "arrow-body-style": 0,
    "no-console": 0,
    "object-curly-spacing": 0,
    "no-multiple-empty-lines": 0,
    "spaced-comment": 0,
    "no-throw-literal": 0,
    // eslint-plugin-vue rule overrides
    "vue/attributes-order": 0,
    "vue/attribute-hyphenation": [2, "always"],
    "vue/no-parsing-error": [2, {
      "abrupt-closing-of-empty-comment": true,
      "absence-of-digits-in-numeric-character-reference": true,
      "cdata-in-html-content": true,
      "character-reference-outside-unicode-range": true,
      "control-character-in-input-stream": true,
      "control-character-reference": true,
      "eof-before-tag-name": true,
      "eof-in-cdata": true,
      "eof-in-comment": true,
      "eof-in-tag": true,
      "incorrectly-closed-comment": true,
      "incorrectly-opened-comment": true,
      "invalid-first-character-of-tag-name": true,
      "missing-attribute-value": true,
      "missing-end-tag-name": true,
      "missing-semicolon-after-character-reference": true,
      "missing-whitespace-between-attributes": true,
      "nested-comment": true,
      "noncharacter-character-reference": true,
      "noncharacter-in-input-stream": true,
      "null-character-reference": true,
      "surrogate-character-reference": true,
      "surrogate-in-input-stream": true,
      "unexpected-character-in-attribute-name": true,
      "unexpected-character-in-unquoted-attribute-value": true,
      "unexpected-equals-sign-before-attribute-name": true,
      "unexpected-null-character": true,
      "unexpected-question-mark-instead-of-tag-name": true,
      "unexpected-solidus-in-tag": true,
      "unknown-named-character-reference": true,
      "end-tag-with-attributes": true,
      "duplicate-attribute": true,
      "end-tag-with-trailing-solidus": true,
      "non-void-html-element-start-tag-with-trailing-solidus": false,
      "x-invalid-end-tag": false,
      "x-invalid-namespace": true
    }],
    "vue/html-indent": ["error", 4],
    "vue/html-self-closing": ["error", {
      "html": {
        "void": "never",
        "normal": "any",
        "component": "any"
      },
      "svg": "always",
      "math": "always"
    }],
    "vue/max-attributes-per-line": 0
  }
};

module.exports = {
  root: true,
  env: {
    webextensions: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    "parser": "babel-eslint",
    "ecmaVersion": 2020,
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],

  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prettier/prettier": "off",
    "no-empty": "off",
    "prefer-const": "off",
    "@typescript-eslint/no-var-requires": "off",
    "no-undef": "off",
    "no-debugger": "off",
    "no-unreachable": "off",
  }
};

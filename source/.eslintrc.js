module.exports = {
  root: true,
  globals: {
    chrome: true,
  },
  env: {
    node: true,
    webextensions: true,
  },
  // parser: "vue-eslint-parser",
  // parserOptions: {
  //   "parser": "babel-eslint",
  //   "ecmaVersion": 2020,
  //   ecmaFeatures: {
  //     legacyDecorators: true
  //   }
  // },
  parserOptions: {
    parser: "@typescript-eslint/parser"
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
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-prototype-builtins": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-inner-declarations": "off",
    "vue/no-unused-vars": "off",
    "@typescript-eslint/no-namespace": "off"
  }
};

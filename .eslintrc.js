module.exports = {
  root: true,
  env: {
    node: true
  },
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    'no-unused-vars': 'warn',
    "indent": "off",
    "@typescript-eslint/indent": ["error", 2]
  },
}
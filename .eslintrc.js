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
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/semi": ["error", "never"],
    "no-trailing-spaces": ["warn"],
    '@typescript-eslint/no-var-requires': 0,
  },
}
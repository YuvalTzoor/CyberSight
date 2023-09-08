module.exports = {
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: ["turbo", "eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["index.js"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
  },
};

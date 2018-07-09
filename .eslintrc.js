module.exports = {
  parser: "babel-eslint",
  env: {
    es6: true,
    browser: true,
    commonjs: true,
    node: true
  },
  globals: {
    'wx': true,
    'Page': true,
    'App': true,
    'getCurrentPages': true,
    'getApp': true
  },
  extends: [
    "eslint:recommended"
  ],
  rules: {
    'no-console': 0
  }
}
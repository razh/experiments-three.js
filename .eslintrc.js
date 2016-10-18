module.exports = {
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  globals: {
    Float32Array: true,
    Promise: true,
  },
  rules: {
    'comma-spacing': ['error', { before: false, after: true }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console': 'off',
    'object-curly-spacing': ['error', 'always'],
    semi: ['error', 'always'],
    quotes: ['error', 'single', 'avoid-escape'],
  },
};

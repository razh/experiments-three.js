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
    'comma-spacing': [2, { before: false, after: true }],
    indent: ['error', 2],
    'no-console': 0,
    'object-curly-spacing': ['error', 'always'],
    semi: ['error', 'always'],
    quotes: [2, 'single', 'avoid-escape'],
  },
};

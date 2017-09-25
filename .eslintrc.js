module.exports = {
  extends: 'eslint:recommended',
  env: {
    es6: true,
    browser: true,
  },
  globals: {
    Float32Array: true,
    Promise: true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'object-curly-spacing': ['error', 'always'],
    semi: ['error', 'always'],
    quotes: ['error', 'single', 'avoid-escape'],
  },
};

module.exports = {
  extends: 'eslint:recommended',
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
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

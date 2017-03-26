module.exports = {
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {
      globalReturn: true,
    },
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-undef': 'off',
    semi: 'off',
  },
};

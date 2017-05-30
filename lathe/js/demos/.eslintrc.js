module.exports = {
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {
      globalReturn: true,
    },
  },
  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
    'no-undef': 'off',
    semi: 'off',
  },
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['prettier', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier', 'react'],
  rules: {
    'react/prop-types': 0,
    'react/jsx-wrap-multilines': 'off',
    'prettier/prettier': [
      2,
      {
        bracketSpacing: true,
        printWidth: 140,
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        useTabs: false,
        endOfLine: 'auto',
      },
    ],
    'no-use-before-define': [2, { variables: false }],
    'no-unused-vars': [1, { ignoreRestSiblings: false }],
    'max-len': [2, { code: 140 }],
  },
};

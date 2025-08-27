module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    project: null,
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  settings: {
    // важное: разрешаем .js импорты, резолвящиеся в .ts при NodeNext
    'import/resolver': {
      node: { extensions: ['.js', '.ts'] },
    },
  },
  rules: {},
};
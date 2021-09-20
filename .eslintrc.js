module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      files: ['src/**/*.ts'],
      rules: {
        // '@typescript-eslint/explicit-module-boundary-types': 'off',
        // '@typescript-eslint/no-explicit-any': 'off',
        // '@typescript-eslint/ban-types': 'off',
        // '@typescript-eslint/no-non-null-assertion': 'off',
      }
    }
  ]
}

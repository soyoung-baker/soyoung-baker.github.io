module.exports = {
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: false,
  parser: 'typescript',
  arrowParens: 'always',
  importOrder: [
    '^react',
    '^next',
    '<THIRD_PARTY_MODULES>',
    '^~/api/(.*)$',
    '^~/hooks/(.*)$',
    '^~/components/(.*)$',
    '^~/utils/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        semi: false,
      },
    },
  ],
}

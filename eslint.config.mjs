// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt({
  rules: {
    // Disable TypeScript any type checking
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
}).append({
  name: 'prettier-integration',
  plugins: {
    prettier: eslintPluginPrettier,
  },
  rules: {
    ...eslintConfigPrettier.rules,
    'prettier/prettier': 'error',
  },
})

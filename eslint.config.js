import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // `useLocal()` here is a plain predicate that reads an env var and the
    // query string, not a React hook — the rule matches on the name alone.
    // Left as-is rather than renaming transport plumbing for a lint rule.
    files: ['src/lib/transport.ts'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    // Node-side tooling: balance sweeps and the Playwright playthrough.
    files: ['scripts/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
)

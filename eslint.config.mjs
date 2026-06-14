// Mimir — root ESLint flat config (ESLint v9).
// Per CLAUDE.md §5 + §15:
//   - TypeScript strict; no `any`; no unused vars; no console.log in production code.
//   - Per-app overrides live in apps/{mobile,api}/eslint.config.mjs and extend this.
//   - Generated files, build output, and node_modules are ignored.

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',
      '**/generated/**',
      '**/generated.ts',
      '**/*.generated.ts',
      'apps/api/prisma/migrations/**',
      'pnpm-lock.yaml',
    ],
  },

  // Base JS recommended
  eslint.configs.recommended,

  // TypeScript recommended (type-checked variants are opted-in per app via project refs)
  ...tseslint.configs.recommended,

  // Import plugin
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // Project-wide rules (CLAUDE.md §5, §15)
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // No `any` per CLAUDE.md §5
      '@typescript-eslint/no-explicit-any': 'error',

      // No unused — already enabled by tseslint.recommended; tighten for prefix `_`
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // No `enum` per CLAUDE.md §5 — prefer `as const` objects
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message:
            'Do not use enums. Use `as const` objects + `type X = (typeof OBJ)[keyof typeof OBJ]` per CLAUDE.md §5.',
        },
      ],

      // No console.log in production code (CLAUDE.md §15) — apps may relax in dev only.
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // Style
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Test files: relax `no-explicit-any`, allow more freedom
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
      '**/test/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // JS config files
  {
    files: ['**/*.{cjs,mjs,js}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Build / framework config files that must use require() because Metro,
  // Tailwind, NestJS, etc. consume them via CommonJS resolution.
  {
    files: [
      '**/metro.config.{js,ts}',
      '**/babel.config.{js,ts}',
      '**/tailwind.config.{js,ts}',
      '**/jest.config.{js,ts}',
      '**/next.config.{js,ts}',
      '**/*.config.{cjs,mjs,js,ts}',
    ],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Disable formatting rules that conflict with Prettier (must be last)
  prettier,
);

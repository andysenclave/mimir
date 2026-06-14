// Mimir — commitlint config (CLAUDE.md §16)
// Conventional Commits with Mimir-specific scope allowlist.

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'docs',
        'test',
        'chore',
        'perf',
        'style',
        'ci',
        'build',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'mobile',
        'api',
        'shared',
        'graphql',
        'ai',
        'notifications',
        'trading',
        'market',
        'learning',
        'auth',
        'infra',
        'ci',
        'deps',
        'release',
        'monorepo',
      ],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', ['lower-case', 'sentence-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [0, 'always', 100],
  },
};

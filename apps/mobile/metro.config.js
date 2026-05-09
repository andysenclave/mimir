// Mimir mobile — Metro config tuned for pnpm + turborepo monorepo.
// Standard Expo SDK 52+ monorepo recipe: watch the workspace root, use isolated
// node_modules paths, disable hierarchical lookup so Metro stops walking parents.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// Allow .cjs (some pnpm-resolved deps) and ensure source extensions are explicit.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = config;

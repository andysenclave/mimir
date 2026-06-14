// Mimir mobile — Babel config.
// react-native-reanimated/plugin MUST be the last plugin per Reanimated 3 docs.
// nativewind/babel preset enables `className` on RN primitives.

module.exports = function babel (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};

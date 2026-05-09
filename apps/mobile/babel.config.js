// Mimir mobile — Babel config.
// react-native-reanimated/plugin MUST be the last entry per Reanimated 3 docs.

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@utils': './src/utils',
      '@types': './src/types',
      '@store': './src/store',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

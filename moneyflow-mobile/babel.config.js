module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        'react-native-reanimated/plugin',
        [
            'module:react-native-dotenv',
            {
                moduleName: '@env',
                path: '.env',
            },
        ],
        [
            'module-resolver',
            {
                root: ['./src'],
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
        ],
    ],
};

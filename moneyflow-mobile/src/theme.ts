import { MD3LightTheme } from 'react-native-paper';

export const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2E7D32',
        primaryContainer: '#A8D5AA',
        secondary: '#388E3C',
        secondaryContainer: '#C8E6C9',
        surface: '#FFFFFF',
        surfaceVariant: '#F5F5F5',
        background: '#FAFAFA',
        error: '#B71C1C',
        errorContainer: '#FFCDD2',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onSurface: '#1C1B1F',
        onBackground: '#1C1B1F',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: 'bold' as const,
        lineHeight: 36,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body1: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    body2: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
};

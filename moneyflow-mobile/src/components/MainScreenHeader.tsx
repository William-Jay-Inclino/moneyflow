import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MainScreenHeaderProps {
    title: string;
    subtitle?: string;
    color?: string;
}

export const MainScreenHeader: React.FC<MainScreenHeaderProps> = ({
    title,
    subtitle,
    color = '#3b82f6', // default blue
}) => (
    <View style={[styles.header, { backgroundColor: color }]}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    header: {
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 2,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#e0e7ff',
        opacity: 0.92,
        textAlign: 'center',
        fontWeight: '400',
        letterSpacing: 0.2,
    },
});

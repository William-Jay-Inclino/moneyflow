import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from '../store';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';

// Main Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { CategoriesScreen } from '../screens/main/CategoriesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

// Simple emoji icon component
const TabIcon = ({ emoji, size }: { emoji: string; size: number }) => (
    <Text style={{ fontSize: size }}>{emoji}</Text>
);

const AuthNavigator = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
    );
};

const MainNavigator = () => {
    return (
        <MainTab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#2E7D32',
                tabBarInactiveTintColor: '#666',
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: 'white',
            }}
        >
            <MainTab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="🏠" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    tabBarLabel: 'Transactions',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="📋" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarLabel: 'Categories',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="📂" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="👤" size={size} />
                    ),
                }}
            />
        </MainTab.Navigator>
    );
};

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

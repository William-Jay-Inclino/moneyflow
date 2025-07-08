import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from '../store';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';

// Main Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExpenseScreen } from '../screens/main/ExpenseScreen';
import { IncomeScreen } from '../screens/main/IncomeScreen';
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
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#666',
                headerShown: false,
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <MainTab.Screen
                name="Expense"
                component={ExpenseScreen}
                options={{
                    tabBarLabel: 'Expense',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="💸" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Income"
                component={IncomeScreen}
                options={{
                    tabBarLabel: 'Income',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="💰" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="CashFlow"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Cash Flow',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="📊" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Accounts"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Accounts',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="🏦" size={size} />
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
        </MainTab.Navigator>
    );
};

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

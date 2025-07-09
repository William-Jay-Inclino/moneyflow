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
import { AllExpensesScreen } from '../screens/main/AllExpensesScreen';
import { AllIncomeScreen } from '../screens/main/AllIncomeScreen';
import { CashFlowScreen } from '../screens/main/CashFlowScreen';
import { IncomeScreen } from '../screens/main/IncomeScreen';
import { CategoriesScreen } from '../screens/main/CategoriesScreen';
import { AccountScreen } from '../screens/main/AccountScreen';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const MainStack = createStackNavigator();

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

const MainTabNavigator = () => {
    return (
        <MainTab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#1e40af',
                tabBarInactiveTintColor: '#9ca3af',
                headerShown: false,
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
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
                component={CashFlowScreen}
                options={{
                    tabBarLabel: 'Cash Flow',
                    tabBarIcon: ({ size }) => (
                        <TabIcon emoji="📊" size={size} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Accounts"
                component={AccountScreen}
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

const MainNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
            <MainStack.Screen name="AllExpenses" component={AllExpensesScreen} />
            <MainStack.Screen name="AllIncome" component={AllIncomeScreen} />
        </MainStack.Navigator>
    );
};

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

<template>
    <nav class="moneyflow-tabbar">
        <ul class="tabbar-list">
            <li class="tabbar-item">
                <a
                    @click="onClickTab('expense')"
                    :class="['tabbar-link', { active: activeTab === 'expense' }]"
                    href="#"
                >
                    <span class="tabbar-icon" aria-label="Expense">💸</span>
                    <span class="tabbar-label">Expense</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a
                    @click="onClickTab('income')"
                    :class="['tabbar-link', { active: activeTab === 'income' }]"
                    href="#"
                >
                    <span class="tabbar-icon" aria-label="Income">💰</span>
                    <span class="tabbar-label">Income</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a
                    @click="onClickTab('cashflow')"
                    :class="['tabbar-link', { active: activeTab === 'cashflow' }]"
                    href="#"
                >
                    <span class="tabbar-icon" aria-label="Cash Flow">📊</span>
                    <span class="tabbar-label">Cash Flow</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a
                    @click="onClickTab('accounts')"
                    :class="['tabbar-link', { active: activeTab === 'accounts' }]"
                    href="#"
                >
                    <span class="tabbar-icon" aria-label="Accounts">🏦</span>
                    <span class="tabbar-label">Accounts</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a @click="logout()" class="tabbar-link text-soft-danger" href="#">
                    <span class="tabbar-icon" aria-label="Logout">🔒</span>
                    <span class="tabbar-label">Logout</span>
                </a>
            </li>
        </ul>
    </nav>
</template>

<script setup lang="ts">

import { useLayoutStore } from '../stores/layout.store';
import { useAuthStore } from '../stores/auth.store';
import { ref } from 'vue';

type Tab = 'expense' | 'income' | 'cashflow' | 'categories' | 'accounts';

const layoutStore = useLayoutStore();
const authStore = useAuthStore();

const activeTab = ref<Tab>(layoutStore.route as Tab || 'expense')


function onClickTab(tab: Tab) {

    activeTab.value = tab;
    
    if(tab === 'expense') {
        layoutStore.setHeader({
            title: 'Add Expense',
            subtitle: 'Quick and easy expense tracking',
            color: '#3b82f6'
        });
        layoutStore.setRoute('expense');
    } else if(tab === 'income') {
        layoutStore.setHeader({
            title: 'Add Income',
            subtitle: 'Track your earnings effortlessly',
            color: '#10b981'
        });
        layoutStore.setRoute('income');
    } else if(tab === 'cashflow') {
        layoutStore.setHeader({
            title: 'Cash Flow',
            subtitle: 'Monitor your cash flow effectively',
            color: '#14b8a6'
        });
        layoutStore.setRoute('cashflow');
    } else if(tab === 'accounts') {
        layoutStore.setHeader({
            title: 'Accounts',
            subtitle: 'Manage your financial accounts',
            color: '#6366f1'
        });
        layoutStore.setRoute('accounts');
    }

}

function logout() {
    authStore.logout();
}

</script>

<style scoped>
ul.nav.flex-nowrap {
    flex-wrap: nowrap !important;
}
.moneyflow-tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
    z-index: 1000;
    height: 80px;
    display: flex;
    align-items: center;
    /* Increased top and bottom padding, plus safe area for iOS */
    padding-top: 28px;
    padding-bottom: calc(env(safe-area-inset-bottom, 0) + 28px);
    /* Prevent scrolling content under the bar */
    touch-action: none;
}

.tabbar-list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
}

.tabbar-item {
    flex: 1 1 0;
    text-align: center;
}

.tabbar-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    text-decoration: none;
    font-weight: 600;
    font-size: 12px;
    height: 100%;
    transition: color 0.2s;
    padding: 6px 0 0 0;
}
.tabbar-link.active,
.tabbar-link:active,
.tabbar-link:focus,
.tabbar-link.router-link-exact-active {
    color: #2563eb; /* modern blue */
    background: rgba(37, 99, 235, 0.08); /* subtle blue background */
    border-radius: 12px;
    outline: none;
    box-shadow: 0 2px 8px 0 rgba(37,99,235,0.08);
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.tabbar-icon {
    font-size: 24px;
    line-height: 1;
    margin-bottom: 2px;
}

.tabbar-label {
    font-size: 12px;
    font-weight: 600;
}

/* Prevent body scroll under the tabbar on mobile */
@media (max-width: 600px) {
    body {
        padding-bottom: 60px !important;
    }
}
</style>
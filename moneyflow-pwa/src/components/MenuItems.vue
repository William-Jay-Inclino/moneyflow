<template>
    <nav class="moneyflow-tabbar">
        <ul class="tabbar-list">
            <li class="tabbar-item">
                <a @click="onClickTab('expense')" class="tabbar-link" href="#">
                    <span class="tabbar-icon" aria-label="Expense">💸</span>
                    <span class="tabbar-label">Expense</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a @click="onClickTab('income')" class="tabbar-link" href="#">
                    <span class="tabbar-icon" aria-label="Income">💰</span>
                    <span class="tabbar-label">Income</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a @click="onClickTab('cashflow')" class="tabbar-link" href="#">
                    <span class="tabbar-icon" aria-label="Cash Flow">📊</span>
                    <span class="tabbar-label">Cash Flow</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a @click="onClickTab('categories')" class="tabbar-link" href="#">
                    <span class="tabbar-icon" aria-label="Categories">📂</span>
                    <span class="tabbar-label">Categories</span>
                </a>
            </li>
            <li class="tabbar-item">
                <a @click="onClickTab('accounts')" class="tabbar-link" href="#">
                    <span class="tabbar-icon" aria-label="Accounts">🏦</span>
                    <span class="tabbar-label">Accounts</span>
                </a>
            </li>
        </ul>
    </nav>
</template>

<script setup lang="ts">

import { useLayoutStore } from '../stores/layout.store';

type Tab = 'expense' | 'income' | 'cashflow' | 'categories' | 'accounts';

const layoutStore = useLayoutStore();

function onClickTab(tab: Tab) {
    
    if(tab === 'expense') {
        layoutStore.setHeader({
            title: 'Add Expense',
            subtitle: 'Quick and easy expense tracking',
            color: '#3b82f6'
        });
    } else if(tab === 'income') {
        layoutStore.setHeader({
            title: 'AddIncome',
            subtitle: 'Track your earnings effortlessly',
            color: '#15803d'
        });
    } else if(tab === 'cashflow') {
        layoutStore.setHeader({
            title: 'Cash Flow',
            subtitle: 'Monitor your cash flow effectively',
            color: '#14b8a6'
        });
    } else if(tab === 'categories') {
        layoutStore.setHeader({
            title: 'Categories',
            subtitle: 'Organize your finances by categories',
            color: '#f59e0b'
        });
    } else if(tab === 'accounts') {
        layoutStore.setHeader({
            title: 'Accounts',
            subtitle: 'Manage your financial accounts',
            color: '#6366f1'
        });
    }

}

</script>

<style scoped>
ul.nav.flex-nowrap {
    flex-wrap: nowrap !important;
}
.moneyflow-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
    z-index: 1000;
    padding: 0;
    height: 60px;
    display: flex;
    align-items: center;
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
.tabbar-link:active,
.tabbar-link:focus,
.tabbar-link.router-link-exact-active {
    color: #1e40af;
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
</style>
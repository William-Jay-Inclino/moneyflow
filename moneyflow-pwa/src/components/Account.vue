<template>
    <div class="account-container">
        <!-- Total Balance Card -->
        <div class="balance-card">
            <div class="balance-label">Total Balance</div>
            <div class="balance-amount">0.00</div>
            <div class="balance-subtext">0 accounts</div>
        </div>

        <!-- Add Account Button -->
        <button class="add-account-btn" data-bs-toggle="modal" data-bs-target="#account_modal">+ Add Account</button>

        <!-- Loading State -->
        <div v-show="false" class="loading-state">
            <div class="spinner"></div>
            <div class="loading-text">Loading accounts...</div>
        </div>

        <!-- Empty State -->
        <div v-show="false" class="empty-state">
            <div class="empty-title">No Accounts Yet</div>
            <div class="empty-text">Add your first account to get started</div>
        </div>

        <!-- Accounts List -->
        <div v-for="account in accountStore.accounts" :key="account.id" class="account-card">
            <div class="account-info">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-date">Updated: {{ formatDate(account.updated_at, true) }}</div>
            </div>
            <div class="account-actions">
                <div class="balance-container">
                    <div class="account-balance">{{ formatAmount(account.balance) }}</div>
                </div>
                <button class="menu-btn">⋮</button>
            </div>
        </div>

        <AccountFormModal @save="handleSave" />

    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserAccountStore } from '../stores/account.store';
import { userAccountsApi } from '../api';
import { formatAmount, formatDate } from '../utils/helpers';
import AccountFormModal from './AccountFormModal.vue';

const accountStore = useUserAccountStore();


onMounted(async () => {
    try {
        const accounts = await userAccountsApi.getAccounts()
        accountStore.setAccounts(accounts.data);
    } catch (error) {
        console.error('Failed to load accounts:', error);
    }
});


function handleSave(payload: {
    name: string;
    balance: number;
    notes?: string;
}, closeBtn: HTMLButtonElement | null) {
    console.log('payload', payload);
    closeBtn?.click();
}


</script>

<style scoped>
.account-container {
    background: #f8fafc;
    min-height: 100vh;
    padding-bottom: 32px;
    font-family: inherit;
}
.custom-header {
    background: #6366f1;
    padding-top: 28px;
    padding-bottom: 20px;
    padding-left: 16px;
    padding-right: 16px;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    margin-bottom: 20px;
}
.header-title {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin-bottom: 2px;
    text-align: center;
    letter-spacing: 0.5px;
}
.header-subtitle {
    font-size: 14px;
    color: #e0e7ff;
    opacity: 0.92;
    text-align: center;
    font-weight: 400;
    letter-spacing: 0.2px;
    margin-bottom: 8px;
}
.logout-btn {
    position: absolute;
    right: 16px;
    top: 16px;
    background: rgba(255,255,255,0.2);
    padding: 6px 12px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
}
.offline-banner {
    background: #fef3c7;
    color: #b45309;
    font-size: 13px;
    text-align: center;
    font-weight: 500;
    border-radius: 8px;
    margin: 16px;
    padding: 8px;
}
.balance-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 16px 16px 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.balance-label {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
}
.balance-amount {
    font-size: 28px;
    font-weight: bold;
    color: #1e293b;
}
.balance-subtext {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}
.add-account-btn {
    background: #f1f5f9;
    padding: 16px;
    border-radius: 8px;
    margin: 0 16px 16px 16px;
    border: 1px dashed #e2e8f0;
    color: #64748b;
    font-size: 16px;
    font-weight: 500;
    width: calc(100% - 32px);
    text-align: center;
    cursor: pointer;
}
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
}
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}
.loading-text {
    margin-top: 12px;
    color: #64748b;
}
.error-state {
    background: #fef2f2;
    padding: 16px;
    border-radius: 8px;
    align-items: center;
    margin: 16px;
    text-align: center;
}
.error-text {
    color: #dc2626;
    margin-bottom: 12px;
}
.retry-btn {
    background: #dc2626;
    color: white;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
}
.empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}
.empty-text {
    color: #64748b;
    text-align: center;
}
.account-card {
    background: white;
    padding: 16px;
    border-radius: 8px;
    margin: 8px 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.account-info {
    flex: 1;
}
.account-name {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
}
.account-date {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}
.account-actions {
    display: flex;
    align-items: center;
    min-width: 120px;
    min-height: 60px;
    padding-left: 16px;
    position: relative;
}
.menu-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    color: #94a3b8;
    font-weight: 600;
    margin-right: 8px;
    cursor: pointer;
}
.balance-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-right: 40px;
    padding-bottom: 8px;
}
.account-balance {
    font-size: 16px;
    font-weight: bold;
    color: #059669;
    text-align: right;
}
</style>

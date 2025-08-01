<template>
    <div class="account-container">

        <!-- User Info Section -->
        <div class="user-info-card mb-3">
            <div class="user-email-label">Email</div>
            <div class="user-email-value"> {{ authStore.authUser?.email }} </div>
            <button data-bs-toggle="modal" data-bs-target="#change_password_modal" class="change-password-btn">Change Password</button>
        </div>

        <!-- Total Balance Card -->
        <div class="balance-card">
            <div class="balance-label">Total Balance</div>
            <div class="balance-amount text-soft-success">{{ formatAmount(totalBalance) }}</div>
            <div class="balance-subtext">{{ accountStore.accounts.length }} accounts</div>
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
        <div
            v-for="account in sortedAccounts"
            :key="account.id"
            class="account-card"
        >
            <div class="account-info">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-date">Updated: {{ formatShortDate(account.updated_at) }}</div>
            </div>
            <div class="account-actions">
                <div class="balance-container">
                    <div class="account-balance">{{ formatAmount(account.balance) }}</div>
                </div>
                <div class="dropdown">
                    <button 
                        class="menu-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        ⋮
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#account_modal" href="#" @click.prevent="handleEdit(account)">
                                Edit
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item text-danger" href="#" @click.prevent="handleDelete(account)">
                                Delete
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <AccountFormModal @save="handleSave" :default-data="accountToEdit"/>
        <ChangePasswordModal @save="handleChangePassword"/>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserAccountStore } from '../stores/account.store';
import { userAccountsApi } from '../api';
import { formatAmount, formatShortDate, showToast } from '../utils/helpers';
import AccountFormModal from './AccountFormModal.vue';
import ChangePasswordModal from './ChangePasswordModal.vue';
import type { UserAccount } from '../types';
import { useAuthStore } from '../stores/auth.store';

const accountStore = useUserAccountStore();
const authStore = useAuthStore();
const accountToEdit = ref<{ id: string; name: string; balance: number; notes?: string } | undefined>(undefined);
const isSaving = ref(false);    

onMounted(async () => {
    try {
        const accounts = await userAccountsApi.getAccounts()
        accountStore.setAccounts(accounts.data);
    } catch (error) {
        console.error('Failed to load accounts:', error);
    }
});

const isEditMode = computed(() => !!accountToEdit.value);
const totalBalance = computed(() => {
    return accountStore.accounts.reduce((sum, acc) => sum + (typeof acc.balance === 'number' ? acc.balance : Number(acc.balance) || 0), 0);
});

const sortedAccounts = computed(() =>
    [...accountStore.accounts].sort((a, b) => {
        const aBal = typeof a.balance === 'number' ? a.balance : Number(a.balance) || 0;
        const bBal = typeof b.balance === 'number' ? b.balance : Number(b.balance) || 0;
        return bBal - aBal;
    })
);

async function handleSave(payload: {
    name: string;
    balance: number;
    notes?: string;
}, closeBtn: HTMLButtonElement | null) {
    console.log('payload', payload);

    if(isEditMode.value) {
        await updateAccount(payload);
        accountToEdit.value = undefined; 
    } else {
        await addAccount(payload);
    }

    closeBtn?.click();
}

async function addAccount(payload: {
    name: string;
    balance: number;
    notes?: string;
}) {

    isSaving.value = true;
    const res = await userAccountsApi.create(payload);
    isSaving.value = false;

    if(res) {
        accountStore.addAccount(res);
        showToast('Account created successfully!', 'success');
    } else {
        console.error('Failed to create account:', res);
    }

}

async function updateAccount(payload: {
    name: string;
    balance: number;
    notes?: string;
}) {

    if(!accountToEdit.value || !accountToEdit.value.id) return;

    isSaving.value = true;
    const res = await userAccountsApi.update(accountToEdit.value.id, payload);
    isSaving.value = false;

    if(res) {
        accountStore.updateAccount(res);
        showToast('Account updated successfully!', 'success');
    } else {
        console.error('Failed to update account:', res);
    }

}

function handleEdit(account: UserAccount) {
    console.log('handleEdit', account);
    accountToEdit.value = {
        id: account.id,
        name: account.name,
        balance: typeof account.balance === 'number' ? account.balance : Number(account.balance),
        notes: account.notes || ''
    }
}

async function handleDelete(account: UserAccount) {
    if (confirm(`Are you sure you want to delete ${account.name}?`)) {
        console.log('Delete:', account);
        
        const res = await userAccountsApi.delete(account.id);
        if (res) {
            accountStore.removeAccount(account.id);
            showToast('Account deleted successfully!', 'success');
        } else {
            showToast('Failed to delete account. Please try again.', 'error');
        }

    }
}

async function handleChangePassword(newPassword: string) {
    console.log('Change password:', newPassword);
    // Call API to change password
}

</script>

<style scoped>

.menu-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    color: #94a3b8;
    font-weight: 600;
    margin-right: 8px;
    cursor: pointer;
}
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
    color: #10b981;
    text-align: right;
}
.user-info-card {
    background: #eef2ff;
    padding: 18px 24px 18px 24px;
    border-radius: 12px;
    margin: 16px 16px 0 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 1px 4px rgba(99,102,241,0.07);
}
.user-email-label {
    font-size: 13px;
    color: #6366f1;
    font-weight: 500;
    margin-bottom: 4px;
}
.user-email-value {
    font-size: 16px;
    color: #1e293b;
    font-weight: 600;
    margin-bottom: 10px;
}
.change-password-btn {
    background: #6366f1;
    color: white;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    padding: 7px 16px;
    cursor: pointer;
    transition: background 0.2s;
}
.change-password-btn:hover {
    background: #4f46e5;
}
</style>

<template>
    <div class="container py-3 expense-container">
        <!-- Quick Add Form -->
        <form class="soft-card p-3 mb-3 quick-add-form" @submit.prevent="handleAddExpense">
            <div class="row g-2 mb-3">
                <div class="col-4">
                    <label class="form-label input-label">Cost</label>
                    <input
                        class="form-control cost-input"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        v-model="cost"
                        :disabled="isLoading"
                        required
                    />
                </div>
                <div class="col-8">
                    <label class="form-label input-label">Notes</label>
                    <input
                        class="form-control notes-input"
                        type="text"
                        v-model="notes"
                        :disabled="isLoading"
                    />
                </div>
            </div>
            <div class="mb-3 category-section">
                <label class="form-label input-label">Category</label>
                <div class="d-flex flex-wrap gap-2 category-scroll justify-content-start">
                    <button
                        v-for="category in categories"
                        :key="category.id"
                        type="button"
                        class="btn btn-soft px-2 py-1 category-chip"
                        :class="{ active: selectedCategory === category.id }"
                        style="min-width: 0; font-size: 0.95rem; line-height: 1.1; height: 32px;"
                        @click="selectedCategory = category.id"
                    >
                        <span class="category-icon me-1" style="font-size: 1.1rem;">{{ category.icon }}</span>
                        <span>{{ category.name }}</span>
                    </button>
                    <span v-if="categories.length === 0" class="text-muted loading-categories">
                        Loading categories...
                    </span>
                </div>
            </div>
            <button
                class="btn btn-soft-primary w-100 quick-add-button"
                :disabled="isLoading || categories.length === 0"
                type="submit"
            >
                <span v-if="isLoading">Adding...</span>
                <span v-else-if="categories.length === 0">Loading...</span>
                <span v-else>+ Add Expense</span>
            </button>
        </form>
        <!-- Expense Details Toggle -->
        <div v-if="!showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = true">
                <span>View Expense Details</span>
                <span class="ms-2 toggle-icon">▼</span>
            </button>
        </div>
        <!-- Expense Details -->
        <div v-if="showExpenseDetails">
            <div class="soft-card summary-card text-center mb-3">
                <div class="summary-label text-muted">Total Expenses This Month</div>
                <div class="summary-amount text-soft-danger fw-bold fs-2">-{{ combinedTotal.toFixed(2) }}</div>
            </div>
            <div class="d-flex justify-content-between align-items-center section-header px-2 mb-2">
                <span class="section-title fw-semibold">Recent Expenses</span>
            </div>
            <div v-if="isLoadingExpenses" class="loading-container text-center py-4">
                <span>Loading expenses...</span>
            </div>
            <div v-else-if="combinedExpenses.length > 0">
                <div
                    v-for="item in combinedExpenses"
                    :key="item.id"
                    class="expense-item-modern d-flex align-items-center justify-content-between mb-2 position-relative"
                >
                    <div class="expense-info flex-grow-1 d-flex align-items-center">
                        <span class="expense-list-icon me-3">{{ getCategoryIcon(item.categoryId) }}</span>
                        <div class="flex-grow-1">
                            <div class="expense-notes-amount d-flex align-items-end justify-content-between">
                                <span class="expense-notes fw-semibold">{{ item.description || 'No notes' }}</span>
                                <span class="expense-amount-modern ms-2">-{{ item.amount.toFixed(2) }}</span>
                            </div>
                            <div class="expense-date-modern mt-1">{{ formatDate(item.date) }}</div>
                        </div>
                    </div>
                    <!-- 3 dots menu -->
                    <div class="expense-menu-wrapper ms-2" ref="menuRefs[item.id]">
                        <button
                            type="button"
                            class="expense-menu-btn"
                            @click.stop="toggleMenu(item.id)"
                            aria-label="More"
                        >⋯</button>
                        <div
                            v-if="openMenuId === item.id"
                            class="expense-menu-dropdown"
                        >
                            <button class="dropdown-item" @click="editExpense(item)">Edit</button>
                            <button class="dropdown-item text-danger" @click="deleteExpense(item)">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="empty-container text-center py-4">
                <div class="empty-text fw-semibold text-muted">No expenses found</div>
                <div class="empty-subtext text-secondary">Add your first expense above</div>
            </div>
            <div class="hide-section text-center mt-3">
                <button class="btn btn-soft hide-button" @click="showExpenseDetails = false">
                    <span>Hide Expense Details</span>
                    <span class="ms-2 hide-icon">▲</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { formatDate } from '../utils/helpers';

const isLoading = ref(false);
const isLoadingExpenses = ref(false);
const showExpenseDetails = ref(false);

const notes = ref('');
const cost = ref('');
const selectedCategory = ref('');
const categories = ref([
    { id: '1', name: 'Food', icon: '🍔' },
    { id: '2', name: 'Transport', icon: '🚌' },
    { id: '3', name: 'Shopping', icon: '🛒' },
    { id: '4', name: 'Bills', icon: '💡' },
    { id: '5', name: 'Health', icon: '💊' },
    { id: '6', name: 'Groceries', icon: '🛍️' },
    { id: '7', name: 'Coffee', icon: '☕' },
    { id: '8', name: 'Subscriptions', icon: '📺' },
    { id: '9', name: 'Travel', icon: '✈️' },
    { id: '10', name: 'Gifts', icon: '🎁' },
    { id: '11', name: 'Pets', icon: '🐾' },
    { id: '12', name: 'Other', icon: '📝' }
]);
const combinedExpenses = ref([
    { id: '1', amount: 120, description: 'Lunch', category: 'Food', categoryId: '1', date: new Date().toISOString() }
]);
const combinedTotal = computed(() => combinedExpenses.value.reduce((sum, e) => sum + e.amount, 0));

const openMenuId = ref(null);
const menuRefs = ref({});

function handleAddExpense() {
    notes.value = '';
    cost.value = '';
    selectedCategory.value = '';
}

function getCategoryIcon(categoryId) {
    const cat = categories.value.find(c => c.id === categoryId);
    return cat ? cat.icon : '';
}

function toggleMenu(id) {
    openMenuId.value = openMenuId.value === id ? null : id;
    if (openMenuId.value) {
        nextTick(() => {
            document.addEventListener('mousedown', handleClickOutsideMenu);
        });
    } else {
        document.removeEventListener('mousedown', handleClickOutsideMenu);
    }
}

function closeMenu() {
    openMenuId.value = null;
    document.removeEventListener('mousedown', handleClickOutsideMenu);
}

function handleClickOutsideMenu(event) {
    // Find the currently open menu's DOM node
    const menuId = openMenuId.value;
    if (!menuId) return;
    const menuWrapper = menuRefs.value[menuId]?.$el || menuRefs.value[menuId];
    if (menuWrapper && !menuWrapper.contains(event.target)) {
        closeMenu();
    }
}

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutsideMenu);
});

function editExpense(item) {
    closeMenu();
    // Implement your edit logic here, e.g. open modal
    // Example: emit('edit', item) or call a method
}

function deleteExpense(item) {
    closeMenu();
    // Implement your delete logic here, e.g. show confirm dialog
    // Example: emit('delete', item) or call a method
}
</script>

<style scoped>
.expense-container {
    max-width: 500px;
    margin: 0 auto;
    background: #f8fafc;
}
.category-scroll {
    /* Make chips wrap and fit, remove horizontal scroll */
    flex-wrap: wrap !important;
    overflow-x: visible !important;
    gap: 0.5rem !important;
}
.category-chip {
    padding: 4px 10px !important;
    font-size: 0.95rem !important;
    min-width: 0 !important;
    height: 32px !important;
    border-radius: 14px !important;
    display: flex;
    align-items: center;
    line-height: 1.1 !important;
}
.category-icon {
    font-size: 1.1rem !important;
    margin-right: 2px;
}
.expense-item {
    background: #f1f5f9 !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 8px;
}
.expense-item-modern {
    background: #fff;
    border-radius: 14px;
    border: 1.5px solid #e0e7ef;
    box-shadow: 0 2px 8px 0 rgba(30, 64, 175, 0.03);
    padding: 16px 18px 12px 18px;
    display: flex;
    align-items: flex-start;
    transition: box-shadow 0.18s;
}
.expense-item-modern:hover {
    box-shadow: 0 4px 16px 0 rgba(30, 64, 175, 0.07);
}
.expense-info {
    width: 100%;
    display: flex;
    align-items: center;
}
.expense-list-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: #f1f5f9;
    color: #334155;
    margin-right: 1rem;
}
.expense-notes-amount {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
}
.expense-notes {
    font-size: 1.08rem;
    color: #334155;
    font-weight: 600;
    letter-spacing: 0.01em;
    max-width: 70vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.expense-amount-modern {
    font-size: 1rem; /* smaller than before */
    font-weight: 700;
    color: #ef4444;
    background: #fef2f2;
    border-radius: 8px;
    padding: 3px 10px;
    min-width: 64px;
    text-align: right;
    box-shadow: 0 1px 2px 0 rgba(239, 68, 68, 0.04);
}
.expense-date-modern {
    font-size: 0.92rem;
    color: #a1a1aa;
    font-weight: 400;
    margin-top: 2px;
    letter-spacing: 0.01em;
}
.empty-text {
    color: #94a3b8;
}
.empty-subtext {
    color: #cbd5e1;
}
.soft-card {
    background: #fff !important; /* More white for emphasis */
    border-radius: 18px;
    border: 1.5px solid #e0e7ef !important;
    box-shadow: 0 2px 12px 0 rgba(30, 64, 175, 0.04); /* subtle blue shadow for emphasis */
    transition: box-shadow 0.2s;
}
.soft-card:focus-within,
.soft-card:hover {
    box-shadow: 0 4px 20px 0 rgba(30, 64, 175, 0.07);
}
.btn-soft,
.btn-soft:focus,
.btn-soft:active {
    background: #f1f5f9 !important;
    color: #334155 !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
}
.btn-soft.active,
.category-chip.active {
    background: #bae6fd !important;
    color: #0369a1 !important;
    border-color: #7dd3fc !important;
}
.btn-soft-primary,
.btn-soft-primary:focus,
.btn-soft-primary:active {
    background: #bae6fd !important;
    color: #0369a1 !important;
    border: 1px solid #7dd3fc !important;
    box-shadow: none !important;
}
.btn-soft-primary:disabled {
    background: #e0e7ef !important;
    color: #a1a1aa !important;
    border-color: #e0e7ef !important;
}
.bg-soft {
    background: #f1f5f9 !important;
}
.text-soft-danger {
    color: #f87171 !important;
}
.input-label {
    color: #64748b;
    font-weight: 500;
}
.cost-input,
.notes-input {
    background: #f8fafc !important;
    border: 1px solid #e5e7eb !important;
    color: #334155 !important;
    border-radius: 8px;
    min-height: 56px;
    font-size: 1.25rem;
    padding: 18px 16px;
}
.summary-card {
    border-radius: 18px;
    background: #fff !important; /* More white for emphasis */
    border: 1.5px solid #e0e7ef !important;
    box-shadow: 0 2px 12px 0 rgba(30, 64, 175, 0.04); /* subtle blue shadow for emphasis */
    transition: box-shadow 0.2s;
    margin-bottom: 1.5rem !important;
}
.summary-card:focus-within,
.summary-card:hover {
    box-shadow: 0 4px 20px 0 rgba(30, 64, 175, 0.07);
}
.summary-label {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 500;
}
.summary-amount {
    font-size: 32px;
    font-weight: bold;
}
.section-title {
    color: #334155;
}
.toggle-button,
.hide-button {
    border-radius: 8px;
    background: #f1f5f9 !important;
    color: #64748b !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
}
.toggle-icon,
.hide-icon {
    font-size: 12px;
    color: #94a3b8;
}
.expense-menu-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 20;
}
.expense-menu-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #64748b;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 50%;
    transition: background 0.15s;
    z-index: 21;
}
.expense-menu-btn:hover,
.expense-menu-btn:focus {
    background: #f1f5f9;
}
.expense-menu-dropdown {
    position: absolute;
    top: 32px;
    right: 0;
    min-width: 110px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 4px 16px 0 rgba(30, 64, 175, 0.08);
    z-index: 30;
    display: flex;
    flex-direction: column;
    padding: 4px 0;
}
.dropdown-item {
    background: none;
    border: none;
    text-align: left;
    padding: 8px 16px;
    font-size: 1rem;
    color: #334155;
    cursor: pointer;
    transition: background 0.15s;
}
.dropdown-item:hover,
.dropdown-item:focus {
    background: #f1f5f9;
}
.dropdown-item.text-danger {
    color: #ef4444;
}
@media (max-width: 576px) {
    .expense-container {
        padding-left: 0.25rem;
        padding-right: 0.25rem;
    }
    .summary-card,
    .quick-add-form {
        padding: 1rem !important;
    }
    .category-chip {
        font-size: 0.9rem !important;
        padding: 3px 8px !important;
        height: 28px !important;
    }
    .expense-item-modern {
        padding: 12px 10px 10px 10px;
    }
    .expense-list-icon {
        font-size: 1.2rem;
        width: 1.8rem;
        height: 1.8rem;
        margin-right: 0.7rem;
    }
    .expense-notes {
        font-size: 1rem;
    }
    .expense-amount-modern {
        font-size: 0.92rem; /* smaller for mobile */
        padding: 2px 7px;
        min-width: 48px;
    }
    .expense-menu-dropdown {
        right: -10px;
        min-width: 90px;
        font-size: 0.95rem;
    }
}
</style>
<template>
    <div 
        class="modal fade" 
        id="ieItemsModal" 
        tabindex="-1" 
        aria-labelledby="ieItemsModalLabel" 
        aria-hidden="true"
    >
        <div class="modal-dialog modal-lg">
            <div class="modal-content modern-modal">
                <div 
                    class="modal-header modern-header"
                    :style="{ 
                        background: currentCategory?.color 
                            ? `linear-gradient(135deg, ${currentCategory.color}15 0%, ${currentCategory.color}25 100%)` 
                            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderBottom: currentCategory?.color 
                            ? `1px solid ${currentCategory.color}40` 
                            : '1px solid #e9ecef'
                    }"
                >
                    <div class="header-content">
                        <div class="d-flex align-items-center mb-1">
                            <div 
                                v-if="currentCategory?.icon" 
                                class="category-icon me-2"
                                :style="{ 
                                    background: currentCategory.color,
                                    color: 'white'
                                }"
                            >
                                {{ currentCategory.icon }}
                            </div>
                            <h4 class="modal-title mb-0">
                                {{ currentCategory?.name || 'Category' }}
                            </h4>
                        </div>
                        <p class="modal-subtitle">
                            {{ type === 'INCOME' ? 'Income' : 'Expense' }} Transactions • {{ year }}
                        </p>
                    </div>
                    <button type="button" class="btn-close modern-close" data-bs-dismiss="modal" aria-label="Close">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body modern-body">
                    <!-- Loading State -->
                    <div v-if="loading" class="loading-state">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3 text-muted">Loading transactions...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="error" class="error-state">
                        <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            <strong>Error:</strong> {{ error }}
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="transactions.length === 0" class="empty-state">
                        <div class="empty-icon mb-3">
                            <i class="bi bi-inbox fs-1 text-muted"></i>
                        </div>
                        <p class="text-muted mb-0">No {{ type.toLowerCase() }} transactions found for this category in {{ year }}.</p>
                    </div>

                    <!-- Transactions List -->
                    <div v-else class="transactions-container">
                        <div class="transactions-header mb-4">
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="transaction-count">{{ transactions.length }} transaction{{ transactions.length !== 1 ? 's' : '' }}</span>
                                <span class="total-amount fw-bold"
                                    :class="{
                                        'text-success': type === 'INCOME',
                                        'text-danger': type === 'EXPENSE'
                                    }">
                                    {{ formatTotalAmount() }}
                                </span>
                            </div>
                        </div>
                        <div class="transactions-list">
                            <div 
                                v-for="transaction in transactions" 
                                :key="transaction.id" 
                                class="transaction-item"
                            >
                                <div class="transaction-content">
                                    <div class="transaction-main">
                                        <div class="transaction-amount"
                                            :class="{
                                                'text-success': type === 'INCOME',
                                                'text-danger': type === 'EXPENSE'
                                            }">
                                            {{ formatAmount(getTransactionAmount(transaction)) }}
                                        </div>
                                        <div class="transaction-date">
                                            {{ formatDate(getTransactionDate(transaction)) }}
                                        </div>
                                    </div>
                                    <div v-if="transaction.notes" class="transaction-notes">
                                        <i class="bi bi-chat-text me-1"></i>
                                        {{ transaction.notes }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer modern-footer">
                    <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { categoryApi } from '../api'
import type { Expense, Income } from '../types'
import { useCategoryStore } from '../stores/category.store'

interface Props {
    user_id: string
    category_id: number
    type: 'INCOME' | 'EXPENSE'
    year: number
    enabled?: boolean
}

const props = defineProps<Props>()
const categoryStore = useCategoryStore()

const transactions = ref<(Income | Expense)[]>([])
const loading = ref(false)
const error = ref('')

// Computed property to get current category
const currentCategory = computed(() => {
    return categoryStore.getCategoryById(props.category_id)
})

const fetchTransactions = async () => {
    if (!props.user_id || !props.category_id || !props.type || !props.year || !props.enabled) {
        transactions.value = []
        return
    }

    loading.value = true
    error.value = ''
    transactions.value = []

    try {
        const data = await categoryApi.getUserTransactionsByCategory(
            props.category_id,
            props.user_id,
            props.type,
            props.year
        )
        transactions.value = data || []
    } catch (err: any) {
        console.error('Error fetching transactions:', err)
        error.value = err.response?.data?.message || 'Failed to load transactions'
    } finally {
        loading.value = false
    }
}

const formatAmount = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatTotalAmount = (): string => {
    const total = transactions.value.reduce((sum, transaction) => {
        const amount = typeof getTransactionAmount(transaction) === 'string' 
            ? parseFloat(getTransactionAmount(transaction)) 
            : parseFloat(String(getTransactionAmount(transaction)))
        return sum + amount
    }, 0)
    return formatAmount(total)
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    })
}

const getTransactionAmount = (transaction: Income | Expense): string => {
    return 'amount' in transaction ? transaction.amount : transaction.cost
}

const getTransactionDate = (transaction: Income | Expense): string => {
    return 'income_date' in transaction ? transaction.income_date : transaction.expense_date
}

// Watch for prop changes and refetch data
watch([() => props.user_id, () => props.category_id, () => props.type, () => props.year, () => props.enabled], fetchTransactions, {
    immediate: true
})
</script>

<style scoped>
/* Modern Modal Styling */
.modern-modal {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.modern-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #e9ecef;
    padding: 24px 32px 20px;
    border-radius: 20px 20px 0 0;
}

.header-content {
    flex: 1;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #212529;
    margin: 0;
    line-height: 1.2;
}

.category-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-subtitle {
    font-size: 0.9rem;
    color: #6c757d;
    margin: 4px 0 0 0;
    font-weight: 500;
}

.modern-close {
    margin-left: 16px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: #6c757d;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.modern-close:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    color: #495057;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.modern-close:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modern-close svg {
    pointer-events: none;
}

.modern-body {
    padding: 32px;
    max-height: 60vh;
    overflow-y: auto;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 40px 20px;
}

/* Error State */
.error-state {
    padding: 20px 0;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    opacity: 0.5;
}

/* Transactions Container */
.transactions-header {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px 20px;
    border: 1px solid #e9ecef;
}

.transaction-count {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
}

.total-amount {
    font-size: 1.1rem;
}

/* Transactions List */
.transaction-item {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    overflow: hidden;
}

.transaction-item:hover {
    border-color: #ced4da;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
}

.transaction-content {
    padding: 20px;
}

.transaction-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.transaction-amount {
    font-size: 1.1rem;
    font-weight: 700;
}

.transaction-date {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
}

.transaction-notes {
    font-size: 0.85rem;
    color: #495057;
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 8px;
    margin-top: 12px;
    border-left: 3px solid #dee2e6;
}

.modern-footer {
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    padding: 20px 32px;
    border-radius: 0 0 20px 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .modern-header {
        padding: 20px 24px 16px;
    }
    
    .modern-body {
        padding: 24px;
    }
    
    .modern-footer {
        padding: 16px 24px;
    }
    
    .modal-title {
        font-size: 1.3rem;
    }
    
    .transaction-content {
        padding: 16px;
    }
    
    .transaction-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .transaction-amount {
        font-size: 1rem;
    }
}

/* Scrollbar styling for webkit browsers */
.modern-body::-webkit-scrollbar {
    width: 6px;
}

.modern-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.modern-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.modern-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>

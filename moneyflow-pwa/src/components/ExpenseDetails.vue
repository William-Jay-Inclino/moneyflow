<template>
    <div>
        <div class="soft-card summary-card text-center mb-3">
            <div class="summary-label text-muted">Total Expenses</div>
            <div class="summary-amount text-soft-danger fw-bold fs-2">- 100.00 </div>
        </div>
        <div class="d-flex justify-content-between align-items-center section-header px-2 mb-2">
            <span class="section-title fw-semibold">Expense Details</span>
        </div>
        <div v-if="isLoading" class="loading-container text-center py-4">
            <span>Loading expenses...</span>
        </div>
        <div v-else-if="expenses.length > 0">
            <div
                v-for="item in expenses"
                :key="item.id"
                class="expense-item-modern d-flex align-items-center justify-content-between mb-2 position-relative"
            >
                <!-- Date at top left, absolutely positioned -->
                <div class="expense-date-absolute">
                    {{ formatDate(item.expense_date) }}
                </div>
                <div class="expense-info flex-grow-1 d-flex align-items-center">
                    <span class="expense-list-icon me-3">🍔</span>
                    <div class="flex-grow-1">
                        <div class="expense-notes-amount d-flex align-items-end justify-content-between">
                            <span class="expense-notes fw-semibold">{{ item.notes || 'No notes' }}</span>
                            <span class="expense-amount-modern ms-2">-{{ item.cost.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
                <!-- 3 dots menu -->
                <div class="dropdown">
                    <button
                        class="btn expense-menu-btn dropdown-toggle expense-menu-dots dropdown-toggle-no-caret"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <span class="vertical-dots">⋮</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm expense-menu-dropdown-modern">
                        <li>
                            <a class="dropdown-item" href="#">
                                Edit
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item text-danger" href="#">
                                Delete
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div v-else class="empty-container text-center py-4">
            <div class="empty-text fw-semibold text-muted">No expenses found</div>
            <div class="empty-subtext text-secondary">Add your first expense above</div>
        </div>
    </div>
</template>


<script setup lang="ts">
import type { Expense } from '../types';
import { formatDate } from '../utils/helpers';

const props = defineProps<{
    expenses: Expense[],
    isLoading: boolean
}>();

</script>

<style scoped>
.dropdown-toggle-no-caret::after {
    display: none !important;
}
.expense-date-absolute {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    font-size: 0.7rem;
    color: #6c757d;
}
</style>
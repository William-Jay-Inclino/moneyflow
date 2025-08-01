<template>
    <div>

        <div class="d-flex justify-content-between align-items-center section-header px-2 mb-2">
            <span class="section-title fw-semibold">Summary</span>
        </div>

        <div class="mb-3">
            <PieChart :categories="categories" />
        </div>
        
        <div v-if="isLoading" class="loading-container text-center py-4">
            <span>Loading please wait...</span>
        </div>
        
        <div v-else-if="items.length > 0">
            <div class="d-flex justify-content-between align-items-center section-header px-2 mb-2">
                <span class="section-title fw-semibold">Items</span>
            </div>

            <div
                v-for="item in items"
                :key="item.id"
                class="expense-item-modern d-flex align-items-center justify-content-between mb-2 position-relative"
            >
                <!-- Date at top left, absolutely positioned -->
                <div class="expense-date-absolute">
                    {{ formatDate(item.date) }}
                </div>

                <div class="expense-info d-flex align-items-center flex-grow-1 overflow-hidden me-2">
                    <span
                        :class="['expense-list-icon me-3', type === 'expense' ? 'bg-expense-soft' : 'bg-income-soft']"
                    >
                        {{ item.icon || '💵' }}
                    </span>

                    <div class="flex-grow-1 overflow-hidden">
                        <div class="expense-notes-amount d-flex align-items-end justify-content-between">
                            <span
                                class="expense-notes fw-semibold text-truncate"
                                :title="item.notes || 'No notes'"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                            >
                                {{ item.notes || 'No notes' }}
                            </span>

                            <span
                                :style="{
                                    color: type === 'expense' ? '#ef4444' : '#34d399',
                                    backgroundColor: type === 'expense' ? '#fef2f2' : '#f0fdf4'
                                }"
                                class="expense-amount-modern ms-2"
                            >
                                {{ `${type === 'expense' ? '-' : '+'}${formatAmount(item.amount)}` }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 3 dots menu -->
                <div class="dropdown flex-shrink-0">
                    <button
                        class="btn expense-menu-btn dropdown-toggle expense-menu-dots dropdown-toggle-no-caret"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <span class="vertical-dots">⋮</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm expense-menu-dropdown-modern z-10">
                        <li>
                            <a @click="onEdit(item.id)" class="dropdown-item" href="#">
                                Edit
                            </a>
                        </li>
                        <li>
                            <a @click="onDelete(item.id)" class="dropdown-item text-danger" href="#">
                                Delete
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
        <div v-else class="empty-container text-center py-4">
            <div class="empty-text fw-semibold text-muted">No {{ type === 'expense' ? 'expenses' : 'income' }} found</div>
            <div class="empty-subtext text-secondary">Add your first {{ type === 'expense' ? 'expense' : 'income' }} above</div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { formatDate, formatAmount } from '../utils/helpers';
import type { Category } from '../types';
import PieChart from './PieChart.vue';
import { Tooltip } from 'bootstrap';

interface Item {
    id: string;
    category: Category;
    amount: string;
    notes: string;
    date: string;
    icon?: string;
}

const emit = defineEmits(['edit', 'delete']);

const props = defineProps<{
    items: Item[],
    isLoading: boolean,
    type: 'expense' | 'income'
}>();

onMounted(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new Tooltip(el));
});

const categories = computed(() => {
    const categoryMap: Record<number, { id: number, name: string, icon: string, color: string, amount: number, type: 'INCOME' | 'EXPENSE' }> = {};

    props.items.forEach(item => {
        const catId = typeof item.category.id === 'string' ? parseInt(item.category.id) : item.category.id;
        if (!categoryMap[catId]) {
            categoryMap[catId] = {
                id: catId,
                name: item.category.name,
                icon: item.category.icon,
                color: item.category.color,
                amount: 0,
                type: props.type.toUpperCase() as 'INCOME' | 'EXPENSE'
            };
        }
        categoryMap[catId].amount += parseFloat(item.amount);
    });

    return Object.values(categoryMap);
});

function onDelete(itemId: string) {
    emit('delete', { id: itemId });
}

function onEdit(itemId: string) {
    emit('edit', { id: itemId });
}

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
/* Make the icon bigger */
.expense-list-icon {
    font-size: 2rem;
    line-height: 1;
}
.expense-amount-modern {
    border-radius: 4px;
    padding: 2px 8px;
    font-weight: 500;
    display: inline-block;
}
.expense-menu-btn {
    padding: 4px 8px;
}
.vertical-dots {
    font-size: 18px;
    line-height: 1;
}
.bg-expense-soft {
    background-color: #fef2f2;
}
.bg-income-soft {
    background-color: #f0fdf4;
}
</style>
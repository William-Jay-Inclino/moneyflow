<template>
    <div>
        <YearPicker :year="selectedYear" @update="handleYearUpdate" />

        <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <div class="loading-text">Loading cash flow data...</div>
        </div>
        <template v-else>
            <div class="summary-container">
                <div class="summary-title">Summary</div>
                <div class="summary-stats">
                    <div class="summary-item">
                        <div class="summary-label">Total Income</div>
                        <div class="summary-income-amount">
                            +{{ formatAmount(summary?.totalIncome) }}
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Expense</div>
                        <div class="summary-expense-amount">
                            -{{ formatAmount(summary?.totalExpense) }}
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Net Cash Flow</div>
                        <div
                            class="summary-cash-flow-amount"
                            :class="{
                                'positive-cash-flow': summary?.totalCashFlow > 0,
                                'negative-cash-flow': summary?.totalCashFlow < 0,
                                'neutral-cash-flow': summary?.totalCashFlow === 0
                            }"
                        >
                            {{ summary?.totalCashFlow > 0 ? '+' : '' }}{{ formatAmount(summary?.totalCashFlow) }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="monthly-section">
                <div class="section-title">Monthly Breakdown</div>
                <div class="table-container">
                    <div class="table-header">
                        <span class="table-header-text month-column">Month</span>
                        <span class="table-header-text amount-column">Income</span>
                        <span class="table-header-text amount-column">Expense</span>
                        <span class="table-header-text amount-column">Cash Flow</span>
                    </div>
                    <div
                        v-for="(month, idx) in months"
                        :key="month.month"
                        :class="[
                            'table-row',
                            idx % 2 === 1 ? 'alternate-row' : '',
                            idx === currentMonth ? 'current-month-row' : ''
                        ]"
                    >
                        <div class="month-column month-cell">
                            <span
                                :class="['month-text', idx === currentMonth ? 'current-month-text' : '']"
                            >{{ month.monthName?.substring(0, 3) }}</span>
                            <span v-if="idx === currentMonth" class="current-indicator"></span>
                        </div>
                        <div class="amount-column amount-cell">
                            <span class="income-amount">
                                +{{ formatAmount(month.totalIncome) }}
                            </span>
                        </div>
                        <div class="amount-column amount-cell">
                            <span class="expense-amount">
                                -{{ formatAmount(month.totalExpense) }}
                            </span>
                        </div>
                        <div class="amount-column amount-cell">
                            <span
                                :class="[
                                    'cash-flow-amount',
                                    month.netCashFlow > 0
                                        ? 'positive-cash-flow'
                                        : month.netCashFlow < 0
                                        ? 'negative-cash-flow'
                                        : 'neutral-cash-flow'
                                ]"
                            >
                                {{ month.netCashFlow > 0 ? '+' : '' }}{{ formatAmount(month.netCashFlow) }}
                            </span>
                        </div>
                    </div>
                    <!-- Average Row -->
                    <div class="table-row average-row">
                        <div class="month-column month-cell">
                            <span class="month-text fw-bold">AVG.</span>
                        </div>
                        <div class="amount-column amount-cell">
                            <span class="income-amount fw-bold">
                                +{{ avgIncome.toLocaleString() }}
                            </span>
                        </div>
                        <div class="amount-column amount-cell">
                            <span class="expense-amount fw-bold">
                                -{{ avgExpense.toLocaleString() }}
                            </span>
                        </div>
                        <div class="amount-column amount-cell">
                            <span
                                class="cash-flow-amount fw-bold"
                                :class="{
                                    'positive-cash-flow': avgCashFlow > 0,
                                    'negative-cash-flow': avgCashFlow < 0,
                                    'neutral-cash-flow': avgCashFlow === 0
                                }"
                            >
                                {{ avgCashFlow > 0 ? '+' : '' }}{{ avgCashFlow.toLocaleString() }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PieChart Section -->
            <div class="mb-6">
                <PieChart 
                    :categories="cashFlowStore.cashFlowYearSummary?.incomeCategories" 
                    :is-clickable-category="true"
                    @category-click="handleCategoryClick"
                    class="mb-3"
                />
                <PieChart 
                    :categories="cashFlowStore.cashFlowYearSummary?.expenseCategories" 
                    :is-clickable-category="true"
                    @category-click="handleCategoryClick"
                    class="mb-3"
                />
            </div>

            <!-- Modal - Always render to avoid Bootstrap initialization issues -->
            <IEitemsModal
                :user_id="user?.user_id || ''"
                :category_id="selectedCategory?.id || 0"
                :type="selectedCategory?.type || 'EXPENSE'"
                :year="selectedYear"
                :enabled="!!selectedCategory"
            />

        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue';
import YearPicker from './YearPicker.vue';
import PieChart from './PieChart.vue';
import IEitemsModal from './IEitemsModal.vue';
import { useCashflowStore } from '../stores/cashflow.store';
import { get_auth_user_in_local_storage } from '../utils/helpers'
import { cashFlowApi } from '../api';
import type { Category } from '../types';

const cashFlowStore = useCashflowStore();

const now = new Date();
const currentMonth = now.getMonth();
const selectedYear = ref<number>(new Date().getFullYear())
const user = get_auth_user_in_local_storage()
const tz = import.meta.env.VITE_TZ || 'Asia/Manila'

const isLoading = ref(true);
const selectedCategory = ref<Category | null>(null);

onMounted(async () => {
    if(!user || !user.user_id) {
        console.error('User not authenticated');
        return;
    }
    isLoading.value = true;

    const res = await cashFlowApi.getCashFlowByYear(user.user_id, selectedYear.value, tz)
    cashFlowStore.setCashFlowData(res)

    const res2 = await cashFlowApi.getCashFlowYearSummary(user.user_id, selectedYear.value);
    cashFlowStore.setCashFlowYearSummary(res2)

    isLoading.value = false;

    // Add event listener for modal hidden event
    await nextTick();
    const modalElement = document.getElementById('ieItemsModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
            selectedCategory.value = null;
        });
    }
})

const months = computed(() => cashFlowStore.cashFlowData?.months ?? []);
const summary = computed(() => cashFlowStore.cashFlowData?.yearSummary ?? {
    totalIncome: 0,
    totalExpense: 0,
    totalCashFlow: 0
});

// Compute averages only for months with non-zero values
const avgIncome = computed(() => {
    const valid = months.value.filter(m => m.totalIncome && m.totalIncome !== 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((sum, m) => sum + m.totalIncome, 0) / valid.length);
});
const avgExpense = computed(() => {
    const valid = months.value.filter(m => m.totalExpense && m.totalExpense !== 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((sum, m) => sum + m.totalExpense, 0) / valid.length);
});
const avgCashFlow = computed(() => {
    const valid = months.value.filter(m => m.netCashFlow && m.netCashFlow !== 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((sum, m) => sum + m.netCashFlow, 0) / valid.length);
});

async function handleYearUpdate(newYear: number) {
    if(!user || !user.user_id) {
        console.error('User not authenticated');
        return;
    }
    selectedYear.value = newYear;
    isLoading.value = true;

    const res = await cashFlowApi.getCashFlowByYear(user.user_id, selectedYear.value, tz)
    cashFlowStore.setCashFlowData(res)

    const res2 = await cashFlowApi.getCashFlowYearSummary(user.user_id, selectedYear.value);
    cashFlowStore.setCashFlowYearSummary(res2)

    isLoading.value = false;
}

function handleCategoryClick(category: Category) {
    console.log('Category clicked in CashFlow:', category);
    selectedCategory.value = category;
}

function formatAmount(val: number | null | undefined): string {
    if (val == null) return '0';
    return Math.round(val).toLocaleString();
}
</script>

<style scoped>
.summary-container {
    background: white;
    margin: 0 0 24px 0; /* match PieChart.vue */
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    width: 100%; /* match PieChart.vue */
}
.summary-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    text-align: center;
}
.summary-stats {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.summary-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.summary-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
    font-weight: 500;
    text-align: center;
}
.summary-income-amount {
    font-size: 16px;
    font-weight: 700;
    color: #10b981;
    text-align: center;
}
.summary-expense-amount {
    font-size: 16px;
    font-weight: 700;
    color: #ef4444;
    text-align: center;
}
.summary-cash-flow-amount {
    font-size: 16px;
    font-weight: 700;
    text-align: center;
}
.monthly-section {
    margin-top: 16px;
    overflow-x: auto; /* allow horizontal scroll if needed */
}
.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
    padding-left: 20px;
}
.table-container {
    background: white;
    margin: 0 0 24px 0;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    overflow: auto; /* allow scrolling inside the container */
    padding: 32px;
    width: 100%;
    min-width: 600px;
    max-width: 100%;
}
.table-header,
.table-row,
.average-row {
    flex-wrap: nowrap;
    white-space: nowrap;
    display: flex;
}
.table-header-text,
.amount-column,
.month-column {
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.month-column {
    flex: 0.6 1 0; /* decreased from 1 to 0.6 */
    justify-content: flex-start;
    text-align: left;
    min-width: 60px; /* ensure still readable */
    max-width: 100px;
}
@media (max-width: 700px) {
    .table-container {
        min-width: 0;
        padding: 16px;
        overflow-x: auto;
    }
    .table-header-text,
    .amount-column,
    .month-column {
        flex: 1 1 0;
        min-width: 80px;
        max-width: 100%;
    }
    .month-column {
        flex: 0.6 1 0;
        min-width: 48px;
        max-width: 80px;
    }
}
.table-header {
    display: flex;
    flex-direction: row;
    background: #f8fafc;
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
}
.table-header-text {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
}
.month-column {
    flex: 0.9;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.amount-column {
    flex: 1.1;
    display: flex;
    align-items: center;
    justify-content: center;
}
.table-row {
    display: flex;
    flex-direction: row;
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
}
.alternate-row {
    background: #fafbfc;
}
.current-month-row {
    background: #f0f9ff;
    border-left: 4px solid #6366f1;
}
.month-cell {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}
.amount-cell {
    display: flex;
    align-items: center;
    justify-content: center;
}
.month-text {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
}
.current-month-text {
    color: #6366f1;
    font-weight: 700;
}
.current-indicator {
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background: #6366f1;
    margin-left: 6px;
}
.income-amount {
    font-size: 13px;
    font-weight: 600;
    color: #10b981;
}
.expense-amount {
    font-size: 13px;
    font-weight: 600;
    color: #ef4444;
}
.cash-flow-amount {
    font-size: 13px;
    font-weight: 700;
}
.positive-cash-flow {
    color: #10b981;
}
.negative-cash-flow {
    color: #ef4444;
}
.neutral-cash-flow {
    color: #64748b;
}
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
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
    margin-top: 16px;
    font-size: 16px;
    color: #64748b;
    text-align: center;
}
.average-row {
    background: linear-gradient(90deg, #e0f7ef 60%, #bbf7d0 100%);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.10);
    position: relative;
    color: #065f46;
}
.fw-bold {
    font-weight: bold;
}
</style>
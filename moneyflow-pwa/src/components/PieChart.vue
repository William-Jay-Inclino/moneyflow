<template>
    <div class="piechart-container">
        <div
            v-if="categories && categories.length === 0"
            class="d-flex align-items-center justify-content-center h-100 text-secondary text-center"
        >
            Empty data
        </div>
        <div v-else>
            <div class="w-100 d-flex align-items-center justify-content-center">
                <Pie :data="chartData" :options="chartOptions" />
            </div>

            <ul class="mt-2 w-100 list-unstyled">
                <!-- Helper text for clickable items -->
                <li v-if="isClickableCategory" class="helper-text mb-2">
                    <small class="text-muted">💡 Tap any category to view transactions</small>
                </li>
                
                <li
                    v-for="(item) in displayData"
                    :key="item.category"
                    class="d-flex justify-content-between align-items-center py-1 small"
                >
                    <button
                        v-if="isClickableCategory"
                        type="button"
                        class="btn btn-link category-item-clickable py-1 px-0 text-start w-100 border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#ieItemsModal"
                        @click="openTransactionsModal(item)"
                    >
                        <div class="d-flex justify-content-between align-items-center w-100">
                            <span class="d-flex align-items-center">
                                <span :style="{ background: item.color }" class="legend-dot me-2"></span>
                                {{ item.category }}
                            </span>
                            <span
                                class="fw-semibold"
                                :class="{
                                    'text-success': item.type === 'INCOME',
                                    'text-danger': item.type === 'EXPENSE'
                                }"
                            >
                                {{ formatAmount(item.amount) }}
                            </span>
                        </div>
                    </button>
                    <div
                        v-else
                        class="d-flex justify-content-between align-items-center w-100 py-1"
                    >
                        <span class="d-flex align-items-center">
                            <span :style="{ background: item.color }" class="legend-dot me-2"></span>
                            {{ item.category }}
                        </span>
                        <span
                            class="fw-semibold"
                            :class="{
                                'text-success': item.type === 'INCOME',
                                'text-danger': item.type === 'EXPENSE'
                            }"
                        >
                            {{ formatAmount(item.amount) }}
                        </span>
                    </div>
                </li>
            </ul>

            <div class="w-100 mt-4 border-top pt-3">
                <div v-if="totalIncome > 0" class="d-flex justify-content-between mb-1">
                    <span class="text-success fw-bold">Total Income</span>
                    <span class="text-success fw-bold fs-6">{{ formatAmount(totalIncome) }}</span>
                </div>
                <div v-if="totalExpense > 0" class="d-flex justify-content-between">
                    <span class="text-danger fw-bold">Total Expense</span>
                    <span class="text-danger fw-bold fs-6">{{ formatAmount(totalExpense) }}</span>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <!-- Modal moved to parent component -->
    </div>
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { computed } from 'vue'
import type { Category } from '../types'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'
import type { ChartOptions, ChartData } from 'chart.js'
import { formatAmount } from '../utils/helpers'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
    categories?: Category[],
    isClickableCategory?: boolean
}>()

const emit = defineEmits<{
    categoryClick: [category: Category]
}>()

const displayData = computed(() =>
    (props.categories ?? [])
        .map(cat => ({
            id: cat.id,
            category: cat.name,
            color: cat.color,
            amount: cat.amount,
            type: cat.type,
        }))
        .sort((a, b) => b.amount - a.amount)
)

const totalIncome = computed(() =>
    displayData.value
        .filter(item => item.type === 'INCOME')
        .reduce((acc, item) => acc + item.amount, 0)
)

const totalExpense = computed(() =>
    displayData.value
        .filter(item => item.type === 'EXPENSE')
        .reduce((acc, item) => acc + item.amount, 0)
)

const chartData = computed<ChartData<'pie'>>(() => ({
    labels: displayData.value.map(d => d.category),
    datasets: [
        {
            data: displayData.value.map(d => d.amount),
            backgroundColor: displayData.value.map(d => d.color),
            borderWidth: 0
        }
    ]
}))

const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    }
}

const openTransactionsModal = (item: any) => {
    if (!props.isClickableCategory) {
        return;
    }
    
    console.log('item clicked:', item);
    const category = props.categories?.find(cat => cat.id === item.id)
    if (category) {
        emit('categoryClick', category)
    }
}
</script>

<style scoped>
.piechart-container {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    width: 100%; 
    margin: 0 0 24px 0; 
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.legend-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

/* Helper text styling */
.helper-text {
    text-align: center;
    padding: 2px 0;
    border-bottom: 1px solid #f0f0f0;
}

/* Minimal clickable category items */
.category-item-clickable {
    cursor: pointer;
    transition: background-color 0.15s ease;
    text-decoration: none !important;
    color: inherit !important;
    background-color: transparent;
    border: none !important;
    border-radius: 4px;
    margin: 1px 0;
}

.category-item-clickable:hover {
    background-color: #f8f9fa !important;
    color: inherit !important;
}

.category-item-clickable:focus {
    outline: none !important;
    background-color: #f8f9fa !important;
    color: inherit !important;
}
</style>

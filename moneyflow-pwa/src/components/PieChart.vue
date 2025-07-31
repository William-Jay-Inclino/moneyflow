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
                <li
                    v-for="(item) in displayData"
                    :key="item.category"
                    class="d-flex justify-content-between align-items-center py-1 small"
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
                </li>
            </ul>

            <div class="w-100 mt-4 border-top pt-2 small">
                <div v-if="totalIncome > 0" class="d-flex justify-content-between">
                    <span class="text-success fw-medium">Total Income</span>
                    <span class="text-success fw-semibold">{{ formatAmount(totalIncome) }}</span>
                </div>
                <div v-if="totalExpense > 0" class="d-flex justify-content-between mt-1">
                    <span class="text-danger fw-medium">Total Expense</span>
                    <span class="text-danger fw-semibold">{{ formatAmount(totalExpense) }}</span>
                </div>
            </div>
        </div>
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
    categories?: Category[]
}>()

const displayData = computed(() =>
    (props.categories ?? [])
        .map(cat => ({
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
</style>

<template>
    <div class="w-full bg-white rounded-xl p-2 shadow flex flex-col items-center h-[600px] overflow-y-auto">
        <div
            v-if="categories && categories.length === 0"
            class="flex items-center justify-center h-full text-gray-500 text-large text-center"
        >
            Empty data
        </div>
        <div v-else>
            <div class="w-full flex items-center justify-center" style="height: 300px; max-width: 300px;">
                <Pie :data="chartData" :options="chartOptions" />
            </div>

            <ul class="mt-2 w-full">
                <li
                    v-for="(item, i) in displayData"
                    :key="item.category"
                    class="flex justify-between items-center py-1 text-sm"
                >
                    <span class="flex items-center">
                        <span :style="{ background: item.color }" class="inline-block w-3 h-3 rounded-full mr-2"></span>
                        {{ item.category }}
                    </span>
                    <span
                        class="font-semibold"
                        :class="{
                            'text-green-500': item.type === 'INCOME',
                            'text-red-500': item.type === 'EXPENSE'
                        }"
                    >
                        {{ formatAmount(item.amount) }}
                    </span>
                </li>
            </ul>

            <div class="w-full mt-4 border-t pt-2 text-sm">
                <div v-if="totalIncome > 0" class="flex justify-between">
                    <span class="text-green-600 font-medium">Total Income</span>
                    <span class="text-green-600 font-semibold">{{ formatAmount(totalIncome) }}</span>
                </div>
                <div v-if="totalExpense > 0" class="flex justify-between mt-1">
                    <span class="text-red-600 font-medium">Total Expense</span>
                    <span class="text-red-600 font-semibold">{{ formatAmount(totalExpense) }}</span>
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
import { formatAmount } from '../helpers'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
    categories?: Category[]
}>()

const displayData = computed(() =>
    (props.categories ?? []).map(cat => ({
        category: cat.name,
        color: cat.color,
        amount: cat.amount,
        type: cat.type,
    }))
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

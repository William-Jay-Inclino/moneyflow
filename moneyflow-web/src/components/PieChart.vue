<template>
    <div class="w-full bg-white rounded-xl p-2 shadow flex flex-col items-center">
        <div class="w-full flex items-center justify-center" style="height: 300px; max-width: 300px;">
            <Pie :data="chartData" :options="chartOptions" />
        </div>
        <ul class="mt-2 w-full">
            <li v-for="(item, i) in displayData" :key="item.category" class="flex justify-between items-center py-1 text-sm">
                <span class="flex items-center">
                    <span :style="{background: colors[i % colors.length]}" class="inline-block w-3 h-3 rounded-full mr-2"></span>
                    {{ item.category }}
                </span>
                <span class="font-semibold" :class="{'text-green-500': item.type === 'INCOME', 'text-red-500': item.type === 'EXPENSE'}">{{ item.amount }}</span>
            </li>
        </ul>
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

ChartJS.register(Title, Tooltip, Legend, ArcElement)

// Accept categories as a prop
const props = defineProps<{
    categories?: Category[]
}>()

const colors = [
    '#3b82f6', // blue-500
    '#f59e42', // orange-400
    '#10b981', // green-500
    '#f43f5e', // rose-500
    '#a78bfa'  // purple-400
]

// Prepare display data for chart and list
const displayData = computed(() =>
    (props.categories ?? []).map(cat => ({
        category: cat.name,
        amount: cat.amount,
        type: cat.type,
    }))
)

const chartData = computed<ChartData<'pie'>>(() => ({
    labels: displayData.value.map(d => d.category),
    datasets: [
        {
            data: displayData.value.map(d => d.amount),
            backgroundColor: colors,
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

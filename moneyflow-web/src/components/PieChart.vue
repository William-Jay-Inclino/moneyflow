<template>
    <div class="w-full bg-white rounded-xl p-2 shadow flex flex-col items-center">
        <div class="w-full h-48 flex items-center justify-center">
            <Pie :data="chartData" :options="chartOptions" />
        </div>
        <ul class="mt-2 w-full">
            <li v-for="(item, i) in data" :key="item.category" class="flex justify-between items-center py-1 text-sm">
                <span class="flex items-center">
                    <span :style="{background: colors[i]}" class="inline-block w-3 h-3 rounded-full mr-2"></span>
                    {{ item.category }}
                </span>
                <span class="font-semibold">{{ item.amount }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'

import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'
import type { ChartOptions, ChartData } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const data = [
    { category: 'Food', amount: 300 },
    { category: 'Transport', amount: 120 },
    { category: 'Shopping', amount: 200 },
    { category: 'Bills', amount: 150 },
    { category: 'Other', amount: 80 }
]

const colors = [
    '#3b82f6', // blue-500
    '#f59e42', // orange-400
    '#10b981', // green-500
    '#f43f5e', // rose-500
    '#a78bfa'  // purple-400
]

const chartData: ChartData<'pie'> = {
    labels: data.map(d => d.category),
    datasets: [
        {
            data: data.map(d => d.amount),
            backgroundColor: colors,
            borderWidth: 0
        }
    ]
}

const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    }
}
</script>

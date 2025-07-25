<template>
    <div class="mt-2">
        <div class="bg-white rounded-2xl p-6">
            <div class="overflow-x-auto">
                <table class="min-w-full rounded-xl">
                    <thead>
                        <tr class="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-sm">
                            <th class="px-8 py-4 text-left font-semibold rounded-tl-xl">Month</th>
                            <th class="px-8 py-4 text-left font-semibold">Income</th>
                            <th class="px-8 py-4 text-left font-semibold">Expense</th>
                            <th class="px-8 py-4 text-left font-semibold">Cash Flow</th>
                            <th class="px-8 py-4 text-left font-semibold rounded-tr-xl">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="row in rows"
                            :key="row.month"
                            class="even:bg-gray-50 odd:bg-white transition hover:bg-blue-50"
                        >
                            <td class="px-8 py-4 text-gray-700">{{ row.month }}</td>
                            <td class="px-8 py-4 text-green-600 font-semibold">{{ row.income }}</td>
                            <td class="px-8 py-4 text-red-500 font-semibold">{{ row.expense }}</td>
                            <td
                                class="px-8 py-4 font-bold"
                                :class="row.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'"
                            >
                                {{ row.cashFlow }}
                            </td>
                            <td class="px-8 py-4">
                                <LightBtn @click="viewDetails(row)">
                                    View
                                </LightBtn>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import LightBtn from './buttons/light-btn.vue';

import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../global.store';

type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
const months: Month[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const globalStore = useGlobalStore();
const { cash_flow_data } = storeToRefs(globalStore);

const rows = months.map((month) => ({
    month,
    income: cash_flow_data.value[month].income,
    expense: cash_flow_data.value[month].expense,
    cashFlow: cash_flow_data.value[month].cash_flow
}));

function viewDetails(row: { month: string; income: number; expense: number; cashFlow: number }) {
    // Implement your details logic here
    alert(`Viewing details for ${row.month}`);
}
</script>
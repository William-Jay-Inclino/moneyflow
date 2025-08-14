<template>
    <div class="mb-2" style="width: 1000px; margin: 0 auto;">
        <button @click="on_back" class="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition text-blue-700 w-auto">
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="text-sm">Back</span>
        </button>
    </div>

    <div class="flex flex-row gap-8" style="width: 1000px; margin: 0 auto;">
        <PieChart :categories="income_categories" />
        <PieChart :categories="expense_categories" />
    </div>

    <div class="bg-white p-6" style="width: 1000px; margin: 24px auto 0;">
        <div class="flex items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800 text-center" style="flex-grow: 1;">Income and Expense Details</h2>
        </div>
        <div class="flex flex-row gap-8" style="width: 1000px;">
            <div style="width: 480px;">
                <h3 class="text-xl font-semibold text-green-600 mb-4 text-center">Income</h3>
                <div style="overflow-x: auto;">
                    <table class="min-w-full bg-white rounded-xl">
                        <thead>
                            <tr class="bg-gradient-to-r from-green-100 to-green-50">
                                <th class="px-4 py-2 text-left text-gray-600 font-semibold">Date</th>
                                <th class="px-4 py-2 text-left text-gray-600 font-semibold">Note</th>
                                <th class="px-4 py-2 text-left text-gray-600 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="income in income_list" :key="income.id" class="hover:bg-green-50 transition">
                                <td class="px-4 py-2 text-gray-700">{{ format_date(income.date) }}</td>
                                <td class="px-4 py-2 text-gray-700">{{ income.note }}</td>
                                <td class="px-4 py-2 text-green-700 font-semibold">{{ formatAmount(income.amount) }}</td>
                            </tr>
                            <tr v-if="income_list.length === 0">
                                <td colspan="3" class="px-4 py-6 text-center text-gray-400">No income records found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style="width: 480px;">
                <h3 class="text-xl font-semibold text-red-500 mb-4 text-center">Expense</h3>
                <div style="overflow-x: auto;">
                    <table class="min-w-full bg-white rounded-xl">
                        <thead>
                            <tr class="bg-gradient-to-r from-red-100 to-red-50">
                                <th class="px-4 py-2 text-left text-gray-600 font-semibold">Date</th>
                                <th class="px-4 py-2 text-left text-gray-600 font-semibold">Note</th>
                                <th class="px-4 py-2 text-left text-gray-600 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="expense in expense_list" :key="expense.id" class="hover:bg-red-50 transition">
                                <td class="px-4 py-2 text-gray-700">{{ format_date(expense.date) }}</td>
                                <td class="px-4 py-2 text-gray-700">{{ expense.note }}</td>
                                <td class="px-4 py-2 text-red-700 font-semibold">{{ formatAmount(expense.amount) }}</td>
                            </tr>
                            <tr v-if="expense_list.length === 0">
                                <td colspan="3" class="px-4 py-6 text-center text-gray-400">No expense records found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useGlobalStore } from '../global.store';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { expenseApi, incomeApi } from '../api';
import type { Category } from '../types';
import { formatAmount } from '../helpers';
import PieChart from './PieChart.vue';

interface IeRecord {
    id: string;
    date: string;
    note: string;
    amount: string;
    category: Category;
}

const props = defineProps<{
    user_id: string;
    year: number;
    month: number;
}>();

const store = useGlobalStore();
const income_list = ref<IeRecord[]>([]);
const expense_list = ref<IeRecord[]>([]);

const expense_categories = computed((): Category[] => {
    const categoryMap = new Map<string, Category>();

    for (const expense of expense_list.value) {
        const { id, name, color } = expense.category;
        const amount = parseFloat(expense.amount);

        if (categoryMap.has(id)) {
            categoryMap.get(id)!.amount += amount;
        } else {
            categoryMap.set(id, {
                id,
                name,
                color,
                amount,
                type: 'EXPENSE',
            });
        }
    }

    return Array.from(categoryMap.values());
});

const income_categories = computed((): Category[] => {
    const categoryMap = new Map<string, Category>();

    for (const income of income_list.value) {
        const { id, name, color } = income.category;
        const amount = parseFloat(income.amount);

        if (categoryMap.has(id)) {
            categoryMap.get(id)!.amount += amount;
        } else {
            categoryMap.set(id, {
                id,
                name,
                color,
                amount,
                type: 'INCOME',
            });
        }
    }

    return Array.from(categoryMap.values());
});

function format_date(date_str: string): string {
    const date_obj = new Date(date_str);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date_obj.toLocaleDateString('en-US', options);
}

async function fetch_income_and_expense(user_id: string, month: number, year: number): Promise<void> {
    income_list.value = await fetch_income(user_id, month, year);
    expense_list.value = await fetch_expense(user_id, month, year);
}

async function fetch_income(user_id: string, month: number, year: number): Promise<IeRecord[]> {
    try {
        const data = await incomeApi.getIncome(user_id, year, month);
        // Map API response to IeRecord[] if needed
        return data.map((item: any) => ({
            id: item.id,
            date: item.income_date,
            note: item.notes,
            amount: item.amount,
            category: item.category,
        }));
    } catch (error) {
        console.error('Error fetching income:', error);
        return [];
    }
}

async function fetch_expense(user_id: string, month: number, year: number): Promise<IeRecord[]> {
    try {
        const data = await expenseApi.getExpenses(user_id, year, month);
        // Map API response to IeRecord[] if needed
        return data.map((item: any) => ({
            id: item.id,
            date: item.expense_date,
            note: item.notes,
            amount: item.cost,
            category: item.category,
        }));
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
}

function on_back() {
    store.show_cash_flow_details = false; 
}

const emit_close = defineEmits(['close']);

watch(() => [props.user_id, props.month, props.year], ([user_id, month, year]) => {
    fetch_income_and_expense(String(user_id), Number(month), Number(year));
}, { immediate: true });

onMounted(() => {
    fetch_income_and_expense(String(props.user_id), Number(props.month), Number(props.year));
});
</script>

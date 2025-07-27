<template>
    <div class="flex justify-end w-full">
        <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
            Logout
        </button>
    </div>
    <div class="flex flex-col lg:flex-row gap-8 w-full">

        <div class="lg:w-64 w-full lg:block">
            <Years />
        </div>
        <div class="flex-1 flex flex-col gap-8 w-full">
            <div class="w-full">
                <CashFlow />
            </div>
            <div class="flex flex-row gap-8 w-full">
                <div class="flex-1 flex flex-col items-center">
                    <span class="mb-2 font-semibold text-green-700">Income Whole Year: +{{ store.income_whole_year.total_amount }}</span>
                    <PieChart :categories="store.cash_flow_year_summary?.incomeCategories"/>
                </div>
                <div class="flex-1 flex flex-col items-center">
                    <span class="mb-2 font-semibold text-red-600">Expense Whole Year: -{{ store.expense_whole_year.total_amount }}</span>
                    <PieChart :categories="store.cash_flow_year_summary?.expenseCategories"/>
                </div>
            </div>
            
        </div>
    </div>
</template>


<script setup lang="ts">
    import Years from './Years.vue'
    import CashFlow from './CashFlow.vue';
    import PieChart from './PieChart.vue';
    import { useGlobalStore } from '../global.store'
    import { AUTH_KEY } from '../config';

    const store = useGlobalStore()

    function logout() {
        localStorage.removeItem(AUTH_KEY);
        store.is_authenticated = false
        store.auth_user = undefined
        window.location.reload()
    }


</script>
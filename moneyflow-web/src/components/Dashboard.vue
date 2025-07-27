<template>
    <div class="flex justify-end w-[1000px] mx-auto mb-4">
        <button
            @click="logout"
            class="bg-red-400 text-white px-3 py-1.5 rounded shadow hover:bg-red-500 transition flex items-center gap-1 text-sm"
        >
            <PowerIcon class="w-4 h-4" />
            Logout
        </button>
    </div>

    <div class="flex gap-8 w-[1000px] mx-auto">
        <!-- Sidebar -->
        <div class="w-[200px]">
            <Years />
        </div>

        <!-- Main Content -->
        <div class="w-[780px] flex flex-col gap-8">
            <div>
                <CashFlow />
            </div>

            <div class="flex gap-8">
                <!-- Income -->
                <div class="w-[380px] flex flex-col items-center">
                    <span class="mb-2 font-semibold text-green-700">
                        Income Whole Year: +{{ store.income_whole_year.total_amount }}
                    </span>
                    <PieChart :categories="store.cash_flow_year_summary?.incomeCategories" />
                </div>

                <!-- Expense -->
                <div class="w-[380px] flex flex-col items-center">
                    <span class="mb-2 font-semibold text-red-600">
                        Expense Whole Year: -{{ store.expense_whole_year.total_amount }}
                    </span>
                    <PieChart :categories="store.cash_flow_year_summary?.expenseCategories" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import Years from './Years.vue'
    import CashFlow from './CashFlow.vue'
    import PieChart from './PieChart.vue'
    import { useGlobalStore } from '../global.store'
    import { AUTH_KEY } from '../config'
    import { PowerIcon } from '@heroicons/vue/24/outline'

    const store = useGlobalStore()

    function logout() {
        localStorage.removeItem(AUTH_KEY)
        store.is_authenticated = false
        store.auth_user = undefined
        window.location.reload()
    }
</script>

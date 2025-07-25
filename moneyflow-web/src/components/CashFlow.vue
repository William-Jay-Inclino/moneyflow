<template>
    <div>
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

                    <tbody v-if="store.cash_flow_data && !store.is_loading_cash_flow">
                        <tr
                            v-for="item in store.cash_flow_data.months"
                            :key="item.month"
                            class="even:bg-gray-50 odd:bg-white transition hover:bg-blue-50"
                        >
                            <td class="px-8 py-4 text-gray-700">{{ monthName(item.month) }}</td>
                            <td class="px-8 py-4 text-green-600 font-semibold">{{ formatAmount(item.totalIncome) }}</td>
                            <td class="px-8 py-4 text-red-500 font-semibold">{{ formatAmount(item.totalExpense) }}</td>
                            <td
                                class="px-8 py-4 font-bold"
                                :class="item.netCashFlow >= 0 ? 'text-green-700' : 'text-red-500'"
                            >
                                {{ formatAmount(item.netCashFlow) }}
                            </td>
                            <td class="px-8 py-4">
                                <LightBtn @click="viewDetails(item)">
                                    View
                                </LightBtn>
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr>
                            <td colspan="5" class="text-center py-8">
                                <Spinner />
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
import Spinner from './loaders/Spinner.vue';
import { useGlobalStore } from '../global.store';
import { onMounted } from 'vue';
import { cashFlowApi } from '../api';
import { formatAmount, get_auth_user_in_local_storage } from '../helpers';
import { timezone } from '../config';


const store = useGlobalStore();

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthName(monthNum: number) {
    return monthNames[monthNum - 1] || monthNum;
}

onMounted( async() => {

    const auth_user = get_auth_user_in_local_storage()

    if(!auth_user) {
        console.error("User is not authenticated. Cannot fetch cash flow data.");
        return;
    }

    store.is_loading_cash_flow = true;
    const res = await cashFlowApi.getCashFlowByYear(auth_user.user_id, store.year_selected, timezone);
    store.is_loading_cash_flow = false;
    console.log('res', res);
    if (res) {
        store.set_cash_flow_data(res);
    }

    const res2 = await cashFlowApi.getCashFlowYearSummary(auth_user.user_id, store.year_selected);
    if(res2) {
        store.set_cash_flow_year_summary(res2) 
    }

});

function viewDetails(row: any) {
    console.log('Viewing details for:', row);
}

</script>
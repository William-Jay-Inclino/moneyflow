<template>
    <div class="flex justify-center">
        <div class="bg-white rounded-lg p-6 flex flex-col space-y-8 w-48">
            <button
                v-for="year in years"
                :key="year"
                @click="setActiveYear(year)"
                :class="[
                    'px-6 py-3 rounded-md text-base font-medium transition',
                    store.year_selected === year
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                ]"
            >
                {{ year }}
            </button>
        </div>
    </div>
</template>


<script setup lang="ts">
import { useGlobalStore } from '../global.store';
import { cashFlowApi } from '../api';
import { timezone } from '../config';
import { get_auth_user_in_local_storage } from '../helpers';

const store = useGlobalStore();
const years = Array.from({ length: 5 }, (_, i) => store.current_year - i);


async function setActiveYear(year: number) {

    const auth_user = get_auth_user_in_local_storage()

    if(!auth_user) {
        console.error("User is not authenticated. Cannot fetch cash flow data.");
        return;
    }

    store.year_selected = year;

    store.is_loading_cash_flow = true;
    const res = await cashFlowApi.getCashFlowByYear(auth_user.user_id, store.year_selected, timezone);
    store.is_loading_cash_flow = false;
    if (res) {
        store.set_cash_flow_data(res);
    }

    const res2 = await cashFlowApi.getCashFlowYearSummary(auth_user.user_id, store.year_selected);
    if(res2) {
        store.set_cash_flow_year_summary(res2) 
    }

}
</script>

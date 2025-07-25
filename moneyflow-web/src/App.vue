<template>
    <div class="min-h-screen flex flex-col">
        <Header />
        
        <div v-if="!store.is_authenticated">

            <div class="bg-red-100 text-red-700 p-4 text-center">
                <p class="text-lg font-semibold">You are not authenticated. Please log in to access your data.</p>
            </div>

            <Login />

        </div>

        <div v-else class="flex-1 flex flex-col gap-8 px-4 py-5 max-w-[100rem] mx-auto w-full">
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
        </div>

        <Footer />
    </div>
</template>



<script setup lang="ts">
    import Header from './components/Header.vue'
    import Footer from './components/Footer.vue'
    import Years from './components/Years.vue'
    import Login from './components/Login.vue'
    import CashFlow from './components/CashFlow.vue';
    import PieChart from './components/PieChart.vue';
    import { useGlobalStore } from './global.store'
    import { onMounted } from 'vue';
    import { get_auth_user_in_local_storage } from './helpers';
    import { AUTH_KEY } from './config';


    const store = useGlobalStore()

    function logout() {
        localStorage.removeItem(AUTH_KEY);
        store.is_authenticated = false
        store.auth_user = undefined
        window.location.reload()
    }

    onMounted( async() => {

        const auth_user = get_auth_user_in_local_storage()

        if(!auth_user) {
            console.error("User is not authenticated. Cannot fetch cash flow data.");
            return;
        }

        store.is_authenticated = true

    })

</script>
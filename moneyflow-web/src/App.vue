<template>
    <div class="min-h-screen flex flex-col">
        <Header />
        
        <div v-if="!store.is_authenticated">

            <div class="bg-red-100 text-red-700 p-4 text-center">
                <p class="text-lg font-semibold">You are not authenticated. Please log in to access your data.</p>
            </div>

            <Login />

        </div>

        <div v-else class="flex-1 flex flex-col gap-8 px-4 py-5 max-w-[100rem] mx-auto w-full mb-10">
            <CashFlowDetails 
                v-if="store.show_cash_flow_details"
                :month="store.selected_cash_flow.month"
                :year="store.selected_cash_flow.year"
                :user_id="store.selected_cash_flow.user_id"
            />
            <Dashboard v-else/>
        </div>

        <Footer />
    </div>
</template>



<script setup lang="ts">
    import Header from './components/Header.vue'
    import Footer from './components/Footer.vue'
    import Login from './components/Login.vue'
    import Dashboard from './components/Dashboard.vue';
    import CashFlowDetails from './components/CashFlowDetails.vue';
    import { useGlobalStore } from './global.store'
    import { onMounted } from 'vue';
    import { get_auth_user_in_local_storage } from './helpers';

    const store = useGlobalStore()


    onMounted( async() => {

        const auth_user = get_auth_user_in_local_storage()

        if(!auth_user) {
            console.error("User is not authenticated. Cannot fetch cash flow data.");
            return;
        }

        store.is_authenticated = true
        store.set_auth_user(auth_user)

    })

</script>
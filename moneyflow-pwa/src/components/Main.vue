
<template>
    <div class="app-container d-flex flex-column min-vh-100 bg-light">
        
        <Header :title="layoutStore.header.title" :subtitle="layoutStore.header.subtitle" :color="layoutStore.header.color"/>

        <main class="flex-fill container py-3 mb-5">

            <Expense v-if="layoutStore.route === 'expense'" />
            <CashFlow v-if="layoutStore.route === 'cashflow'" />

        </main>

        <MenuItems />

    </div>
</template>


<script setup lang="ts">
    import MenuItems from './MenuItems.vue'
    import Expense from './Expense.vue';
    import Header from './Header.vue';
    import CashFlow from './CashFlow.vue';
    import { useLayoutStore } from '../stores/layout.store';

    const layoutStore = useLayoutStore();

</script>


<style scoped>
    .app-container {
        max-width: 480px;
        margin: 0 auto;
        background: #f8f9fa;
    }
    main {
        padding-bottom: 70px; /* space for bottom nav */
    }
    @media (max-width: 480px) {
        .app-container {
            border-radius: 0;
        }
    }
</style>

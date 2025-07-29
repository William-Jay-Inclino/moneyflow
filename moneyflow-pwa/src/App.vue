
<template>
    <div class="app-container d-flex flex-column min-vh-100 bg-light">

        <Header :title="layoutStore.header.title" :subtitle="layoutStore.header.subtitle" :color="layoutStore.header.color"/>

        <main class="flex-fill container py-3 mb-5">
            
            <Expense />

        </main>

        <MenuItems />

        <PWABadge />
    </div>
</template>


<script setup>
    import PWABadge from './components/PWABadge.vue'
    import MenuItems from './components/MenuItems.vue'
    import Expense from './components/Expense.vue';
    import Header from './components/Header.vue';
    import { useLayoutStore } from './stores/layout.store';

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

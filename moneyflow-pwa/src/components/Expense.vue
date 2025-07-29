<template>
    <div class="container expense-container">

        <div class="mb-3">
            <DatePicker />
        </div>

        <ExpenseForm @add-expense="handleAddExpense" />

        <div v-if="!showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = true">
                <span>View Details</span>
                <span class="ms-2 toggle-icon">▼</span>
            </button>
        </div>

        <ExpenseDetails v-if="showExpenseDetails" :expenses="expenses" :isLoading="isLoadingExpenses" />

        <div v-if="showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = false">
                <span>Hide Details</span>
                <span class="ms-2 toggle-icon">▲</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExpenseForm from './ExpenseForm.vue';
import type { Expense } from '../types';
import ExpenseDetails from './ExpenseDetails.vue';
import DatePicker from './DatePicker.vue';

const isLoadingExpenses = ref(false);
const showExpenseDetails = ref(false);

const expenses = ref<Expense[]>([
    { id: '1', cost: 120, notes: 'Lunch', expense_date: new Date().toISOString() }
]);

function handleAddExpense() {
    console.log('adding');
}


</script>

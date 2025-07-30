<template>
    <div class="container expense-container">

        <div class="mb-3">
            <DatePicker @update="handleUpdateDate"/>
        </div>

        <ExpenseForm type="expense" @add="handleAddExpense" :is-loading="isSavingExpense"/>

        <div v-if="!showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = true">
                <span>View Details</span>
                <span class="ms-2 toggle-icon">▼</span>
            </button>
        </div>

        <ExpenseDetails 
            v-if="showExpenseDetails" 
            :items="expense_items" 
            :isLoading="isLoadingExpenses"
            @delete="handleDeleteExpense" 
            type="expense"
        />

        <div v-if="showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = false">
                <span>Hide Details</span>
                <span class="ms-2 toggle-icon">▲</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ExpenseForm from './IncomeExpenseForm.vue';
import type { AuthUser, Category} from '../types';
import ExpenseDetails from './IncomeExpenseDetails.vue';
import DatePicker from './DatePicker.vue';
import { useExpenseStore } from '../stores/expense.store';
import { expenseApi } from '../api';
import { get_auth_user_in_local_storage } from '../utils/helpers';

const expenseStore = useExpenseStore();
const isLoadingExpenses = ref(false);
const isSavingExpense = ref(false);
const showExpenseDetails = ref(false);
const authUser = ref<AuthUser | null>(null);

onMounted(async () => {
    isLoadingExpenses.value = true;
    
    const user = get_auth_user_in_local_storage()

    if(!user) {
        console.error('No user found in local storage');
        return;
    }
    authUser.value = user;

    const expenses = await expenseApi.getExpenses(user.user_id, expenseStore.selectedYear, expenseStore.selectedMonth);
    expenseStore.setExpenses(expenses);

    isLoadingExpenses.value = false;

});

const expense_items = computed(() => {
    return expenseStore.expenses.map(expense => ({
        id: expense.id,
        amount: expense.cost,
        notes: expense.notes,
        date: expense.expense_date
    }));
});

async function handleAddExpense(payload: { notes: string; amount: string; category: Category; day: number }) {
    const year = expenseStore.selectedYear;
    const month = expenseStore.selectedMonth;
    const date = new Date(year, month - 1, payload.day);
    const dateString = date.toISOString().split('T')[0];

    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    isSavingExpense.value = true;
    const created = await expenseApi.createExpense(authUser.value.user_id, {
        category_id: payload.category.id,
        cost: payload.amount,
        notes: payload.notes,
        expense_date: dateString
    });
    isSavingExpense.value = false;

    if(created) {
        expenseStore.addExpense({
            id: created.id,
            cost: created.cost,
            notes: created.notes,
            expense_date: created.expense_date
        });
        alert('Expense added successfully!');
    } else {
        alert('Failed to add expense. Please try again.');
    }

}

async function handleDeleteExpense(payload: { id: string }) {
    console.log('payload', payload);
    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    const id = payload.id;

    isLoadingExpenses.value = true;
    const deleted = await expenseApi.deleteExpense(authUser.value.user_id, id);
    isLoadingExpenses.value = false;

    if (deleted) {
        expenseStore.deleteExpense(id);
        alert('Expense deleted successfully!');
    } else {
        alert('Failed to delete expense. Please try again.');
    }
}

async function handleUpdateDate(payload: { year: number, month: number}) {
    expenseStore.selectedYear = payload.year;
    expenseStore.selectedMonth = payload.month;

    isLoadingExpenses.value = true;

    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    const expenses = await expenseApi.getExpenses(authUser.value.user_id, payload.year, payload.month);
    expenseStore.setExpenses(expenses);
    isLoadingExpenses.value = false;
}

</script>

import { defineStore } from "pinia"
import type { Category, Expense } from "../types"
import { ref } from "vue"

export const useExpenseStore = defineStore('expense', () => {

    const expenses = ref<Expense[]>([])
    const selectedYear = ref<number>(new Date().getFullYear())
    const selectedMonth = ref<number>(new Date().getMonth() + 1) 
    const formData = ref({
        amount: '',
        notes: '',
        category: undefined as Category | undefined,
        day: new Date().getDate(),
    })

    function setExpenses(newExpenses: Expense[]) {
        expenses.value = newExpenses
    }

    function addExpense(expense: Expense) {
        expenses.value.unshift({...expense})
    }

    function updateExpense(expense: Expense) {
        const index = expenses.value.findIndex(exp => exp.id === expense.id)
        if (index !== -1) {
            expenses.value[index] = {...expense}
        }
    }

    function deleteExpense(expenseId: string) {
        expenses.value = expenses.value.filter(exp => exp.id !== expenseId)
    }

    function resetFormData() {
        formData.value = {
            amount: '',
            notes: '',
            category: undefined,
            day: new Date().getDate(),
        }
    }

    return {
        expenses,
        setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        selectedYear,
        selectedMonth,
        formData,
        resetFormData,
    }

})
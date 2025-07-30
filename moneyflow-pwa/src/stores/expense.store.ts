import { defineStore } from "pinia"
import type { Expense } from "../types"
import { ref } from "vue"

export const useExpenseStore = defineStore('expense', () => {

    const expenses = ref<Expense[]>([])
    const selectedYear = ref<number>(new Date().getFullYear())
    const selectedMonth = ref<number>(new Date().getMonth() + 1) 

    const setExpenses = (newExpenses: Expense[]) => {
        expenses.value = newExpenses
    }

    const addExpense = (expense: Expense) => {
        expenses.value.unshift({...expense})
    }

    const updateExpense = (expense: Expense) => {
        const index = expenses.value.findIndex(exp => exp.id === expense.id)
        if (index !== -1) {
            expenses.value[index] = {...expense}
        }
    }

    const deleteExpense = (expenseId: string) => {
        expenses.value = expenses.value.filter(exp => exp.id !== expenseId)
    }

    return {
        expenses,
        setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        selectedYear,
        selectedMonth,
    }

})
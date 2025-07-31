import { defineStore } from "pinia"
import type { Category, Income } from "../types"
import { ref } from "vue"

export const useIncomeStore = defineStore('income', () => {

    const incomes = ref<Income[]>([])
    const selectedYear = ref<number>(new Date().getFullYear())
    const selectedMonth = ref<number>(new Date().getMonth() + 1) 
    const formData = ref({
        amount: '',
        notes: '',
        category: undefined as Category | undefined,
        day: new Date().getDate(),
    })

    function setIncomes(newIncomes: Income[]) {
        incomes.value = newIncomes
    }

    function addIncome(income: Income) {
        incomes.value.unshift({...income})
    }

    function updateIncome(income: Income) {
        const index = incomes.value.findIndex(exp => exp.id === income.id)
        if (index !== -1) {
            incomes.value[index] = {...income}
        }
    }

    function deleteIncome(incomeId: string) {
        incomes.value = incomes.value.filter(exp => exp.id !== incomeId)
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
        incomes,
        setIncomes,
        addIncome,
        updateIncome,
        deleteIncome,
        selectedYear,
        selectedMonth,
        formData,
        resetFormData,
    }

})
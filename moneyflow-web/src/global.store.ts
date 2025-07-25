import { defineStore } from 'pinia'
import { ref } from 'vue'
import { computed } from 'vue'
import { AUTH_KEY } from './config'
import type { AuthUser, Category } from './types'


interface CFMonth {
    month: number
    monthName: string
    totalIncome: number
    totalExpense: number
    netCashFlow: number
}

interface CFYearSummary {
    totalIncome: number
    totalExpense: number
    incomeCategories: Category[]
    expenseCategories: Category[]
}

export interface CashFlowData {
    months: CFMonth[]
    year: number
    yearSummary: {
        totalCashFlow: number
        totalIncome: number 
        totalExpense: number
    }
}


export const useGlobalStore = defineStore('global', () => {

    const auth_user = ref<AuthUser>()
    const is_loading_cash_flow = ref(false)
    const is_authenticated = ref(false)
    const current_year = ref(new Date().getFullYear())
    const year_selected = ref(current_year.value)

    const income_whole_year = ref({
        total_amount: 0,
        categories: [] as Category[]
    })

    const expense_whole_year = ref({
        total_amount: 0,
        categories: [] as Category[]
    })

    const cash_flow_data = ref<CashFlowData>()
    const cash_flow_year_summary = ref<CFYearSummary>()

    function set_auth_user(user: AuthUser) {
        console.log('set_auth_user', user);
        auth_user.value = {...user}
        localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }

    function set_income_whole_year(amount: number, categories: Category[]) {
        income_whole_year.value.total_amount = amount
        income_whole_year.value.categories = categories
    }

    function set_expense_whole_year(amount: number, categories: Category[]) {
        expense_whole_year.value.total_amount = amount
        expense_whole_year.value.categories = categories
    }

    function set_cash_flow_data(data: CashFlowData) {
        cash_flow_data.value = data   
    }

    function set_cash_flow_year_summary(summary: CFYearSummary) {
        cash_flow_year_summary.value = summary
    }

    return {
        auth_user,
        current_year,
        year_selected,      
        income_whole_year,  
        expense_whole_year,
        cash_flow_data,
        cash_flow_year_summary,
        set_auth_user,
        set_income_whole_year,
        set_expense_whole_year,
        set_cash_flow_data,
        set_cash_flow_year_summary,
        is_authenticated,
        is_loading_cash_flow,
    }
})
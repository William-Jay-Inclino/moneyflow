import { defineStore } from 'pinia'
import { ref } from 'vue'
import { computed } from 'vue'
import { AUTH_KEY } from './config'
import type { Category } from './types'


interface AuthUser {
    user_id: string 
    email: string
    token: string
}

interface CFMonth {
    month: number
    monthName: string
    totalIncome: number
    totalExpense: number
    netCashFlow: number
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

    const is_authenticated = computed(() => !!auth_user.value && !!auth_user.value.token)

    function set_auth_user(user: AuthUser) {
        auth_user.value = {...user}
        localStorage.setItem(AUTH_KEY, user.token)
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

    return {
        auth_user,
        current_year,
        year_selected,      
        income_whole_year,  
        expense_whole_year,
        cash_flow_data,
        set_auth_user,
        set_income_whole_year,
        set_expense_whole_year,
        set_cash_flow_data,
        is_authenticated,
        is_loading_cash_flow,
    }
})
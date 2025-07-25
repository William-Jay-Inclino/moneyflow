import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Category {
    name: string,
    amount: number
}

export const useGlobalStore = defineStore('global', () => {

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

    const cash_flow_data = ref({
        'Jan': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Feb': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Mar': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Apr': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'May': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Jun': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Jul': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Aug': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Sep': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Oct': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Nov': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
        'Dec': {
            income: 0,
            expense: 0,
            cash_flow: 0
        },
    })

    function set_income_whole_year(amount: number, categories: Category[]) {
        income_whole_year.value.total_amount = amount
        income_whole_year.value.categories = categories
    }

    function set_expense_whole_year(amount: number, categories: Category[]) {
        expense_whole_year.value.total_amount = amount
        expense_whole_year.value.categories = categories
    }

    function set_cash_flow_data_for_year(newData: typeof cash_flow_data.value) {
        for (const month in newData) {
            if (cash_flow_data.value[month as keyof typeof cash_flow_data.value]) {
                cash_flow_data.value[month as keyof typeof cash_flow_data.value] = { ...newData[month as keyof typeof cash_flow_data.value] };
            }
        }
    }

    return {
        year_selected,      
        income_whole_year,  
        expense_whole_year,
        cash_flow_data,
        set_income_whole_year,
        set_expense_whole_year,
        set_cash_flow_data_for_year,
    }
})
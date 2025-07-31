import { defineStore } from "pinia"
import { ref } from "vue"

type Route = 'expense' | 'income' | 'cashflow' | 'accounts';

export const useLayoutStore = defineStore('layout', () => {

    const header = ref({
        title: 'Add Expense',
        subtitle: 'Quick and easy expense tracking',
        color: '#3b82f6'
    })

    const route = ref<Route>('expense')

    function setHeader(payload: { title: string, subtitle?: string, color?: string }) {

        const { title, subtitle = '', color = '' } = payload

        header.value.title = title
        header.value.subtitle = subtitle
        header.value.color = color
    }

    function setRoute(newRoute: Route) {
        route.value = newRoute
    }

    return {
        header,
        setHeader,
        route,
        setRoute
    }

})
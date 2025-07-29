import { defineStore } from "pinia"
import { ref } from "vue"

export const useLayoutStore = defineStore('layout', () => {

    const header = ref({
        title: 'Expense',
        subtitle: 'Quick and easy expense tracking',
        color: '#3b82f6'
    })

    function setHeader(payload: { title: string, subtitle?: string, color?: string }) {

        const { title, subtitle = '', color = '' } = payload

        header.value.title = title
        header.value.subtitle = subtitle
        header.value.color = color
    }

    return {
        header,
        setHeader
    }

})
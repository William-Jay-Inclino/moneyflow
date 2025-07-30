import { defineStore } from "pinia"
import { computed, onMounted, ref } from "vue"
import type { Category } from "../types"
import { categoryApi } from "../api"

export const useCategoryStore = defineStore('category', () => {

    const categories = ref<Category[]>([])

    const incomeCategories = computed(() => {
        return categories.value.filter(category => category.type === 'INCOME')
    })

    const expenseCategories = computed(() => {
        return categories.value.filter(category => category.type === 'EXPENSE')
    })

    onMounted(async() => {

        const res = await categoryApi.getCategories()
        if (res) {
            setCategories(res)
        }
        else {
            console.error("Failed to fetch categories:", res)
        }

    })

    function setCategories(newCategories: Category[]) {
        categories.value = newCategories
    }   

    return {
        setCategories,
        incomeCategories,
        expenseCategories,
    }

})
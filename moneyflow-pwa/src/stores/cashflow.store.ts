import { defineStore } from "pinia"
import type { CashFlowData, CFYearSummary } from "../types"
import { ref } from "vue"

export const useCashflowStore = defineStore('cashflow', () => {

    const cashFlowData = ref<CashFlowData>()
    const cashFlowYearSummary = ref<CFYearSummary>()

    function setCashFlowData(data: CashFlowData) {
        cashFlowData.value = data
    }

    function setCashFlowYearSummary(summary: CFYearSummary) {
        cashFlowYearSummary.value = summary
    }

    return {
        cashFlowData,
        setCashFlowData,
        cashFlowYearSummary,
        setCashFlowYearSummary
    }

})
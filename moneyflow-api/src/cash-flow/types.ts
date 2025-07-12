export interface MonthlyCashFlow {
    month: number;
    monthName: string;
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
}

export interface YearSummary {
    totalIncome: number;
    totalExpense: number;
    totalCashFlow: number;
}

export interface CashFlowResponse {
    year: number;
    months: MonthlyCashFlow[];
    yearSummary: YearSummary;
}

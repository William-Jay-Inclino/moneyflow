import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { CashFlowResponse, MonthlyCashFlow, YearSummary } from './types';
import { startOfYear, endOfYear } from 'date-fns';

export interface CFYearSummary {
    totalIncome: number;
    totalExpense: number;
    incomeCategories: Category[];
    expenseCategories: Category[];
}

interface Category {
    name: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
}

@Injectable()
export class CashFlowService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    private getYearDateRange(year: number, timezone?: string) {
        // Use date-fns for accurate date boundaries
        try {
            // If timezone is needed, you can use date-fns-tz, but for now, use UTC dates
            const start = startOfYear(new Date(Date.UTC(year, 0, 1)));
            const end = endOfYear(new Date(Date.UTC(year, 0, 1)));
            // endOfYear returns Dec 31, 23:59:59.999, so add 1 ms to get exclusive upper bound
            const endExclusive = new Date(end.getTime() + 1);
            return { startOfYear: start, endOfYear: endExclusive };
        } catch (error) {
            console.warn('Invalid year provided, falling back to UTC:', year);
            const start = startOfYear(new Date(Date.UTC(year, 0, 1)));
            const end = endOfYear(new Date(Date.UTC(year, 0, 1)));
            const endExclusive = new Date(end.getTime() + 1);
            return { startOfYear: start, endOfYear: endExclusive };
        }
    }

    private decimalToNumber(decimal: Decimal | null): number {
        if (!decimal) return 0;
        return parseFloat(decimal.toString());
    }

    async getCashFlowByYear(userId: string, year: number, timezone?: string): Promise<CashFlowResponse> {
        console.log('🔄 CashFlowService.getCashFlowByYear:', { userId, year, timezone });

        try {
            const { startOfYear, endOfYear } = this.getYearDateRange(year, timezone);
            
            console.log('📅 Date range:', { startOfYear, endOfYear });

            // Get monthly income aggregation
            const monthlyIncome = await this.prisma.userIncome.groupBy({
                by: ['income_date'],
                where: {
                    user_id: userId,
                    income_date: {
                        gte: startOfYear,
                        lt: endOfYear,
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            // Get monthly expense aggregation
            const monthlyExpense = await this.prisma.userExpense.groupBy({
                by: ['expense_date'],
                where: {
                    user_id: userId,
                    expense_date: {
                        gte: startOfYear,
                        lt: endOfYear,
                    },
                },
                _sum: {
                    cost: true,
                },
            });

            console.log('📊 Raw data:', { 
                incomeRecords: monthlyIncome.length, 
                expenseRecords: monthlyExpense.length 
            });

            // Process data into monthly buckets
            const monthlyData: { [month: number]: { income: number; expense: number } } = {};
            
            // Initialize all 12 months with zero values
            for (let i = 1; i <= 12; i++) {
                monthlyData[i] = { income: 0, expense: 0 };
            }

            // Aggregate income by month
            monthlyIncome.forEach(record => {
                const month = new Date(record.income_date).getMonth() + 1; // 1-based month
                const amount = this.decimalToNumber(record._sum.amount);
                monthlyData[month].income += amount;
            });

            // Aggregate expense by month
            monthlyExpense.forEach(record => {
                const month = new Date(record.expense_date).getMonth() + 1; // 1-based month
                const cost = this.decimalToNumber(record._sum.cost);
                monthlyData[month].expense += cost;
            });

            // Create response structure
            const months: MonthlyCashFlow[] = [];
            let totalIncome = 0;
            let totalExpense = 0;

            for (let month = 1; month <= 12; month++) {
                const monthData = monthlyData[month];
                const netCashFlow = monthData.income - monthData.expense;

                months.push({
                    month,
                    monthName: this.monthNames[month - 1],
                    totalIncome: Math.round(monthData.income * 100) / 100, // Round to 2 decimal places
                    totalExpense: Math.round(monthData.expense * 100) / 100,
                    netCashFlow: Math.round(netCashFlow * 100) / 100,
                });

                totalIncome += monthData.income;
                totalExpense += monthData.expense;
            }

            const yearSummary: YearSummary = {
                totalIncome: Math.round(totalIncome * 100) / 100,
                totalExpense: Math.round(totalExpense * 100) / 100,
                totalCashFlow: Math.round((totalIncome - totalExpense) * 100) / 100,
            };

            console.log('✅ Cash flow data processed successfully');
            console.log('📊 Year summary:', yearSummary);

            return {
                year,
                months,
                yearSummary,
            };
        } catch (error) {
            console.error('❌ Error in getCashFlowByYear:', error);
            throw new BadRequestException('Failed to retrieve cash flow data');
        }
    }

    async getCashFlowYearSummary(userId: string, year: number): Promise<CFYearSummary> {
        const { startOfYear, endOfYear } = this.getYearDateRange(year);

        // Aggregate total income and by category
        const incomeAgg = await this.prisma.userIncome.groupBy({
            by: ['category_id'],
            where: {
                user_id: userId,
                income_date: {
                    gte: startOfYear,
                    lt: endOfYear,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Aggregate total expense and by category
        const expenseAgg = await this.prisma.userExpense.groupBy({
            by: ['category_id'],
            where: {
                user_id: userId,
                expense_date: {
                    gte: startOfYear,
                    lt: endOfYear,
                },
            },
            _sum: {
                cost: true,
            },
        });

        // Fetch category details for all involved category_ids
        const incomeCategoryIds = incomeAgg.map(i => i.category_id);
        const expenseCategoryIds = expenseAgg.map(e => e.category_id);
        const allCategoryIds = Array.from(new Set([...incomeCategoryIds, ...expenseCategoryIds]));

        const categories = await this.prisma.category.findMany({
            where: { id: { in: allCategoryIds } },
        });

        // Map category_id to details
        const categoryMap = new Map<number, { name: string; type: 'INCOME' | 'EXPENSE' }>();
        categories.forEach(cat => {
            categoryMap.set(cat.id, { name: cat.name, type: cat.type });
        });

        // Build incomeCategories
        const incomeCategories: Category[] = incomeAgg.map(i => ({
            name: categoryMap.get(i.category_id)?.name ?? 'Unknown',
            color: categories.find(c => c.id === i.category_id)?.color || '#000000', // Default color if not found
            amount: Math.round(this.decimalToNumber(i._sum.amount) * 100) / 100,
            type: 'INCOME',
        }));

        // Build expenseCategories
        const expenseCategories: Category[] = expenseAgg.map(e => ({
            name: categoryMap.get(e.category_id)?.name ?? 'Unknown',
            color: categories.find(c => c.id === e.category_id)?.color || '#000000', // Default color if not found
            amount: Math.round(this.decimalToNumber(e._sum.cost) * 100) / 100,
            type: 'EXPENSE',
        }));

        // Calculate totals
        const totalIncome = incomeCategories.reduce((sum, c) => sum + c.amount, 0);
        const totalExpense = expenseCategories.reduce((sum, c) => sum + c.amount, 0);

        return {
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpense: Math.round(totalExpense * 100) / 100,
            incomeCategories,
            expenseCategories,
        };
    }
}

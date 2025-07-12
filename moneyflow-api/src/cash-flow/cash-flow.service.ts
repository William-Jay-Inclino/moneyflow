import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { CashFlowResponse, MonthlyCashFlow, YearSummary } from './types';

@Injectable()
export class CashFlowService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    private getYearDateRange(year: number, timezone?: string) {
        // Default to UTC if no timezone provided
        const tz = timezone || 'UTC';
        
        try {
            // Create start and end of year in the specified timezone
            const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
            const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);
            
            return { startOfYear, endOfYear };
        } catch (error) {
            console.warn('Invalid timezone provided, falling back to UTC:', timezone);
            const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
            const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);
            return { startOfYear, endOfYear };
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
}

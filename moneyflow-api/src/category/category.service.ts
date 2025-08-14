import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { FilterCategoryDto } from './dto';
import { CategoryEntity } from './entities';
import { CategoryType } from '@prisma/client';
import { startOfYear, endOfYear } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    private decimalToNumber(decimal: Decimal | null): number {
        if (!decimal) return 0;
        return parseFloat(decimal.toString());
    }

    async findAll(filterDto?: FilterCategoryDto): Promise<CategoryEntity[]> {
        try {
            const where: any = {};

            if (filterDto?.type) {
                where.type = filterDto.type;
            }

            if (filterDto?.is_default !== undefined) {
                where.is_default = filterDto.is_default;
            }

            const categories = await this.prisma.category.findMany({
                where,
                orderBy: [
                    { is_default: 'desc' }, // Default categories first
                    { type: 'asc' },        // Then by type
                    { name: 'asc' },        // Then alphabetically
                ],
            });

            return categories.map(category => new CategoryEntity(category));
        } catch (error) {
            throw new BadRequestException('Failed to fetch categories');
        }
    }

    async getUserTransactionsByCategory(
        user_id: string,
        type: CategoryType,
        category_id: number,
        year: number
    ) {
        try {
            const yearDate = new Date(year, 0, 1);
            const startDate = startOfYear(yearDate);
            const endDate = endOfYear(yearDate);

            if (type === CategoryType.EXPENSE) {
                const expenses = await this.prisma.userExpense.findMany({
                    where: {
                        user_id,
                        category_id,
                        expense_date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    include: {
                        category: true
                    },
                    orderBy: {
                        expense_date: 'desc'
                    }
                });

                // Format cost field for each expense
                return expenses.map(expense => ({
                    ...expense,
                    cost: Math.round(this.decimalToNumber(expense.cost) * 100) / 100
                }));
            } else {
                const incomes = await this.prisma.userIncome.findMany({
                    where: {
                        user_id,
                        category_id,
                        income_date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    include: {
                        category: true
                    },
                    orderBy: {
                        income_date: 'desc'
                    }
                });

                // Format amount field for each income
                return incomes.map(income => ({
                    ...income,
                    amount: Math.round(this.decimalToNumber(income.amount) * 100) / 100
                }));
            }
        } catch (error) {
            throw new BadRequestException('Failed to fetch user transactions');
        }
    }
}

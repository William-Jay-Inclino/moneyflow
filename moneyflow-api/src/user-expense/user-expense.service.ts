import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UserExpenseEntity } from './entities/user-expense.entity';
import { CreateUserExpenseDto, FindUserExpenseDto, UpdateUserExpenseDto } from './dto';
import { CategoryType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class UserExpenseService {
    constructor(private readonly prisma: PrismaService) {}

    async create_user_expense(user_id: string, create_user_expense_dto: CreateUserExpenseDto): Promise<UserExpenseEntity> {
        const { category_id, cost, notes, expense_date } = create_user_expense_dto;

        try {
            // Verify category exists and belongs to user
            const user_category = await this.prisma.userCategory.findFirst({
                where: {
                    id: category_id,
                    user_id: user_id,
                },
                include: {
                    category: true,
                },
            });

            if (!user_category || !user_category.category || user_category.category.type !== 'EXPENSE') {
                throw new BadRequestException('Category not found, does not belong to user, or is not an expense category');
            }

            // Create the expense with timezone-aware date
            // Convert YYYY-MM-DD to Asia/Manila timezone at noon to avoid edge cases
            const expenseDateTime = new Date(expense_date + 'T12:00:00+08:00');
            
            const expense = await this.prisma.userExpense.create({
                data: {
                    user_id,
                    category_id,
                    cost: new Decimal(cost),
                    expense_date: expenseDateTime,
                    notes,
                },
                include: {
                    category: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            return new UserExpenseEntity(expense);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create user expense');
        }
    }

    async find_user_expenses(user_id: string, find_dto: FindUserExpenseDto): Promise<UserExpenseEntity[]> {
        const { year, month } = find_dto;

        try {
            // Create start and end dates for the given month and year in Asia/Manila timezone
            // Start of month: 00:00:00 Asia/Manila
            const start_date = new Date(`${year}-${month.toString().padStart(2, '0')}-01T00:00:00+08:00`);
            
            // End of month: Last day at 23:59:59.999 Asia/Manila
            const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
            const end_date = new Date(`${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59:59.999+08:00`);

            const expenses = await this.prisma.userExpense.findMany({
                where: {
                    user_id,
                    expense_date: {
                        gte: start_date,
                        lte: end_date,
                    },
                },
                include: {
                    category: {
                        include: {
                            category: true,
                        },
                    },
                },
                orderBy: {
                    expense_date: 'desc',
                },
            });

            return expenses.map(expense => new UserExpenseEntity(expense));
        } catch (error) {
            throw new BadRequestException('Failed to fetch user expenses');
        }
    }

    async find_user_expense_by_id(user_id: string, expense_id: string): Promise<UserExpenseEntity> {
        try {
            const expense = await this.prisma.userExpense.findFirst({
                where: {
                    id: expense_id,
                    user_id,
                },
                include: {
                    category: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            if (!expense) {
                throw new NotFoundException('User expense not found');
            }

            return new UserExpenseEntity(expense);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch user expense');
        }
    }

    async update_user_expense(user_id: string, expense_id: string, update_user_expense_dto: UpdateUserExpenseDto): Promise<UserExpenseEntity> {
        const { category_id, cost, notes, expense_date } = update_user_expense_dto;

        try {
            // Check if expense exists and belongs to user
            const existing_expense = await this.prisma.userExpense.findFirst({
                where: {
                    id: expense_id,
                    user_id,
                },
            });

            if (!existing_expense) {
                throw new NotFoundException('User expense not found');
            }

            // If category_id is provided, verify it belongs to user
            if (category_id) {
                const user_category = await this.prisma.userCategory.findFirst({
                    where: {
                        id: category_id,
                        user_id,
                    },
                    include: {
                        category: true,
                    },
                });

                if (!user_category || !user_category.category || user_category.category.type !== CategoryType.EXPENSE) {
                    throw new BadRequestException('Category not found, does not belong to user, or is not an expense category');
                }
            }

            // Update the expense
            const update_data: any = {};
            if (category_id !== undefined) update_data.category_id = category_id;
            if (cost !== undefined) update_data.cost = new Decimal(cost);
            if (notes !== undefined) update_data.notes = notes;
            if (expense_date !== undefined) {
                // Convert YYYY-MM-DD to Asia/Manila timezone at noon to avoid edge cases
                update_data.expense_date = new Date(expense_date + 'T12:00:00+08:00');
            }

            const updated_expense = await this.prisma.userExpense.update({
                where: {
                    id: expense_id,
                },
                data: update_data,
                include: {
                    category: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            return new UserExpenseEntity(updated_expense);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update user expense');
        }
    }

    async delete_user_expense(user_id: string, expense_id: string): Promise<void> {
        try {
            // Check if expense exists and belongs to user
            const existing_expense = await this.prisma.userExpense.findFirst({
                where: {
                    id: expense_id,
                    user_id,
                },
            });

            if (!existing_expense) {
                throw new NotFoundException('User expense not found');
            }

            await this.prisma.userExpense.delete({
                where: {
                    id: expense_id,
                },
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete user expense');
        }
    }

    async get_user_expense_summary(user_id: string, start_date?: string, end_date?: string): Promise<{
        total_expenses: number;
        total_cost: string;
        categories_summary: Array<{
            category_id: number;
            category_name: string;
            total_cost: string;
            count: number;
        }>;
    }> {
        const where: any = {
            user_id,
        };

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) {
                where.created_at.gte = new Date(start_date);
            }
            if (end_date) {
                where.created_at.lte = new Date(end_date);
            }
        }

        try {
            const [total_expenses, expenses_by_category] = await Promise.all([
                this.prisma.userExpense.count({ where }),
                this.prisma.userExpense.groupBy({
                    by: ['category_id'],
                    where,
                    _sum: {
                        cost: true,
                    },
                    _count: {
                        id: true,
                    },
                }),
            ]);

            // Get category names
            const category_ids = expenses_by_category.map(item => item.category_id);
            const user_categories = await this.prisma.userCategory.findMany({
                where: {
                    id: {
                        in: category_ids,
                    },
                    user_id,
                },
                include: {
                    category: true,
                },
            });

            const categories_map = new Map(user_categories.map(cat => [cat.id, cat.category?.name || 'Unknown']));

            const total_cost = expenses_by_category.reduce((sum, item) => {
                return sum.plus(item._sum.cost || new Decimal(0));
            }, new Decimal(0));

            const categories_summary = expenses_by_category.map(item => ({
                category_id: item.category_id,
                category_name: categories_map.get(item.category_id) || 'Unknown',
                total_cost: (item._sum.cost || new Decimal(0)).toString(),
                count: item._count.id,
            }));

            return {
                total_expenses,
                total_cost: total_cost.toString(),
                categories_summary,
            };
        } catch (error) {
            throw new BadRequestException('Failed to get user expense summary');
        }
    }
}

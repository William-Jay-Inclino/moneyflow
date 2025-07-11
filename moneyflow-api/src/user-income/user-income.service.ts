import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateUserIncomeDto, UpdateUserIncomeDto, FindUserIncomeDto } from './dto';
import { UserIncomeEntity } from './entities/user-income.entity';
import { Decimal } from '@prisma/client/runtime/library';
import { CategoryType } from '@prisma/client';

@Injectable()
export class UserIncomeService {
    constructor(private readonly prisma: PrismaService) {}

    async create_user_income(user_id: string, create_user_income_dto: CreateUserIncomeDto): Promise<UserIncomeEntity> {
        const { category_id, amount, notes, income_date } = create_user_income_dto;

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

            if (!user_category || !user_category.category || user_category.category.type !== CategoryType.INCOME) {
                throw new BadRequestException('Category not found, does not belong to user, or is not an income category');
            }

            // Create the income with timezone-aware date
            // If income_date is provided, convert YYYY-MM-DD to Asia/Manila timezone at noon
            // Otherwise, use current date and time
            const incomeDateTime = income_date 
                ? new Date(income_date + 'T12:00:00+08:00')
                : new Date();

            const income = await this.prisma.userIncome.create({
                data: {
                    user_id,
                    category_id,
                    amount: new Decimal(amount),
                    income_date: incomeDateTime,
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

            return new UserIncomeEntity(income);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create user income');
        }
    }

    async find_user_income(user_id: string, find_dto: FindUserIncomeDto): Promise<UserIncomeEntity[]> {
        const { year, month } = find_dto;

        try {
            // Create start and end dates for the given month and year in Asia/Manila timezone
            // Start of month: 00:00:00 Asia/Manila
            const start_date = new Date(`${year}-${month.toString().padStart(2, '0')}-01T00:00:00+08:00`);
            
            // End of month: Last day at 23:59:59.999 Asia/Manila
            const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
            const end_date = new Date(`${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59:59.999+08:00`);

            const income = await this.prisma.userIncome.findMany({
                where: {
                    user_id,
                    income_date: {
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
                    income_date: 'desc',
                },
            });

            return income.map(income_item => new UserIncomeEntity(income_item));
        } catch (error) {
            throw new BadRequestException('Failed to fetch user income');
        }
    }

    async find_user_income_by_id(user_id: string, income_id: string): Promise<UserIncomeEntity> {
        try {
            const income = await this.prisma.userIncome.findFirst({
                where: {
                    id: income_id,
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

            if (!income) {
                throw new NotFoundException('User income not found');
            }

            return new UserIncomeEntity(income);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch user income');
        }
    }

    async update_user_income(user_id: string, income_id: string, update_user_income_dto: UpdateUserIncomeDto): Promise<UserIncomeEntity> {
        const { category_id, amount, notes, income_date } = update_user_income_dto;

        try {
            // Check if income exists and belongs to user
            const existing_income = await this.prisma.userIncome.findFirst({
                where: {
                    id: income_id,
                    user_id,
                },
            });

            if (!existing_income) {
                throw new NotFoundException('User income not found');
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

                if (!user_category || !user_category.category || user_category.category.type !== CategoryType.INCOME) {
                    throw new BadRequestException('Category not found, does not belong to user, or is not an income category');
                }
            }

            // Update the income
            const update_data: any = {};
            if (category_id !== undefined) update_data.category_id = category_id;
            if (amount !== undefined) update_data.amount = new Decimal(amount);
            if (notes !== undefined) update_data.notes = notes;
            if (income_date !== undefined) {
                // Convert YYYY-MM-DD to Asia/Manila timezone at noon to avoid edge cases
                update_data.income_date = new Date(income_date + 'T12:00:00+08:00');
            }

            const updated_income = await this.prisma.userIncome.update({
                where: {
                    id: income_id,
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

            return new UserIncomeEntity(updated_income);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update user income');
        }
    }

    async delete_user_income(user_id: string, income_id: string): Promise<void> {
        try {
            // Check if income exists and belongs to user
            const existing_income = await this.prisma.userIncome.findFirst({
                where: {
                    id: income_id,
                    user_id,
                },
            });

            if (!existing_income) {
                throw new NotFoundException('User income not found');
            }

            await this.prisma.userIncome.delete({
                where: {
                    id: income_id,
                },
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete user income');
        }
    }

    async get_user_income_summary(user_id: string, start_date?: string, end_date?: string): Promise<{
        total_income: number;
        total_amount: string;
        categories_summary: Array<{
            category_id: number;
            category_name: string;
            total_amount: string;
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
            const [total_income, income_by_category] = await Promise.all([
                this.prisma.userIncome.count({ where }),
                this.prisma.userIncome.groupBy({
                    by: ['category_id'],
                    where,
                    _sum: {
                        amount: true,
                    },
                    _count: {
                        id: true,
                    },
                }),
            ]);

            // Get category names
            const category_ids = income_by_category.map(item => item.category_id);
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

            const total_amount = income_by_category.reduce((sum, item) => {
                return sum.plus(item._sum.amount || new Decimal(0));
            }, new Decimal(0));

            const categories_summary = income_by_category.map(item => ({
                category_id: item.category_id,
                category_name: categories_map.get(item.category_id) || 'Unknown',
                total_amount: (item._sum.amount || new Decimal(0)).toString(),
                count: item._count.id,
            }));

            return {
                total_income,
                total_amount: total_amount.toString(),
                categories_summary,
            };
        } catch (error) {
            throw new BadRequestException('Failed to get user income summary');
        }
    }
}

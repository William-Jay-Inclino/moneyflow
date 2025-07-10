import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateUserCategoryDto, UpdateUserCategoryDto, FilterUserCategoryDto } from './dto';
import { UserCategoryEntity } from './entities/user-category.entity';
import { CategoryType } from '@prisma/client';

@Injectable()
export class UserCategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async create_user_category(user_id: string, create_user_category_dto: CreateUserCategoryDto): Promise<UserCategoryEntity> {
        const { category_id } = create_user_category_dto;

        try {
            // Check if the category exists
            const category = await this.prisma.category.findUnique({
                where: { id: category_id },
            });

            if (!category) {
                throw new BadRequestException(`Category with ID ${category_id} does not exist`);
            }

            // Check if user already has this category
            const existing_user_category = await this.prisma.userCategory.findFirst({
                where: {
                    user_id,
                    category_id,
                },
            });

            if (existing_user_category) {
                throw new BadRequestException(`User already has this category`);
            }

            // Create the user category
            const user_category = await this.prisma.userCategory.create({
                data: {
                    user_id,
                    category_id,
                },
                include: {
                    category: true,
                },
            });

            return new UserCategoryEntity(user_category);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create user category');
        }
    }

    async find_user_categories(user_id: string, filter_dto?: FilterUserCategoryDto): Promise<UserCategoryEntity[]> {
        try {
            const where_clause: any = { user_id };
            
            if (filter_dto?.type) {
                where_clause.category = {
                    type: filter_dto.type
                };
            }

            const user_categories = await this.prisma.userCategory.findMany({
                where: where_clause,
                include: {
                    category: true,
                },
                orderBy: [
                    { category: { type: 'asc' } },
                    { category: { name: 'asc' } },
                ],
            });

            return user_categories.map(user_category => new UserCategoryEntity(user_category));
        } catch (error) {
            throw new BadRequestException('Failed to fetch user categories');
        }
    }

    async find_user_category_by_id(user_id: string, category_id: number): Promise<UserCategoryEntity> {
        try {
            const user_category = await this.prisma.userCategory.findFirst({
                where: {
                    id: category_id,
                    user_id,
                },
                include: {
                    category: true,
                },
            });

            if (!user_category) {
                throw new NotFoundException('User category not found');
            }

            return new UserCategoryEntity(user_category);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch user category');
        }
    }

    async update_user_category(user_id: string, category_id: number, update_user_category_dto: UpdateUserCategoryDto): Promise<UserCategoryEntity> {
        try {
            // Check if user category exists and belongs to user
            const existing_user_category = await this.prisma.userCategory.findFirst({
                where: {
                    id: category_id,
                    user_id,
                },
            });

            if (!existing_user_category) {
                throw new NotFoundException('User category not found');
            }

            // If updating category_id, check if the new category exists and user doesn't already have it
            if (update_user_category_dto.category_id) {
                const category = await this.prisma.category.findUnique({
                    where: { id: update_user_category_dto.category_id },
                });

                if (!category) {
                    throw new BadRequestException(`Category with ID ${update_user_category_dto.category_id} does not exist`);
                }

                // Check if user already has this category
                const duplicate_user_category = await this.prisma.userCategory.findFirst({
                    where: {
                        user_id,
                        category_id: update_user_category_dto.category_id,
                        id: {
                            not: category_id,
                        },
                    },
                });

                if (duplicate_user_category) {
                    throw new BadRequestException(`User already has this category`);
                }
            }

            // Update the user category
            const updated_user_category = await this.prisma.userCategory.update({
                where: {
                    id: category_id,
                },
                data: update_user_category_dto,
                include: {
                    category: true,
                },
            });

            return new UserCategoryEntity(updated_user_category);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update user category');
        }
    }

    async delete_user_category(user_id: string, category_id: number): Promise<void> {
        try {
            // Check if category exists and belongs to user
            const existing_category = await this.prisma.userCategory.findFirst({
                where: {
                    id: category_id,
                    user_id,
                },
            });

            if (!existing_category) {
                throw new NotFoundException('User category not found');
            }

            // Check if category is being used by any expenses or income
            const [expense_count, income_count] = await Promise.all([
                this.prisma.userExpense.count({
                    where: {
                        category_id,
                        user_id,
                    },
                }),
                this.prisma.userIncome.count({
                    where: {
                        category_id,
                        user_id,
                    },
                }),
            ]);

            if (expense_count > 0 || income_count > 0) {
                throw new BadRequestException('Cannot delete category that is being used by expenses or income entries');
            }

            // Delete the category
            await this.prisma.userCategory.delete({
                where: {
                    id: category_id,
                },
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete user category');
        }
    }
}

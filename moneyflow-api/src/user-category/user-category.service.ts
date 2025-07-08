import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateUserCategoryDto, UpdateUserCategoryDto, FilterUserCategoryDto } from './dto';
import { UserCategoryEntity } from './entities/user-category.entity';
import { CategoryType } from '@prisma/client';

@Injectable()
export class UserCategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async create_user_category(user_id: string, create_user_category_dto: CreateUserCategoryDto): Promise<UserCategoryEntity> {
        const { name, type } = create_user_category_dto;

        try {
            // Check if category with same name and type already exists for this user
            const existing_category = await this.prisma.userCategory.findFirst({
                where: {
                    user_id,
                    name,
                    type,
                },
            });

            if (existing_category) {
                throw new BadRequestException(`Category with name "${name}" and type "${type}" already exists for this user`);
            }

            // Create the category
            const category = await this.prisma.userCategory.create({
                data: {
                    user_id,
                    name,
                    type,
                },
            });

            return new UserCategoryEntity(category);
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
                where_clause.type = filter_dto.type;
            }

            const categories = await this.prisma.userCategory.findMany({
                where: where_clause,
                orderBy: [
                    { type: 'asc' },
                    { name: 'asc' },
                ],
            });

            return categories.map(category => new UserCategoryEntity(category));
        } catch (error) {
            throw new BadRequestException('Failed to fetch user categories');
        }
    }

    async find_user_category_by_id(user_id: string, category_id: number): Promise<UserCategoryEntity> {
        try {
            const category = await this.prisma.userCategory.findFirst({
                where: {
                    id: category_id,
                    user_id,
                },
            });

            if (!category) {
                throw new NotFoundException('User category not found');
            }

            return new UserCategoryEntity(category);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch user category');
        }
    }

    async update_user_category(user_id: string, category_id: number, update_user_category_dto: UpdateUserCategoryDto): Promise<UserCategoryEntity> {
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

            // Check if updating to a name/type combination that already exists
            if (update_user_category_dto.name || update_user_category_dto.type) {
                const name = update_user_category_dto.name || existing_category.name;
                const type = update_user_category_dto.type || existing_category.type;

                const duplicate_category = await this.prisma.userCategory.findFirst({
                    where: {
                        user_id,
                        name,
                        type,
                        id: {
                            not: category_id,
                        },
                    },
                });

                if (duplicate_category) {
                    throw new BadRequestException(`Category with name "${name}" and type "${type}" already exists for this user`);
                }
            }

            // Update the category
            const updated_category = await this.prisma.userCategory.update({
                where: {
                    id: category_id,
                },
                data: update_user_category_dto,
            });

            return new UserCategoryEntity(updated_category);
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

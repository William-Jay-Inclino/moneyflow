import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto, FilterCategoryDto } from './dto';
import { CategoryEntity } from './entities';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        const { name, type, color, icon, is_default = false } = createCategoryDto;

        try {
            // Check if category with same name and type already exists
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive', // Case-insensitive search
                    },
                    type,
                },
            });

            if (existingCategory) {
                throw new ConflictException(`Category '${name}' of type '${type}' already exists`);
            }

            const category = await this.prisma.category.create({
                data: {
                    name: name.trim(),
                    type,
                    color,
                    icon,
                    is_default,
                },
            });

            return new CategoryEntity(category);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to create category');
        }
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

    async findOne(id: number): Promise<CategoryEntity> {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id },
            });

            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            return new CategoryEntity(category);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch category');
        }
    }

    async findByType(type: CategoryType): Promise<CategoryEntity[]> {
        try {
            const categories = await this.prisma.category.findMany({
                where: { type },
                orderBy: [
                    { is_default: 'desc' }, // Default categories first
                    { name: 'asc' },        // Then alphabetically
                ],
            });

            return categories.map(category => new CategoryEntity(category));
        } catch (error) {
            throw new BadRequestException(`Failed to fetch ${type} categories`);
        }
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
        const { name, type, color, icon, is_default } = updateCategoryDto;

        try {
            // Check if category exists
            const existingCategory = await this.prisma.category.findUnique({
                where: { id },
            });

            if (!existingCategory) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            // If name or type is being updated, check for duplicates
            if (name || type) {
                const duplicateCheck = await this.prisma.category.findFirst({
                    where: {
                        AND: [
                            { id: { not: id } }, // Exclude current category
                            {
                                name: {
                                    equals: name?.trim() || existingCategory.name,
                                    mode: 'insensitive',
                                },
                            },
                            { type: type || existingCategory.type },
                        ],
                    },
                });

                if (duplicateCheck) {
                    throw new ConflictException(
                        `Category '${name || existingCategory.name}' of type '${type || existingCategory.type}' already exists`
                    );
                }
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name.trim();
            if (type !== undefined) updateData.type = type;
            if (color !== undefined) updateData.color = color;
            if (icon !== undefined) updateData.icon = icon;
            if (is_default !== undefined) updateData.is_default = is_default;

            const updatedCategory = await this.prisma.category.update({
                where: { id },
                data: updateData,
            });

            return new CategoryEntity(updatedCategory);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to update category');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            // Check if category exists
            const existingCategory = await this.prisma.category.findUnique({
                where: { id },
            });

            if (!existingCategory) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            // Check if category is being used in user categories
            const userCategoryCount = await this.prisma.userCategory.count({
                where: { category_id: id },
            });

            if (userCategoryCount > 0) {
                throw new BadRequestException(
                    `Cannot delete category. It is being used by ${userCategoryCount} user(s)`
                );
            }

            await this.prisma.category.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete category');
        }
    }

    async getUsageStats(id: number): Promise<{
        id: number;
        name: string;
        type: CategoryType;
        userCount: number;
        expenseCount: number;
        incomeCount: number;
    }> {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id },
                include: {
                    user_categories: {
                        include: {
                            user_expenses: true,
                            user_income: true,
                        },
                    },
                },
            });

            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            const userCount = category.user_categories.length;
            const expenseCount = category.user_categories.reduce(
                (total, uc) => total + uc.user_expenses.length,
                0
            );
            const incomeCount = category.user_categories.reduce(
                (total, uc) => total + uc.user_income.length,
                0
            );

            return {
                id: category.id,
                name: category.name,
                type: category.type,
                userCount,
                expenseCount,
                incomeCount,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to get category usage stats');
        }
    }
}

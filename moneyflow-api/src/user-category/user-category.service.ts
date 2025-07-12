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

        console.log('🔄 UserCategoryService.create_user_category:', { user_id, category_id });

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
                console.log('🔄 User already has this category, checking enabled status');
                
                if (existing_user_category.enabled) {
                    console.log('❌ User category already enabled');
                    throw new BadRequestException(`User already has this category enabled`);
                }
                
                // Enable the existing category
                console.log('✅ Enabling existing user category...');
                const updated_user_category = await this.prisma.userCategory.update({
                    where: { id: existing_user_category.id },
                    data: { enabled: true },
                    include: { category: true },
                });
                
                console.log('✅ User category enabled successfully');
                return new UserCategoryEntity(updated_user_category);
            }

            // Create new user category (enabled by default)
            console.log('➕ Creating new user category...');
            const user_category = await this.prisma.userCategory.create({
                data: {
                    user_id,
                    category_id,
                    enabled: true,
                },
                include: {
                    category: true,
                },
            });

            console.log('✅ User category created successfully');
            return new UserCategoryEntity(user_category);
        } catch (error) {
            console.error('❌ Error in create_user_category:', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create user category');
        }
    }

    async find_user_categories(user_id: string, filter_dto?: FilterUserCategoryDto): Promise<UserCategoryEntity[]> {
        console.log('🔄 UserCategoryService.find_user_categories:', { user_id, filter_dto });
        
        try {
            const where_clause: any = { 
                user_id,
                enabled: true // Only return enabled categories
            };
            
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

            console.log('✅ Found enabled user categories:', user_categories.length);
            return user_categories.map(user_category => new UserCategoryEntity(user_category));
        } catch (error) {
            console.error('❌ Error in find_user_categories:', error);
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
        console.log('🔄 UserCategoryService.delete_user_category:', { user_id, category_id });
        
        try {
            // Find the UserCategory record by user_id and category_id
            const existing_category = await this.prisma.userCategory.findFirst({
                where: {
                    user_id,
                    category_id, // This is the reference to the Category.id
                },
            });

            if (!existing_category) {
                console.log('❌ User category not found for user_id:', user_id, 'category_id:', category_id);
                console.log('📊 Available user categories for this user:');
                const all_user_categories = await this.prisma.userCategory.findMany({
                    where: { user_id },
                    include: { category: true }
                });
                console.log(all_user_categories);
                throw new NotFoundException('User category not found');
            }

            console.log('✅ Found user category to disable:', existing_category);

            if (!existing_category.enabled) {
                console.log('❌ User category already disabled');
                throw new BadRequestException('User category is already disabled');
            }

            // Disable the user category instead of deleting it
            await this.prisma.userCategory.update({
                where: {
                    id: existing_category.id,
                },
                data: {
                    enabled: false,
                },
            });

            console.log('✅ User category disabled successfully');
        } catch (error) {
            console.error('❌ Error in delete_user_category:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to disable user category');
        }
    }
}

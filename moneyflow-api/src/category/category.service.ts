import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto, FilterCategoryDto } from './dto';
import { CategoryEntity } from './entities';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

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
}

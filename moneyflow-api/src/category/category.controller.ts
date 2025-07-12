import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    ValidationPipe,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, FilterCategoryDto } from './dto';
import { CategoryEntity } from './entities';
import { CategoryType } from '@prisma/client';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiBody({ type: CreateCategoryDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Category created successfully',
        type: CategoryEntity,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Category with same name and type already exists',
    })
    async create(
        @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryEntity> {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories' })
    @ApiQuery({ 
        name: 'type', 
        required: false, 
        enum: CategoryType, 
        description: 'Filter by category type' 
    })
    @ApiQuery({ 
        name: 'is_default', 
        required: false, 
        type: Boolean, 
        description: 'Filter by default categories' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Categories retrieved successfully',
        type: [CategoryEntity],
    })
    async findAll(
        @Query(ValidationPipe) filterDto?: FilterCategoryDto,
    ): Promise<CategoryEntity[]> {
        return this.categoryService.findAll(filterDto);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Get categories by type' })
    @ApiParam({ 
        name: 'type', 
        enum: CategoryType, 
        description: 'Category type' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Categories retrieved successfully',
        type: [CategoryEntity],
    })
    async findByType(
        @Param('type') type: CategoryType,
    ): Promise<CategoryEntity[]> {
        return this.categoryService.findByType(type);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Category retrieved successfully',
        type: CategoryEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
    })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<CategoryEntity> {
        return this.categoryService.findOne(id);
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Get category usage statistics' })
    @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Category statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                type: { enum: ['INCOME', 'EXPENSE'] },
                userCount: { type: 'number' },
                expenseCount: { type: 'number' },
                incomeCount: { type: 'number' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
    })
    async getUsageStats(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoryService.getUsageStats(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update category' })
    @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
    @ApiBody({ type: UpdateCategoryDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Category updated successfully',
        type: CategoryEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Category with same name and type already exists',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryEntity> {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete category' })
    @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Category deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Category is being used and cannot be deleted',
    })
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return this.categoryService.remove(id);
    }
}

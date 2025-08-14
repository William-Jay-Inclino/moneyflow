import {
    Controller,
    Get,
    Query,
    ValidationPipe,
    HttpStatus,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { FilterCategoryDto } from './dto';
import { CategoryEntity } from './entities';
import { CategoryType } from '@prisma/client';
import { Public } from '../auth/decorators';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Public()
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

    @Get(':categoryId/transactions/:userId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user transactions by category' })
    @ApiParam({ name: 'categoryId', description: 'Category ID', type: 'integer' })
    @ApiParam({ name: 'userId', description: 'User ID', type: 'string' })
    @ApiQuery({ 
        name: 'type', 
        required: true, 
        enum: CategoryType, 
        description: 'Transaction type (INCOME or EXPENSE)' 
    })
    @ApiQuery({ 
        name: 'year', 
        required: true, 
        type: 'integer', 
        description: 'Year to filter transactions' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User transactions retrieved successfully',
    })
    async getUserTransactionsByCategory(
        @Param('categoryId', ParseIntPipe) categoryId: number,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query('type') type: CategoryType,
        @Query('year', ParseIntPipe) year: number,
    ) {
        return this.categoryService.getUserTransactionsByCategory(
            userId,
            type,
            categoryId,
            year
        );
    }
}

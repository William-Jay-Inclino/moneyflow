import {
    Controller,
    Get,
    Query,
    ValidationPipe,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { FilterCategoryDto } from './dto';
import { CategoryEntity } from './entities';
import { CategoryType } from '@prisma/client';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

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
}

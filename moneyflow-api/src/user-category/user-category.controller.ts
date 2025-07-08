import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
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
import { UserCategoryService } from './user-category.service';
import { CreateUserCategoryDto, UpdateUserCategoryDto, FilterUserCategoryDto } from './dto';
import { UserCategoryEntity } from './entities/user-category.entity';
import { CategoryType } from '@prisma/client';

@ApiTags('user-categories')
@Controller('users/:user_id/categories')
export class UserCategoryController {
    constructor(private readonly user_category_service: UserCategoryService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user category' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiBody({ type: CreateUserCategoryDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User category created successfully',
        type: UserCategoryEntity,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or duplicate category',
    })
    async create_user_category(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Body(ValidationPipe) create_user_category_dto: CreateUserCategoryDto,
    ): Promise<UserCategoryEntity> {
        return this.user_category_service.create_user_category(user_id, create_user_category_dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user categories' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiQuery({ 
        name: 'type', 
        required: false, 
        enum: CategoryType, 
        description: 'Filter by category type' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User categories retrieved successfully',
        type: [UserCategoryEntity],
    })
    async find_user_categories(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Query(ValidationPipe) filter_dto?: FilterUserCategoryDto,
    ): Promise<UserCategoryEntity[]> {
        return this.user_category_service.find_user_categories(user_id, filter_dto);
    }

    @Get(':category_id')
    @ApiOperation({ summary: 'Get user category by ID' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'category_id', description: 'Category ID', type: 'number' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User category retrieved successfully',
        type: UserCategoryEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User category not found',
    })
    async find_user_category_by_id(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('category_id', ParseIntPipe) category_id: number,
    ): Promise<UserCategoryEntity> {
        return this.user_category_service.find_user_category_by_id(user_id, category_id);
    }

    @Patch(':category_id')
    @ApiOperation({ summary: 'Update user category' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'category_id', description: 'Category ID', type: 'number' })
    @ApiBody({ type: UpdateUserCategoryDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User category updated successfully',
        type: UserCategoryEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User category not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or duplicate category',
    })
    async update_user_category(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('category_id', ParseIntPipe) category_id: number,
        @Body(ValidationPipe) update_user_category_dto: UpdateUserCategoryDto,
    ): Promise<UserCategoryEntity> {
        return this.user_category_service.update_user_category(user_id, category_id, update_user_category_dto);
    }

    @Delete(':category_id')
    @ApiOperation({ summary: 'Delete user category' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'category_id', description: 'Category ID', type: 'number' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User category deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User category not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Category is being used by expenses or income entries',
    })
    async delete_user_category(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('category_id', ParseIntPipe) category_id: number,
    ): Promise<void> {
        return this.user_category_service.delete_user_category(user_id, category_id);
    }
}

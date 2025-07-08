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
    ValidationPipe,
    UseGuards,
    Request,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { UserExpenseService } from './user-expense.service';
import { CreateUserExpenseDto, UpdateUserExpenseDto, FindUserExpenseDto } from './dto';
import { UserExpenseEntity } from './entities/user-expense.entity';

@ApiTags('user-expenses')
@Controller('users/:user_id/expenses')
export class UserExpenseController {
    constructor(private readonly user_expense_service: UserExpenseService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user expense' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiBody({ type: CreateUserExpenseDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User expense created successfully',
        type: UserExpenseEntity,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async create_user_expense(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Body(ValidationPipe) create_user_expense_dto: CreateUserExpenseDto,
    ): Promise<UserExpenseEntity> {
        return this.user_expense_service.create_user_expense(user_id, create_user_expense_dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get user expenses by year and month' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiQuery({ name: 'year', required: true, type: 'number', example: 2025 })
    @ApiQuery({ name: 'month', required: true, type: 'number', example: 7 })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User expenses retrieved successfully',
        type: [UserExpenseEntity],
    })
    async find_user_expenses(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Query(ValidationPipe) find_dto: FindUserExpenseDto,
    ): Promise<UserExpenseEntity[]> {
        return this.user_expense_service.find_user_expenses(user_id, find_dto);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get user expense summary' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiQuery({ name: 'start_date', required: false, type: 'string' })
    @ApiQuery({ name: 'end_date', required: false, type: 'string' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User expense summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total_expenses: { type: 'number' },
                total_cost: { type: 'string' },
                categories_summary: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category_id: { type: 'number' },
                            category_name: { type: 'string' },
                            total_cost: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
            },
        },
    })
    async get_user_expense_summary(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
    ) {
        return this.user_expense_service.get_user_expense_summary(user_id, start_date, end_date);
    }

    @Get(':expense_id')
    @ApiOperation({ summary: 'Get a specific user expense by ID' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'expense_id', description: 'Expense ID', type: 'string' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User expense retrieved successfully',
        type: UserExpenseEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User expense not found',
    })
    async find_user_expense_by_id(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('expense_id', ParseUUIDPipe) expense_id: string,
    ): Promise<UserExpenseEntity> {
        return this.user_expense_service.find_user_expense_by_id(user_id, expense_id);
    }

    @Patch(':expense_id')
    @ApiOperation({ summary: 'Update a user expense' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'expense_id', description: 'Expense ID', type: 'string' })
    @ApiBody({ type: UpdateUserExpenseDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User expense updated successfully',
        type: UserExpenseEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User expense not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async update_user_expense(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('expense_id', ParseUUIDPipe) expense_id: string,
        @Body(ValidationPipe) update_user_expense_dto: UpdateUserExpenseDto,
    ): Promise<UserExpenseEntity> {
        return this.user_expense_service.update_user_expense(user_id, expense_id, update_user_expense_dto);
    }

    @Delete(':expense_id')
    @ApiOperation({ summary: 'Delete a user expense' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'expense_id', description: 'Expense ID', type: 'string' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'User expense deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User expense not found',
    })
    async delete_user_expense(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('expense_id', ParseUUIDPipe) expense_id: string,
    ): Promise<void> {
        return this.user_expense_service.delete_user_expense(user_id, expense_id);
    }
}

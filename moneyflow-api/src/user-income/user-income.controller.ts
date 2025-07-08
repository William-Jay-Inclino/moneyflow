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
import { UserIncomeService } from './user-income.service';
import { CreateUserIncomeDto, UpdateUserIncomeDto, FindUserIncomeDto } from './dto';
import { UserIncomeEntity } from './entities/user-income.entity';

@ApiTags('user-income')
@Controller('users/:user_id/income')
export class UserIncomeController {
    constructor(private readonly user_income_service: UserIncomeService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user income' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiBody({ type: CreateUserIncomeDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User income created successfully',
        type: UserIncomeEntity,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async create_user_income(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Body(ValidationPipe) create_user_income_dto: CreateUserIncomeDto,
    ): Promise<UserIncomeEntity> {
        return this.user_income_service.create_user_income(user_id, create_user_income_dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get user income by year and month' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiQuery({ name: 'year', required: true, type: 'number', example: 2025 })
    @ApiQuery({ name: 'month', required: true, type: 'number', example: 7 })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User income retrieved successfully',
        type: [UserIncomeEntity],
    })
    async find_user_income(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Query(ValidationPipe) find_dto: FindUserIncomeDto,
    ): Promise<UserIncomeEntity[]> {
        return this.user_income_service.find_user_income(user_id, find_dto);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get user income summary' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiQuery({ name: 'start_date', required: false, type: 'string' })
    @ApiQuery({ name: 'end_date', required: false, type: 'string' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User income summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total_income: { type: 'number' },
                total_amount: { type: 'string' },
                categories_summary: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category_id: { type: 'number' },
                            category_name: { type: 'string' },
                            total_amount: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
            },
        },
    })
    async get_user_income_summary(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
    ) {
        return this.user_income_service.get_user_income_summary(user_id, start_date, end_date);
    }

    @Get(':income_id')
    @ApiOperation({ summary: 'Get user income by ID' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'income_id', description: 'Income ID', type: 'string' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User income retrieved successfully',
        type: UserIncomeEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User income not found',
    })
    async find_user_income_by_id(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('income_id', ParseUUIDPipe) income_id: string,
    ): Promise<UserIncomeEntity> {
        return this.user_income_service.find_user_income_by_id(user_id, income_id);
    }

    @Patch(':income_id')
    @ApiOperation({ summary: 'Update user income' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'income_id', description: 'Income ID', type: 'string' })
    @ApiBody({ type: UpdateUserIncomeDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User income updated successfully',
        type: UserIncomeEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User income not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async update_user_income(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('income_id', ParseUUIDPipe) income_id: string,
        @Body(ValidationPipe) update_user_income_dto: UpdateUserIncomeDto,
    ): Promise<UserIncomeEntity> {
        return this.user_income_service.update_user_income(user_id, income_id, update_user_income_dto);
    }

    @Delete(':income_id')
    @ApiOperation({ summary: 'Delete user income' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'income_id', description: 'Income ID', type: 'string' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User income deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User income not found',
    })
    async delete_user_income(
        @Param('user_id', ParseUUIDPipe) user_id: string,
        @Param('income_id', ParseUUIDPipe) income_id: string,
    ): Promise<void> {
        return this.user_income_service.delete_user_income(user_id, income_id);
    }
}

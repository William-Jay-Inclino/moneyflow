import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    ParseIntPipe,
    Query,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { CashFlowResponse } from './types';
import { CashFlowService, CFYearSummary } from './cash-flow.service';

@ApiTags('cash-flow')
@Controller('users/:user_id/cash-flow')
export class CashFlowController {
    constructor(private readonly cashFlowService: CashFlowService) {}

    @Get(':year')
    @ApiOperation({ summary: 'Get cash flow data for a specific year' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'year', description: 'Year (e.g., 2025)', type: 'number' })
    @ApiQuery({ 
        name: 'timezone', 
        required: false, 
        description: 'User timezone (e.g., America/New_York)', 
        type: 'string' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cash flow data retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                year: { type: 'number' },
                months: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            month: { type: 'number' },
                            monthName: { type: 'string' },
                            totalIncome: { type: 'number' },
                            totalExpense: { type: 'number' },
                            netCashFlow: { type: 'number' },
                        },
                    },
                },
                yearSummary: {
                    type: 'object',
                    properties: {
                        totalIncome: { type: 'number' },
                        totalExpense: { type: 'number' },
                        totalCashFlow: { type: 'number' },
                    },
                },
            },
        },
    })
    async getCashFlowByYear(
        @Param('user_id', ParseUUIDPipe) userId: string,
        @Param('year', ParseIntPipe) year: number,
        @Query('timezone') timezone?: string,
    ): Promise<CashFlowResponse> {
        console.log('📊 GET /users/:user_id/cash-flow/:year endpoint hit');
        console.log('📥 Request params:', { userId, year, timezone });
        
        try {
            const result = await this.cashFlowService.getCashFlowByYear(userId, year, timezone);
            console.log('✅ Cash flow data retrieved successfully');
            return result;
        } catch (error) {
            console.error('❌ Error retrieving cash flow data:', error);
            throw error;
        }
    }

    @Get(':year/summary')
    @ApiOperation({ summary: 'Get cash flow year summary (totals and categories)' })
    @ApiParam({ name: 'user_id', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'year', description: 'Year (e.g., 2025)', type: 'number' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cash flow year summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                totalIncome: { type: 'number' },
                totalExpense: { type: 'number' },
                incomeCategories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            amount: { type: 'number' },
                            type: { type: 'string', enum: ['INCOME'] },
                        },
                    },
                },
                expenseCategories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            amount: { type: 'number' },
                            type: { type: 'string', enum: ['EXPENSE'] },
                        },
                    },
                },
            },
        },
    })
    async getCashFlowYearSummary(
        @Param('user_id', ParseUUIDPipe) userId: string,
        @Param('year', ParseIntPipe) year: number,
    ): Promise<CFYearSummary> {
        console.log('📊 GET /users/:user_id/cash-flow/:year/summary endpoint hit');
        console.log('📥 Request params:', { userId, year });
        try {
            const result = await this.cashFlowService.getCashFlowYearSummary(userId, year);
            console.log('✅ Cash flow year summary retrieved successfully');
            return result;
        } catch (error) {
            console.error('❌ Error retrieving cash flow year summary:', error);
            throw error;
        }
    }
}

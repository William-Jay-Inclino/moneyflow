import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsPositive, IsDecimal, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserExpenseDto {
    @ApiProperty({
        description: 'Category ID for the expense',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    category_id: number;

    @ApiProperty({
        description: 'Cost of the expense',
        example: '25.50',
        type: 'string',
    })
    @IsNotEmpty()
    @IsString()
    @IsDecimal({ decimal_digits: '1,2' })
    cost: string;

    @ApiProperty({
        description: 'Date when the expense occurred',
        example: '2025-07-11',
        type: 'string',
        format: 'date',
    })
    @IsNotEmpty()
    @IsDateString()
    expense_date: string;

    @ApiProperty({
        description: 'Optional notes about the expense',
        example: 'Lunch at restaurant',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

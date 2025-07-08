import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsPositive, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserIncomeDto {
    @ApiProperty({
        description: 'Category ID for the income',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    category_id: number;

    @ApiProperty({
        description: 'Amount of the income',
        example: '3500.00',
        type: 'string',
    })
    @IsNotEmpty()
    @IsString()
    @IsDecimal({ decimal_digits: '1,2' })
    amount: string;

    @ApiProperty({
        description: 'Optional notes about the income',
        example: 'Monthly salary',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserIncomeDto } from './create-user-income.dto';
import { IsOptional, IsNumber, IsPositive, IsString, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserIncomeDto extends PartialType(CreateUserIncomeDto) {
    @ApiProperty({
        description: 'Category ID for the income',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    category_id?: number;

    @ApiProperty({
        description: 'Amount of the income',
        example: '3500.00',
        type: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsDecimal({ decimal_digits: '1,2' })
    amount?: string;

    @ApiProperty({
        description: 'Optional notes about the income',
        example: 'Monthly salary',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

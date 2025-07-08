import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserExpenseDto } from './create-user-expense.dto';
import { IsOptional, IsNumber, IsPositive, IsString, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserExpenseDto extends PartialType(CreateUserExpenseDto) {
    @ApiProperty({
        description: 'Category ID for the expense',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    category_id?: number;

    @ApiProperty({
        description: 'Cost of the expense',
        example: '25.50',
        type: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsDecimal({ decimal_digits: '1,2' })
    cost?: string;

    @ApiProperty({
        description: 'Optional notes about the expense',
        example: 'Lunch at restaurant',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

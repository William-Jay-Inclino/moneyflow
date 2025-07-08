import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindUserIncomeDto {
    @ApiProperty({
        description: 'Year for filtering income',
        example: 2025,
        minimum: 1900,
        maximum: 2100,
    })
    @IsNumber()
    @IsPositive()
    @Min(1900)
    @Max(2100)
    @Type(() => Number)
    year: number;

    @ApiProperty({
        description: 'Month for filtering income (1-12)',
        example: 7,
        minimum: 1,
        maximum: 12,
    })
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { CategoryType } from '@prisma/client';

export class FilterUserCategoryDto {
    @ApiProperty({
        description: 'Filter by category type',
        enum: CategoryType,
        required: false,
        example: CategoryType.EXPENSE,
    })
    @IsOptional()
    @IsEnum(CategoryType)
    type?: CategoryType;
}

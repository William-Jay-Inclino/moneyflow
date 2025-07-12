import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class FilterCategoryDto {
    @ApiProperty({
        description: 'Filter by category type',
        enum: CategoryType,
        required: false,
    })
    @IsOptional()
    @IsEnum(CategoryType)
    type?: CategoryType;

    @ApiProperty({
        description: 'Filter by default categories',
        example: true,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    is_default?: boolean;
}

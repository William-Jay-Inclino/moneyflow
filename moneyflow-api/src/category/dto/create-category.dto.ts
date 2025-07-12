import { IsString, IsEnum, IsBoolean, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Category name',
        example: 'Food & Dining',
        minLength: 1,
        maxLength: 50,
    })
    @IsString()
    @Length(1, 50)
    name: string;

    @ApiProperty({
        description: 'Category type',
        enum: CategoryType,
        example: CategoryType.EXPENSE,
    })
    @IsEnum(CategoryType)
    type: CategoryType;

    @ApiProperty({
        description: 'Category color (hex format)',
        example: '#3b82f6',
        pattern: '^#[0-9a-fA-F]{6}$',
    })
    @IsString()
    @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color must be a valid hex color (e.g., #3b82f6)' })
    color: string;

    @ApiProperty({
        description: 'Category icon (emoji or unicode)',
        example: '🍽️',
        minLength: 1,
        maxLength: 10,
    })
    @IsString()
    @Length(1, 10)
    icon: string;

    @ApiProperty({
        description: 'Whether this is a default category',
        example: false,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    is_default?: boolean;
}

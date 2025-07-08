import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, MaxLength } from 'class-validator';
import { CategoryType } from '@prisma/client';

export class CreateUserCategoryDto {
    @ApiProperty({
        description: 'Category name',
        example: 'Food & Dining',
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Category type',
        enum: CategoryType,
        example: CategoryType.EXPENSE,
    })
    @IsNotEmpty()
    @IsEnum(CategoryType)
    type: CategoryType;
}

import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class CategoryEntity {
    @ApiProperty({
        description: 'Unique identifier for the category',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Category name',
        example: 'Food & Dining',
    })
    name: string;

    @ApiProperty({
        description: 'Category type',
        enum: CategoryType,
        example: CategoryType.EXPENSE,
    })
    type: CategoryType;

    @ApiProperty({
        description: 'Category color in hex format',
        example: '#3b82f6',
    })
    color: string;

    @ApiProperty({
        description: 'Category icon (emoji or unicode)',
        example: '🍽️',
    })
    icon: string;

    @ApiProperty({
        description: 'Whether this is a default category',
        example: false,
    })
    is_default: boolean;

    constructor(partial: Partial<CategoryEntity>) {
        Object.assign(this, partial);
    }
}

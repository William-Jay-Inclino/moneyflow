import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class UserCategoryEntity {
    @ApiProperty({
        description: 'Category ID',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'User ID',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    user_id: string;

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

    constructor(partial: Partial<UserCategoryEntity>) {
        Object.assign(this, partial);
    }
}

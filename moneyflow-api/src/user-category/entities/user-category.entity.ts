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
        description: 'Category ID reference',
        example: 1,
        nullable: true,
    })
    category_id: number | null;

    @ApiProperty({
        description: 'Category details (populated from relation)',
        required: false,
    })
    category?: {
        id: number;
        name: string;
        type: CategoryType;
        color: string;
        icon: string;
        is_default: boolean;
    };

    constructor(partial: Partial<UserCategoryEntity>) {
        Object.assign(this, partial);
    }
}

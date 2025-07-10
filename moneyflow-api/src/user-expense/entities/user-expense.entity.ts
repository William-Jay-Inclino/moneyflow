import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class UserExpenseEntity {
    @ApiProperty({
        description: 'Unique identifier for the user expense',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'User ID who owns this expense',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    user_id: string;

    @ApiProperty({
        description: 'Date and time when the expense was created',
        example: '2025-07-08T10:30:00Z',
    })
    created_at: Date;

    @ApiProperty({
        description: 'Category ID for the expense',
        example: 1,
    })
    category_id: number;

    @ApiProperty({
        description: 'Cost of the expense',
        example: '25.50',
        type: 'string',
    })
    cost: Decimal;

    @ApiProperty({
        description: 'Optional notes about the expense',
        example: 'Lunch at restaurant',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        description: 'Category information',
        required: false,
    })
    @ApiProperty({
        description: 'Category information',
        required: false,
    })
    category?: {
        id: number;
        category_id: number | null;
        category?: {
            id: number;
            name: string;
            type: string;
            color: string;
            icon: string;
            is_default: boolean;
        };
    };

    constructor(partial: Partial<UserExpenseEntity>) {
        Object.assign(this, partial);
    }
}

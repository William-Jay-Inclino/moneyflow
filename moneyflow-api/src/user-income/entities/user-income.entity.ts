import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class UserIncomeEntity {
    @ApiProperty({
        description: 'Unique identifier for the user income',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'User ID who owns this income',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    user_id: string;

    @ApiProperty({
        description: 'Date and time when the income was created',
        example: '2025-07-08T10:30:00Z',
    })
    created_at: Date;

    @ApiProperty({
        description: 'Category ID for the income',
        example: 1,
    })
    category_id: number;

    @ApiProperty({
        description: 'Amount of the income',
        example: '3500.00',
        type: 'string',
    })
    amount: Decimal;

    @ApiProperty({
        description: 'Optional notes about the income',
        example: 'Monthly salary',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        description: 'Category information',
        required: false,
    })
    category?: {
        id: number;
        name: string;
    };

    constructor(partial: Partial<UserIncomeEntity>) {
        Object.assign(this, partial);
    }
}

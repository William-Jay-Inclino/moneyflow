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
        description: 'Date when the income was received',
        example: '2025-07-11',
    })
    income_date: Date;

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
    amount: string; // Decimal is serialized as string

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

    constructor(partial: any) {
        Object.assign(this, partial);
        
        // Convert Decimal to string for amount field
        if (partial.amount) {
            // Check if it's a Decimal object (has toString method and is not a string)
            if (typeof partial.amount === 'object' && typeof partial.amount.toString === 'function') {
                this.amount = partial.amount.toString();
            } else if (typeof partial.amount === 'string') {
                this.amount = partial.amount;
            } else {
                this.amount = String(partial.amount);
            }
        }
    }
}

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
        description: 'Date when the expense occurred',
        example: '2025-07-11',
    })
    expense_date: Date;

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
    cost: string; // Decimal is serialized as string

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
        
        // Convert Decimal to string for cost field
        if (partial.cost) {
            // Check if it's a Decimal object (has toString method and is not a string)
            if (typeof partial.cost === 'object' && typeof partial.cost.toString === 'function') {
                this.cost = partial.cost.toString();
            } else if (typeof partial.cost === 'string') {
                this.cost = partial.cost;
            } else {
                this.cost = String(partial.cost);
            }
        }
    }
}

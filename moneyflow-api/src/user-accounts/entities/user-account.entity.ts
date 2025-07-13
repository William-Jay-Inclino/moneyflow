import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class UserAccountEntity {
    @ApiProperty({
        description: 'Unique identifier for the user account',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'User ID who owns this account',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    user_id: string;

    @ApiProperty({
        description: 'Account name',
        example: 'Chase Checking',
    })
    name: string;

    @ApiProperty({
        description: 'Account balance',
        example: '1250.50',
        type: 'string',
    })
    balance: string; // Decimal is serialized as string

    @ApiProperty({
        description: 'Account notes (supports markdown format)',
        example: '## Account Details\n\nThis is my primary savings account for emergency funds.',
        required: false,
    })
    notes?: string;

    @ApiProperty({
        description: 'Date and time when the account was created',
        example: '2025-07-12T10:30:00Z',
    })
    created_at: Date;

    @ApiProperty({
        description: 'Date and time when the account was last updated',
        example: '2025-07-12T10:30:00Z',
    })
    updated_at: Date;

    @ApiProperty({
        description: 'User information',
        required: false,
    })
    user?: {
        id: string;
        email: string;
    };

    constructor(partial: any) {
        Object.assign(this, partial);
        
        // Convert Decimal to string for balance field
        if (partial.balance) {
            // Check if it's a Decimal object (has toString method and is not a string)
            if (typeof partial.balance === 'object' && typeof partial.balance.toString === 'function') {
                this.balance = partial.balance.toString();
            } else if (typeof partial.balance === 'string') {
                this.balance = partial.balance;
            } else {
                this.balance = String(partial.balance);
            }
        }
    }
}

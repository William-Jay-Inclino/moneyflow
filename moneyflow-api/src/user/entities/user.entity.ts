import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserEntity {
    @ApiProperty({ description: 'User ID' })
    id: string;

    @ApiProperty({ description: 'User email address' })
    email: string;

    @ApiProperty({ description: 'Username' })
    username: string;

    @ApiProperty({ description: 'User active status' })
    is_active: boolean;

    @ApiProperty({ description: 'User registration date' })
    registered_at: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.username = user.username;
        this.is_active = user.is_active;
        this.registered_at = user.registered_at;
    }
}

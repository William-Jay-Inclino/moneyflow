import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

export class UserEntity {
    @ApiProperty({ description: 'User ID' })
    id: string;

    @ApiProperty({ description: 'User email address' })
    email: string;

    @Exclude()
    password: string;

    @ApiProperty({ description: 'User active status' })
    is_active: boolean;

    @ApiProperty({ description: 'Email verification status' })
    email_verified: boolean;

    @Exclude()
    email_verify_token: string | null;

    @ApiProperty({ description: 'User registration date' })
    registered_at: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.password = user.password;
        this.is_active = user.is_active;
        this.email_verified = user.email_verified;
        this.email_verify_token = user.email_verify_token;
        this.registered_at = user.registered_at;
    }
}

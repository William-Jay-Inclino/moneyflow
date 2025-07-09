import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({ description: 'User ID', example: 'uuid-string' })
    @IsUUID()
    user_id: string;

    @ApiProperty({ description: 'Email verification token', example: 'verification-token' })
    @IsString()
    token: string;
}

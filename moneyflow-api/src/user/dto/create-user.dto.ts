import { IsEmail, IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User password (minimum 6 characters)' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'User active status', default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiProperty({ description: 'Email verified status', default: false })
    @IsBoolean()
    @IsOptional()
    email_verified?: boolean;

    @ApiProperty({ description: 'Email verification token', required: false })
    @IsString()
    @IsOptional()
    email_verify_token?: string;
}

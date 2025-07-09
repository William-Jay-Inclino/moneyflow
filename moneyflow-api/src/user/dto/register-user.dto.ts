import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({ description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User password (minimum 6 characters)', example: 'password123' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'User active status', default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

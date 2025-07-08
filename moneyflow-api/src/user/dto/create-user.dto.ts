import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Username (auto-generated from email)' })
    @IsString()
    username: string;

    @ApiProperty({ description: 'User active status', default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

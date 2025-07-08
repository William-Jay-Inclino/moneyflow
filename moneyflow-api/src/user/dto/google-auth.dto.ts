import { IsEmail, IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
    @ApiProperty({ 
        description: 'User email from Google OAuth',
        example: 'user@example.com' 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ 
        description: 'Google ID from OAuth',
        example: '1234567890abcdef' 
    })
    @IsString()
    @IsNotEmpty()
    google_id: string;

    @ApiProperty({ 
        description: 'User display name from Google OAuth',
        example: 'John Doe' 
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ 
        description: 'User profile picture URL from Google (optional)',
        example: 'https://lh3.googleusercontent.com/a/profile-pic',
        required: false 
    })
    @IsUrl()
    @IsOptional()
    profile_picture?: string;

    @ApiProperty({ 
        description: 'Google ID token for additional verification (optional)',
        required: false 
    })
    @IsString()
    @IsOptional()
    id_token?: string;
}

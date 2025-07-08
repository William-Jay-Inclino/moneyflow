import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { GoogleAuthDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly user_service: UserService) {}

    @Post('register/google')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Register or login user with Google OAuth',
        description: 'Register a new user or return existing user using Google OAuth. Mobile-friendly endpoint that handles both registration and login scenarios.'
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully registered or logged in',
        type: UserEntity,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid Google OAuth data',
    })
    async register_with_google(@Body() google_auth_dto: GoogleAuthDto): Promise<UserEntity> {
        return this.user_service.register_with_google(google_auth_dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user profile by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        type: UserEntity,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async get_user_profile(@Param('id') id: string): Promise<UserEntity> {
        return this.user_service.get_user_profile(id);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Find user by email' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({
        status: 200,
        description: 'User found',
        type: UserEntity,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async find_by_email(@Param('email') email: string): Promise<UserEntity | null> {
        return this.user_service.find_by_email(email);
    }
}

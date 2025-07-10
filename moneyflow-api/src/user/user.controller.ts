import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { RegisterUserDto, LoginUserDto, VerifyEmailDto, ResendVerificationDto } from './dto';
import { Public } from '../auth/decorators';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly user_service: UserService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Register a new user',
        description: 'Register a new user with email and password. A verification email will be sent.'
    })
    @ApiBody({ type: RegisterUserDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully registered. Verification email sent.',
        type: UserEntity,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User with this email already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid registration data',
    })
    async register_user(@Body() register_user_dto: RegisterUserDto): Promise<UserEntity> {
        return this.user_service.register_user(register_user_dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Login user',
        description: 'Login user with email and password. Email must be verified.'
    })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged in',
        type: UserEntity,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials or email not verified',
    })
    async login_user(@Body() login_user_dto: LoginUserDto): Promise<UserEntity> {
        return this.user_service.login_user(login_user_dto);
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Verify user email',
        description: 'Verify user email with token received via email'
    })
    @ApiBody({ type: VerifyEmailDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email successfully verified',
        type: UserEntity,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid verification token or email already verified',
    })
    async verify_email(@Body() verify_email_dto: VerifyEmailDto): Promise<UserEntity> {
        return this.user_service.verify_email(verify_email_dto);
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Resend email verification',
        description: 'Resend verification email to user'
    })
    @ApiBody({ type: ResendVerificationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Verification email sent successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Verification email sent successfully' }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'User not found or email already verified',
    })
    async resend_verification(@Body() resend_verification_dto: ResendVerificationDto): Promise<{ message: string }> {
        return this.user_service.resend_verification(resend_verification_dto);
    }

    @Public()
    @Post('debug/verify-by-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Debug: Verify user email by email address (Development only)',
        description: 'Verify user email using email address and token. This is for development purposes only.'
    })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                token: { type: 'string', example: 'verification-token' }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email successfully verified',
        type: UserEntity,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid verification token or email already verified',
    })
    async debug_verify_by_email(@Body() body: { email: string; token: string }): Promise<UserEntity> {
        return this.user_service.debug_verify_by_email(body.email, body.token);
    }

    @Public()
    @Post('debug/test-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Debug: Test email configuration',
        description: 'Test if email service is properly configured and can send emails'
    })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'test@example.com' }
            }
        }
    })
    async test_email(@Body() body: { email: string }): Promise<{ message: string }> {
        return this.user_service.test_email_configuration(body.email);
    }

    // Protected endpoints below (require JWT authentication)
    
    @Get(':id')
    @ApiOperation({ summary: 'Get user profile by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile retrieved successfully',
        type: UserEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    async get_user_profile(@Param('id') id: string): Promise<UserEntity> {
        return this.user_service.get_user_profile(id);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Find user by email' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User found',
        type: UserEntity,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    async find_by_email(@Param('email') email: string): Promise<UserEntity | null> {
        return this.user_service.find_by_email(email);
    }
}

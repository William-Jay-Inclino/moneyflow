import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EmailService } from './email.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, RegisterUserDto, LoginUserDto, VerifyEmailDto, ResendVerificationDto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService
    ) {}

    private async hash_password(password: string): Promise<string> {
        const salt_rounds = 10;
        return bcrypt.hash(password, salt_rounds);
    }

    private async verify_password(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    private generate_verification_token(): string {
        // Generate a 5-digit random number
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    async register_user(register_user_dto: RegisterUserDto): Promise<UserEntity> {
        const { email, password, is_active = true } = register_user_dto;

        try {
            // Check if user already exists
            const existing_user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (existing_user) {
                throw new ConflictException('User with this email already exists');
            }

            // Hash password
            const hashed_password = await this.hash_password(password);
            
            // Generate verification token
            const email_verify_token = this.generate_verification_token();

            // Create new user
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashed_password,
                    is_active,
                    email_verified: false,
                    email_verify_token,
                },
            });

            // TODO: Send verification email here
            console.log(`Email verification token for ${email}: ${email_verify_token}`);
            
            // Send verification email
            try {
                await this.emailService.sendEmailVerification(email, email_verify_token);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Note: We don't throw here because user is created successfully
                // They can always request a resend
            }

            // Create default user categories
            await this.create_default_user_categories(user.id);

            return new UserEntity(user);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to register user');
        }
    }

    async login_user(login_user_dto: LoginUserDto): Promise<UserEntity> {
        const { email, password } = login_user_dto;

        try {
            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Verify password
            const is_password_valid = await this.verify_password(password, user.password);
            if (!is_password_valid) {
                throw new UnauthorizedException('Invalid email or password');
            }

            // Check if user is active
            if (!user.is_active) {
                throw new UnauthorizedException('Account is disabled');
            }

            // Check if email is verified
            if (!user.email_verified) {
                throw new UnauthorizedException('Please verify your email address before logging in');
            }

            return new UserEntity(user);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Failed to login user');
        }
    }

    async verify_email(verify_email_dto: VerifyEmailDto): Promise<UserEntity> {
        const { user_id, token } = verify_email_dto;

        try {
            // Find user by ID and token
            const user = await this.prisma.user.findFirst({
                where: {
                    id: user_id,
                    email_verify_token: token,
                },
            });

            if (!user) {
                throw new BadRequestException('Invalid verification token');
            }

            if (user.email_verified) {
                throw new BadRequestException('Email is already verified');
            }

            // Update user as verified
            const updated_user = await this.prisma.user.update({
                where: { id: user_id },
                data: {
                    email_verified: true,
                    email_verify_token: null,
                },
            });

            return new UserEntity(updated_user);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to verify email');
        }
    }

    async resend_verification(resend_verification_dto: ResendVerificationDto): Promise<{ message: string }> {
        const { email } = resend_verification_dto;

        try {
            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new BadRequestException('User not found');
            }

            if (user.email_verified) {
                throw new BadRequestException('Email is already verified');
            }

            // Generate new verification token
            const email_verify_token = this.generate_verification_token();

            // Update user with new token
            await this.prisma.user.update({
                where: { id: user.id },
                data: { email_verify_token },
            });

            // TODO: Send verification email here
            console.log(`New email verification token for ${email}: ${email_verify_token}`);
            
            // Send verification email
            try {
                await this.emailService.sendEmailVerification(email, email_verify_token);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Continue anyway - user can try again
            }

            return { message: 'Verification email sent successfully' };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to resend verification email');
        }
    }

    async find_by_email(email: string): Promise<UserEntity | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            return user ? new UserEntity(user) : null;
        } catch (error) {
            throw new BadRequestException('Failed to find user by email');
        }
    }

    async find_by_id(id: string): Promise<UserEntity | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            return user ? new UserEntity(user) : null;
        } catch (error) {
            throw new BadRequestException('Failed to find user by ID');
        }
    }

    async debug_verify_by_email(email: string, token: string): Promise<UserEntity> {
        try {
            // Find user by email and token
            const user = await this.prisma.user.findFirst({
                where: {
                    email: email,
                    email_verify_token: token,
                },
            });

            if (!user) {
                throw new BadRequestException('Invalid verification token or email not found');
            }

            if (user.email_verified) {
                throw new BadRequestException('Email is already verified');
            }

            // Update user as verified
            const updated_user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email_verified: true,
                    email_verify_token: null,
                },
            });

            return new UserEntity(updated_user);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to verify email');
        }
    }

    async get_user_profile(user_id: string): Promise<UserEntity> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: user_id },
            });

            if (!user) {
                throw new BadRequestException('User not found');
            }

            return new UserEntity(user);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to get user profile');
        }
    }

    async update_user_active_status(user_id: string, is_active: boolean): Promise<UserEntity> {
        try {
            const user = await this.prisma.user.update({
                where: { id: user_id },
                data: { is_active },
            });

            return new UserEntity(user);
        } catch (error) {
            throw new BadRequestException('Failed to update user active status');
        }
    }

    async test_email_configuration(email: string): Promise<{ message: string }> {
        try {
            console.log('🧪 Testing email configuration...');
            console.log('📧 SYSTEM_EMAIL:', this.emailService['configService'].get('SYSTEM_EMAIL'));
            console.log('🔑 SYSTEM_PASS length:', this.emailService['configService'].get('SYSTEM_PASS')?.length || 0);
            
            // Test sending a simple email
            await this.emailService.sendEmailVerification(email, '12345');
            
            return { message: 'Email test successful! Check your inbox.' };
        } catch (error) {
            console.error('❌ Email test failed:', error);
            throw new BadRequestException(`Email configuration test failed: ${error.message}`);
        }
    }

    async debug_get_user_categories(user_id: string): Promise<{ user_id: string; category_count: number; categories: any[] }> {
        try {
            const userCategories = await this.prisma.userCategory.findMany({
                where: { user_id },
                include: {
                    category: true
                }
            });

            return {
                user_id,
                category_count: userCategories.length,
                categories: userCategories.map(uc => ({
                    id: uc.id,
                    category_id: uc.category_id,
                    category_name: uc.category?.name,
                    category_type: uc.category?.type,
                    is_default: uc.category?.is_default
                }))
            };
        } catch (error) {
            throw new BadRequestException('Failed to get user categories');
        }
    }

    private async create_default_user_categories(user_id: string): Promise<void> {
        console.log(`🔍 Starting default category creation for user: ${user_id}`);
        
        try {
            // Get all default categories
            const default_categories = await this.prisma.category.findMany({
                where: {
                    is_default: true
                }
            });

            console.log(`📊 Found ${default_categories.length} default categories in database`);

            if (default_categories.length === 0) {
                console.warn('⚠️ No default categories found in database! Categories may not be seeded.');
                return;
            }

            // Create user categories from default categories
            let created_count = 0;
            for (const default_category of default_categories) {
                try {
                    await this.prisma.userCategory.create({
                        data: {
                            user_id,
                            category_id: default_category.id,
                        },
                    });
                    created_count++;
                    console.log(`✅ Created user category: ${default_category.name} (${default_category.type})`);
                } catch (categoryError) {
                    console.error(`❌ Failed to create user category for ${default_category.name}:`, categoryError);
                }
            }

            console.log(`✅ Successfully created ${created_count}/${default_categories.length} default categories for user ${user_id}`);
        } catch (error) {
            console.error('❌ Error in create_default_user_categories:', error);
            console.error('❌ Error stack:', error.stack);
            // We don't throw here because user creation should not fail if default categories fail
            // This can be handled separately or retried later
        }
    }

    async debug_categories_status(): Promise<{ total_categories: number; default_categories: number; sample_defaults: any[] }> {
        try {
            const totalCategories = await this.prisma.category.count();
            const defaultCategories = await this.prisma.category.findMany({
                where: { is_default: true },
                take: 5 // Just get a sample
            });

            return {
                total_categories: totalCategories,
                default_categories: defaultCategories.length,
                sample_defaults: defaultCategories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    type: cat.type,
                    is_default: cat.is_default
                }))
            };
        } catch (error) {
            throw new BadRequestException('Failed to check categories status');
        }
    }
}

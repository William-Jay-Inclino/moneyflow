import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, GoogleAuthDto } from './dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    private generate_username_from_email(email: string): string {
        // Extract the part before @ and replace non-alphanumeric characters with underscores
        const base_username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        
        // Add timestamp to ensure uniqueness
        const timestamp = Date.now().toString().slice(-6);
        
        return `${base_username}_${timestamp}`;
    }

    async register_with_google(google_auth_dto: GoogleAuthDto): Promise<UserEntity> {
        const { email, google_id, name, profile_picture, id_token } = google_auth_dto;

        try {
            // Check if user already exists
            const existing_user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (existing_user) {
                // Return existing user for mobile apps (no error)
                return new UserEntity(existing_user);
            }

            // Generate username from email
            const username = this.generate_username_from_email(email);

            // Ensure username is unique
            let final_username = username;
            let counter = 1;
            while (await this.prisma.user.findUnique({ where: { username: final_username } })) {
                final_username = `${username}_${counter}`;
                counter++;
            }

            // Create new user
            const user = await this.prisma.user.create({
                data: {
                    email,
                    username: final_username,
                    is_active: true,
                },
            });

            return new UserEntity(user);
        } catch (error) {
            throw new BadRequestException('Failed to register user with Google');
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
}

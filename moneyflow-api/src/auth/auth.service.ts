import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../user/email.service';
import { LoginDto, RegisterDto, AuthResponseDto, VerificationResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        email_verify_token: verificationCode,
        email_verified: false,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationCode);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: undefined,
        isEmailVerified: user.email_verified,
        createdAt: user.registered_at,
        updatedAt: user.registered_at,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: undefined,
        isEmailVerified: user.email_verified,
        createdAt: user.registered_at,
        updatedAt: user.registered_at,
      },
    };
  }

  async verifyEmail(email: string, code: string): Promise<VerificationResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    if (user.email_verify_token !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Update user to mark email as verified
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verify_token: null,
      },
    });

    return {
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isEmailVerified: updatedUser.email_verified,
        createdAt: updatedUser.registered_at,
        updatedAt: updatedUser.registered_at,
      },
    };
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification code
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email_verify_token: verificationCode,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationCode);

    return {
      message: 'Verification code sent successfully',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        email_verified: true,
        registered_at: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      isEmailVerified: user.email_verified,
      createdAt: user.registered_at,
      updatedAt: user.registered_at,
    } as Partial<User>;
  }
}

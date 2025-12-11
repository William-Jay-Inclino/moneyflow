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
    console.log('🔔 [AuthService] Register called with:', registerDto);
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    console.log('🔍 [AuthService] Existing user lookup result:', existingUser);

    if (existingUser) {
      console.log('❌ [AuthService] User already exists:', email);
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔑 [AuthService] Hashed password for', email);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 Generated verification code for ${email}: ${verificationCode}`);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        email_verify_token: verificationCode,
        email_verified: false,
      },
    });
    console.log('✅ [AuthService] User created:', user);

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationCode);
    console.log('✉️ [AuthService] Verification email sent to:', email);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    console.log('🔒 [AuthService] JWT token generated for:', email);

    const result = {
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
    console.log('✅ [AuthService] Register result:', result);
    return result;
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
    console.log(`🔍 Verifying email for: ${email} with code: ${code}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      throw new BadRequestException('User not found');
    }

    console.log(`🔍 User found: ${user.email}, stored token: ${user.email_verify_token}, verified: ${user.email_verified}`);

    if (user.email_verified) {
      console.log(`❌ Email already verified for: ${email}`);
      throw new BadRequestException('Email is already verified');
    }

    if (user.email_verify_token !== code) {
      console.log(`❌ Invalid verification code for ${email}. Expected: ${user.email_verify_token}, Received: ${code}`);
      throw new BadRequestException('Invalid verification code');
    }

    console.log(`✅ Verification code matches for: ${email}`);

    // Update user to mark email as verified
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verify_token: null,
      },
    });

    console.log(`✅ Email verified successfully for: ${email}`);

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

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    console.log('🔔 [AuthService] changePassword called for userId:', userId);

    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    console.log('🔍 [AuthService] User lookup result:', user);

    if (!user) {
      console.log('❌ [AuthService] User not found for changePassword:', userId);
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    console.log('🔍 [AuthService] Old password valid:', isOldPasswordValid);

    if (!isOldPasswordValid) {
      console.log('❌ [AuthService] Old password is incorrect for userId:', userId);
      return { success: false, message: 'Invalid old password' };
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('🔑 [AuthService] Hashed new password for userId:', userId);

    // Update password in User model
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    console.log('✅ [AuthService] Password updated successfully for userId:', userId);

    return { success: true, message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    console.log('🔔 [AuthService] forgotPassword called for email:', email);

    const normalizedEmail = email.trim().toLowerCase();

    const users = await this.prisma.user.findMany({
      select: {
        email: true
      }
    });

    console.log('🔍 [AuthService] Users found:', users);

    // Find user by normalized email
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    console.log('🔍 [AuthService] User lookup result:', user);

    if (!user) {
      console.log('❌ [AuthService] User not found for forgotPassword:', normalizedEmail);
      return { success: false, message: 'User not found' };
    }

    // Generate temporary password (6-digit pin)
    const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 [AuthService] Generated temporary password:', tempPassword);

    // Hash temporary password
    const saltRounds = 12;
    const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Update user's password to temporary password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedTempPassword,
      },
    });

    // Send temporary password via email
    await this.emailService.sendForgotPasswordEmail(email, tempPassword);

    console.log('✉️ [AuthService] Temporary password sent to:', email);

    return { success: true, message: 'Temporary password sent to your email' };
  }

  async getUserIdByEmail(email: string): Promise<{ userId: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return { userId: user.id };
  }

}

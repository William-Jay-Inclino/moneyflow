import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('SYSTEM_EMAIL'),
                pass: this.configService.get<string>('SYSTEM_PASS'),
            },
        });
    }

    async sendEmailVerification(email: string, token: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('SYSTEM_EMAIL'),
            to: email,
            subject: 'Verify Your MoneyFlow Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">Welcome to MoneyFlow!</h2>
                    <p>Thank you for registering with MoneyFlow. To complete your registration, please verify your email address using the MoneyFlow mobile app.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-weight: bold;">Your Verification Code:</p>
                        <p style="font-size: 36px; font-family: monospace; background-color: white; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 0; color: #3b82f6; font-weight: bold;">
                            ${token}
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Enter this 5-digit code in the app</p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        If you didn't create this account, you can safely ignore this email.<br>
                        This verification code will expire after some time for security reasons.
                    </p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Verification email sent to ${email}`);
        } catch (error) {
            console.error(`❌ Failed to send email to ${email}:`, error);
            throw new Error('Failed to send verification email');
        }
    }

    async sendPasswordReset(email: string, token: string): Promise<void> {
        const resetLink = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: this.configService.get<string>('SYSTEM_EMAIL'),
            to: email,
            subject: 'Reset Your MoneyFlow Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">Password Reset Request</h2>
                    <p>You requested to reset your password for your MoneyFlow account. Click the button below to reset your password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${resetLink}</p>
                    
                    <p>This link will expire in 1 hour for security reasons.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        If you didn't request this password reset, you can safely ignore this email.
                    </p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to ${email}`);
        } catch (error) {
            console.error(`❌ Failed to send password reset email to ${email}:`, error);
            throw new Error('Failed to send password reset email');
        }
    }
}

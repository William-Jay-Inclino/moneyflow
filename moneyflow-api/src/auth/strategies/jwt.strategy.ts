import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
    sub: string; // user id
    email: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
        });
    }

    async validate(payload: JwtPayload) {
        const { sub: userId, email } = payload;

        // Find user in database
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                is_active: true,
                email_verified: true,
                registered_at: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('User account is disabled');
        }

        if (!user.email_verified) {
            throw new UnauthorizedException('Please verify your email address');
        }

        // Return user object that will be attached to request
        return {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            email_verified: user.email_verified,
            registered_at: user.registered_at,
        };
    }
}

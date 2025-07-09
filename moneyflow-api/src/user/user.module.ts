import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [UserController],
    providers: [UserService, EmailService],
    exports: [UserService, EmailService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { UserExpenseModule } from './user-expense';
import { UserIncomeModule } from './user-income';
import { UserCategoryModule } from './user-category';
import { UserModule } from './user';
import { AuthModule, JwtAuthGuard } from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule, 
    UserExpenseModule, 
    UserIncomeModule, 
    UserCategoryModule, 
    UserModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

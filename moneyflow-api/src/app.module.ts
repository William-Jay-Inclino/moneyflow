import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { UserExpenseModule } from './user-expense';
import { UserIncomeModule } from './user-income';
import { CategoryModule } from './category';
import { UserModule } from './user';
import { AuthModule, JwtAuthGuard } from './auth';
import { CashFlowModule } from './cash-flow';
import { UserAccountsModule } from './user-accounts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule, 
    CategoryModule,
    UserExpenseModule, 
    UserIncomeModule, 
    UserModule,
    CashFlowModule,
    UserAccountsModule,
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

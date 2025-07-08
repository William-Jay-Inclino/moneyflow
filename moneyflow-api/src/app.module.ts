import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { UserExpenseModule } from './user-expense';
import { UserIncomeModule } from './user-income';
import { UserCategoryModule } from './user-category';
import { UserModule } from './user';

@Module({
  imports: [PrismaModule, UserExpenseModule, UserIncomeModule, UserCategoryModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

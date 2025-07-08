import { Module } from '@nestjs/common';
import { UserIncomeService } from './user-income.service';
import { UserIncomeController } from './user-income.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UserIncomeController],
    providers: [UserIncomeService],
    exports: [UserIncomeService],
})
export class UserIncomeModule {}

import { Module } from '@nestjs/common';
import { UserExpenseService } from './user-expense.service';
import { UserExpenseController } from './user-expense.controller';

@Module({
    controllers: [UserExpenseController],
    providers: [UserExpenseService],
    exports: [UserExpenseService],
})
export class UserExpenseModule {}

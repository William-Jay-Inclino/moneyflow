import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CashFlowController } from './cash-flow.controller';
import { CashFlowService } from './cash-flow.service';

@Module({
    imports: [PrismaModule],
    controllers: [CashFlowController],
    providers: [CashFlowService],
    exports: [CashFlowService],
})
export class CashFlowModule {}

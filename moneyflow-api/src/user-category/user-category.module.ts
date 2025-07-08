import { Module } from '@nestjs/common';
import { UserCategoryService } from './user-category.service';
import { UserCategoryController } from './user-category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UserCategoryController],
    providers: [UserCategoryService],
    exports: [UserCategoryService],
})
export class UserCategoryModule {}

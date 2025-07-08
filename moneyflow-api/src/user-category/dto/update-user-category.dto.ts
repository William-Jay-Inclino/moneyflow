import { PartialType } from '@nestjs/swagger';
import { CreateUserCategoryDto } from './create-user-category.dto';

export class UpdateUserCategoryDto extends PartialType(CreateUserCategoryDto) {}

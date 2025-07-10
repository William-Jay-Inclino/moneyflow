import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateUserCategoryDto {
    @ApiProperty({
        description: 'Category ID to reference from the categories table',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    category_id: number;
}

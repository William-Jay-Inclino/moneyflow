import { IsString, IsNotEmpty, IsDecimal, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  balance?: number;
}

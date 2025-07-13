import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'Chase Checking Account',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Initial account balance',
    example: 1000.50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  @ApiProperty({
    description: 'Account notes (supports markdown format)',
    example: '## Account Details\n\nThis is my primary checking account for daily expenses.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

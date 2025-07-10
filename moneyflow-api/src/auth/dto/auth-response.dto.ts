import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    name?: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class VerificationResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User information after verification',
  })
  user: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt } from 'class-validator';

export class VerifyCodeDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 123456 })
  @IsInt()
  code: number;
}
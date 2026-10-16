import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ description: 'Email користувача' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Код підтвердження' })
  @IsInt()
  code: number;
}

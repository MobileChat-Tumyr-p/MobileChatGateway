import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegDto {
  @ApiProperty({ description: 'Ім\'я користувача' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Пошта користувача' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
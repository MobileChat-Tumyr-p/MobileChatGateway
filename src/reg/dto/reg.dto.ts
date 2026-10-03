import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { NickDto } from '../../auth/dto/nick.dto.js';

export class RegDto extends NickDto {
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
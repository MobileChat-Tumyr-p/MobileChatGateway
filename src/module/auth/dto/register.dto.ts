import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: "Ім'я користувача" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Нікнейм' })
  @IsString()
  @IsNotEmpty()
  nick: string;

  @ApiProperty({ description: 'Пошта' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

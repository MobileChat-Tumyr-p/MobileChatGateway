import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SingInDto {
  @ApiProperty({ description: 'Ім\'я користувача' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
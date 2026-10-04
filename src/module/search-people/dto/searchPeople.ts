import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchPeopleDTO {
  @ApiProperty({ description: 'Частина юзернейму для пошуку' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  nick: string;
}
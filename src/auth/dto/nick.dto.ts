import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { NICK_PATTERN, normalizeNick } from '../../common/nick.js';

export class NickDto {
  @ApiProperty({ description: 'Нік користувача', example: 'andriy_k' })
  @Transform(({ value }) => normalizeNick(value))
  @IsString()
  @IsNotEmpty()
  @Matches(NICK_PATTERN, {
    message:
      'Нік має містити 3–32 символи: латинські літери, цифри та підкреслення',
  })
  nick: string;
}

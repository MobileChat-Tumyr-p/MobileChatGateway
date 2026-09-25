import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { SingInDto } from './dto/sing-in.dto.js';
import { SingInService } from './sing-in.service.js';

@ApiTags('sing-in')
@Controller('/sing-in')
export class SingInController {
  constructor(private readonly singInService: SingInService) {}

  @Post()
  signIn(@Body() dto: SingInDto) {
    return this.singInService.signIn(dto);
  }
}
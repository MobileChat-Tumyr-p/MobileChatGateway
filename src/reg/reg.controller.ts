import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { RegDto } from './dto/reg.dto.js';
import { RegService } from './reg.service.js';

@ApiTags('reg')
@Controller('reg')
export class RegController {
  constructor(private readonly regService: RegService) {}

  @Post()
  register(@Body() dto: RegDto) {
    return this.regService.register(dto);
  }
}
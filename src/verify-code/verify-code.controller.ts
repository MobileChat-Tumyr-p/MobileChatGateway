import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { VerifyCodeDTO } from './dto/verify-code.dto.js';
import { VerifyCodeService } from './verify-code.service.js';

@ApiTags('verify-code')
@Controller('/verify-code')
export class VerifyCodeController {
  constructor(private readonly verifyCodeService: VerifyCodeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  public verify(@Body() dto: VerifyCodeDTO) {
    return this.verifyCodeService.verify(dto);
  }
}
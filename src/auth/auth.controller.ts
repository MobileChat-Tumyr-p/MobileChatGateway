import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service.js';
import { NickDto } from './dto/nick.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

type AuthedRequest = Request & { user: { id: number } };

@ApiTags('auth')
@Controller('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  me(@Req() request: AuthedRequest) {
    return request.user;
  }

  @Patch('nick')
  updateNick(@Req() request: AuthedRequest, @Body() dto: NickDto) {
    return this.auth.updateNick(request.user.id, dto.nick);
  }
}

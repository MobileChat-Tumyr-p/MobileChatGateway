import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('auth')
@Controller('me')
export class AuthController {
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@Req() request: Request & { user: Record<string, unknown> }) {
    return request.user;
  }
}

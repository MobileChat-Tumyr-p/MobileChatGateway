import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../../common/auth.guard.js';
import { PresenceService } from './presence.service.js';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  // GET /users/:id/presence
  @Get(':id/presence')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.presence.getPresence(id);
  }
}

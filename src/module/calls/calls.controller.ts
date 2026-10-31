import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthGuard } from '../../common/auth.guard.js';
import { CallsService } from './calls.service.js';
import { StartCallDto } from './dto/start-call.dto.js';

type AuthenticatedRequest = Request & { user: { id: number } };

@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @UseGuards(AuthGuard)
  @Get('active')
  public async getActive(@Req() request: AuthenticatedRequest) {
    const calls = await this.callsService.listActive(request.user.id);

    return { calls };
  }

  @UseGuards(AuthGuard)
  @Post()
  public async startCall(
    @Body() body: StartCallDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.callsService.start(
      request.user.id,
      body.calleeId,
      body.chatId ?? null,
    );
  }

  @UseGuards(AuthGuard)
  @Post(':id/accept')
  public async acceptCall(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.callsService.accept(id, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/reject')
  public async rejectCall(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.callsService.reject(id, request.user.id);

    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Post(':id/cancel')
  public async cancelCall(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.callsService.cancel(id, request.user.id);

    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Post(':id/end')
  public async endCall(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.callsService.hangUp(id, request.user.id);

    return { ok: true };
  }
}

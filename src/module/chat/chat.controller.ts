import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { ChatClientGRCP } from './chat.grcp.js';
import { AuthGuard } from '../../common/auth.guard.js';

type AuthenticatedRequest = Request & { user: { id: number } };

type CreateChatBody = {
  title?: string;
  memberIds?: number[];
};

@Controller('chats')
export class ChatController {
  constructor(private readonly chatClient: ChatClientGRCP) {}

  @UseGuards(AuthGuard)
  @Get()
  public async getChats(@Req() request: AuthenticatedRequest) {
    const result = await this.chatClient.getChat(request.user.id);

    return result.list;
  }

  @UseGuards(AuthGuard)
  @Post()
  public async createChat(
    @Body() body: CreateChatBody,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatClient.createChat(
      request.user.id,
      body.title ?? '',
      body.memberIds ?? [],
    );
  }
}

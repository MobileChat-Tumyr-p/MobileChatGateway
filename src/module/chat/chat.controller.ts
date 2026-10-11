import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { ChatClientGRCP } from './chat.grcp.js';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatClient: ChatClientGRCP) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getChats(@Headers('authorization') authorization?: string) {
    return this.chatClient.getChat(authorization);
  }
}

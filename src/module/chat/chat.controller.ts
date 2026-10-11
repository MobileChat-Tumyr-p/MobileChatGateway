import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ChatClientGRCP } from './chat.grcp.js';
import { AuthGuard } from '../../common/auth.guard.js';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatClient: ChatClientGRCP) {}

  @UseGuards(AuthGuard)
  @Get()
  public async getChats(@Headers('authorization') authorization?: string) {
    return this.chatClient.getChat(authorization);
  }
}

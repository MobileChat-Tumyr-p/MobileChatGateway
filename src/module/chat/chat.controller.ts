import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ChatClientGRCP } from './chat.grcp.js';
import { AuthGuard } from '../../common/auth.guard.js';
import { ChatGateway } from './chat.gateway.js';
import { AuthClientGrpc } from '../auth/auth.grpc.js';

type AuthenticatedRequest = Request & { user: { id: number } };

type CreateChatBody = {
  title?: string;
  memberIds?: number[];
};

type DirectChatBody = {
  peerId?: number;
};

type SendMessageBody = {
  text?: string;
};

type ChatPreview = {
  id: number;
  title: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  members: number;
  memberIds?: number[];
  isDirect?: boolean;
};

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatClient: ChatClientGRCP,
    private readonly chatGateway: ChatGateway,
    private readonly authClient: AuthClientGrpc,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  public async getChats(@Req() request: AuthenticatedRequest) {
    const result = await this.chatClient.getChat(request.user.id);

    const chats = (result.list ?? []) as ChatPreview[];
    const peerIds = new Set<number>();

    for (const chat of chats) {
      const peerId = chat.memberIds?.find((memberId) => memberId !== request.user.id);

      if (chat.isDirect && peerId !== undefined) {
        peerIds.add(peerId);
      }
    }

    const previews = new Map<number, { nick: string | null; name: string }>();

    await Promise.all(
      [...peerIds].map(async (peerId) => {
        try {
          const user = await this.authClient.getUserById(peerId);

          previews.set(peerId, { nick: user.nick ?? null, name: user.name ?? '' });
        } catch {
          previews.set(peerId, { nick: null, name: '' });
        }
      }),
    );

    return chats.map((chat) => {
      const peerId = chat.memberIds?.find((memberId) => memberId !== request.user.id);
      const preview = peerId !== undefined ? previews.get(peerId) : undefined;

      return {
        ...chat,
        peerNick: chat.isDirect ? preview?.nick ?? null : null,
        peerName: chat.isDirect ? preview?.name ?? '' : '',
      };
    });
  }

  @UseGuards(AuthGuard)
  @Post('direct')
  public async openDirectChat(
    @Body() body: DirectChatBody,
    @Req() request: AuthenticatedRequest,
  ) {
    const peerId = Number(body.peerId);

    if (!Number.isFinite(peerId) || peerId <= 0) {
      throw new BadRequestException('Потрібен peerId');
    }

    const result = await this.chatClient.ensureDirectChat(request.user.id, peerId);

    return { chatId: result.chatId };
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

  @UseGuards(AuthGuard)
  @Post(':id/messages')
  public async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SendMessageBody,
    @Req() request: AuthenticatedRequest,
  ) {
    const message = await this.chatClient.sendMessage(
      id,
      request.user.id,
      body.text ?? '',
    );

    this.chatGateway.broadcastToChat(id, 'chat:message', message);

    return message;
  }

  @UseGuards(AuthGuard)
  @Get(':id/members')
  public async getMembers(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatClient.getChatMembers(id, request.user.id);

    const members = await Promise.all(
      (result.members ?? []).map(async (member) => {
        try {
          const user = await this.authClient.getUserById(member.userId);

          return { ...member, nick: user.nick ?? null, name: user.name ?? '' };
        } catch {
          return { ...member, nick: null, name: '' };
        }
      }),
    );

    return { members };
  }

  @UseGuards(AuthGuard)
  @Get(':id/messages')
  public async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limitQuery: string | undefined,
    @Query('offset') offsetQuery: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    const limit = Number(limitQuery ?? 0);
    const offset = Number(offsetQuery ?? 0);

    return this.chatClient.getMessages(
      id,
      request.user.id,
      Number.isFinite(limit) ? limit : 0,
      Number.isFinite(offset) ? offset : 0,
    );
  }
}

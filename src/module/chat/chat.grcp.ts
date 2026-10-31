import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { getChatListServiceClient, getChatMembersServiceClient, directChatServiceClient } from '@tumy/mobile-chat-grpc/gen/chat.js';
import type {
  ChatMembers,
  GetChatMembersRequest,
  DirectChatRequest,
  DirectChatResponse,
} from '@tumy/mobile-chat-grpc/gen/chat.js';
import {
  createChatClient,
  type CreateChatResponse,
} from '@tumy/mobile-chat-grpc/gen/createChat.js';
import {
  getMessagesClient,
  sendMessageClient,
  type MessageList,
  type MessageResponse,
} from '@tumy/mobile-chat-grpc/gen/messages.js';
import type { GetMessagesRequest } from '@tumy/mobile-chat-grpc/gen/messages.js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatClientGRCP implements OnModuleInit {
  private chatService: getChatListServiceClient;
  private createChatService: createChatClient;
  private sendMessageService: sendMessageClient;
  private getMessagesService: getMessagesClient;
  private getChatMembersService: getChatMembersServiceClient;
  private directChatService: directChatServiceClient;

  public constructor(
    @Inject('CHAT_PACKAGE') private readonly client: ClientGrpc,
    @Inject('CREATE_CHAT_PACKAGE') private readonly createClient: ClientGrpc,
  ) {}

  public onModuleInit() {
    this.chatService = this.client.getService<getChatListServiceClient>(
      'getChatListService',
    );
    this.createChatService =
      this.createClient.getService<createChatClient>('createChat');
    this.sendMessageService =
      this.client.getService<sendMessageClient>('sendMessage');
    this.getMessagesService =
      this.client.getService<getMessagesClient>('getMessages');
    this.getChatMembersService =
      this.client.getService<getChatMembersServiceClient>('getChatMembersService');
    this.directChatService =
      this.client.getService<directChatServiceClient>('directChatService');
  }

  public getChat(userId: number) {
    return firstValueFrom(this.chatService.getChat({ userId }));
  }

  public sendMessage(
    chatId: number,
    authorId: number,
    text: string,
  ): Promise<MessageResponse> {
    return firstValueFrom(
      this.sendMessageService.send({ chatId, authorId, text }),
    );
  }

  public getMessages(
    chatId: number,
    userId: number,
    limit = 0,
    offset = 0,
  ): Promise<MessageList> {
    const request = { chatId, userId, limit, offset } as GetMessagesRequest;

    return firstValueFrom(this.getMessagesService.get(request));
  }

  public getChatMembers(chatId: number, userId: number): Promise<ChatMembers> {
    const request = { chatId, userId } as GetChatMembersRequest;

    return firstValueFrom(this.getChatMembersService.getChatMembers(request));
  }

  public ensureDirectChat(userId: number, peerId: number): Promise<DirectChatResponse> {
    const request = { userId, peerId } as DirectChatRequest;

    return firstValueFrom(this.directChatService.ensureDirectChat(request));
  }

  public createChat(
    ownerId: number,
    title: string,
    memberIds: number[] = [],
  ): Promise<CreateChatResponse> {
    return firstValueFrom(
      this.createChatService.create({ ownerId, title, memberIds }),
    );
  }
}

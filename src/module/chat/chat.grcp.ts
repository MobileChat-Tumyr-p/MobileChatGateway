import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { getChatListServiceClient } from '@tumy/mobile-chat-grpc/gen/chat.js';
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
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatClientGRCP implements OnModuleInit {
  private chatService: getChatListServiceClient;
  private createChatService: createChatClient;
  private sendMessageService: sendMessageClient;
  private getMessagesService: getMessagesClient;

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

  public getMessages(chatId: number, userId: number): Promise<MessageList> {
    return firstValueFrom(this.getMessagesService.get({ chatId, userId }));
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

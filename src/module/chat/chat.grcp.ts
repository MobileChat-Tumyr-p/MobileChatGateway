import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { getChatListServiceClient } from '@tumy/mobile-chat-grpc/gen/chat.js';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class ChatClientGRCP {
  private chatService: getChatListServiceClient;

  public constructor(
    @Inject('CHAT_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  public onModuleInit() {
    this.chatService = this.client.getService<getChatListServiceClient>(
      'getChatListService',
    );
  }

  public getChat(token?: string) {
    const metadata = new Metadata();
    if (token) {
      metadata.set('authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
    }
    return firstValueFrom(this.chatService.getChat({}));
  }
}


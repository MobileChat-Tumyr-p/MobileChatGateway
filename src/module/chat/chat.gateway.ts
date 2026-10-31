import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { AuthClientGrpc } from '../auth/auth.grpc.js';
import { ChatClientGRCP } from './chat.grcp.js';

type ClientWithUser = Socket & { data: { userId?: number } };

type HandshakeAuth = { token?: string };

/**
 * WS-шар реалтайму чата (namespace /chat).
 * З'єднання авторизується JWT у handshake.auth.token (такий самий
 * підхід, як у CallsGateway). Після з'єднання сокет уводиться в
 * кімнати всіх чатів користувача, тому broadcastToChat() сягає
 * лише учасників через серверний список чатів, а не клієнтські дані.
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: ['http://localhost:8080'] },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  public server: Server | undefined;

  constructor(
    private readonly authClient: AuthClientGrpc,
    private readonly chatClient: ChatClientGRCP,
  ) {}

  /**
   * Розсилка події всім сокетам у кімнаті конкретного чата
   * (chat:message тощо). Безпечна: кімнати формуються на сервері.
   */
  public broadcastToChat(chatId: number, event: string, payload: unknown): void {
    this.server?.to(`chat:${chatId}`).emit(event, payload);
  }

  public async handleConnection(client: ClientWithUser): Promise<void> {
    const auth = client.handshake.auth as HandshakeAuth | undefined;
    const token = auth?.token;

    if (!token) {
      this.logger.warn('WS chat: підключення без токена — відхиляю');
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.authClient.me({ accessToken: token });
      const userId = Number(user.id);

      if (!Number.isFinite(userId)) {
        throw new Error(`неочікуваний ідентифікатор користувача: ${JSON.stringify(user)}`);
      }

      client.data.userId = userId;

      const chats = await this.chatClient.getChat(userId);
      const rooms = chats.list.map((chat) => `chat:${chat.id}`);

      if (rooms.length > 0) {
        client.join(rooms);
      }

      client.emit('chat:connected', { userId });
    } catch (err) {
      this.logger.warn(`WS chat: автентифікація не пройшла — відхиляю: ${String(err)}`);
      client.disconnect(true);
    }
  }

  public handleDisconnect(client: ClientWithUser): void {
    this.logger.debug(`WS chat: сокет від'єднався (${client.id})`);
  }
}

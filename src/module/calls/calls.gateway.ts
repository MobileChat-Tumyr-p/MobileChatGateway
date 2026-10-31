import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { AuthClientGrpc } from '../auth/auth.grpc.js';

type ClientWithUser = Socket & { data: { userId?: number } };

type HandshakeAuth = { token?: string };

/**
 * WS-шар сигналінгу дзвінків.
 * З'єднання завжди авторизується JWT у handshake.auth.token.
 * Онлайн-клієнти: Map<userId, Set<socketId>>.
 */
@WebSocketGateway({
  cors: { origin: ['http://localhost:8080'] },
  transports: ['websocket', 'polling'],
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CallsGateway.name);
  private readonly online = new Map<number, Set<string>>();

  @WebSocketServer()
  public server: Server | undefined;

  constructor(private readonly authClient: AuthClientGrpc) { }

  public isOnline(userId: number): boolean {
    const sockets = this.online.get(userId);

    return sockets !== undefined && sockets.size > 0;
  }

  /**
   * Розсилка події всім сокетам користувача (call:incoming, call:accepted, ...).
   */
  public notify(toUserId: number, event: string, payload: unknown): void {
    const server = this.server;

    if (!server) {
      return;
    }

    const socketIds = this.online.get(toUserId);

    if (!socketIds) {
      return;
    }

    for (const socketId of socketIds) {
      server.to(socketId).emit(event, payload);
    }
  }

  public async handleConnection(client: ClientWithUser): Promise<void> {
    const auth = client.handshake.auth as HandshakeAuth | undefined;
    const token = auth?.token;

    if (!token) {
      this.logger.warn('WS: підключення без токена — відхиляю');
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
      const sockets = this.online.get(userId) ?? new Set<string>();
      sockets.add(client.id);
      this.online.set(userId, sockets);
      client.emit('calls:connected', { userId });
    } catch (err) {
      this.logger.warn(`WS: автентифікація не пройшла — відхиляю: ${String(err)}`);
      client.disconnect(true);
    }
  }

  public handleDisconnect(client: ClientWithUser): void {
    const userId = client.data.userId;

    if (userId === undefined) {
      return;
    }

    const sockets = this.online.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(client.id);

    if (sockets.size === 0) {
      this.online.delete(userId);
    }
  }
}

import { Injectable } from '@nestjs/common';

type PresenceNode = {
  sockets: Set<string>;
  lastSeen: Date | null;
};

export type RegisterResult = {
  becameOnline: boolean;
};

export type UnregisterResult = {
  becameOffline: boolean;
  lastSeen: Date | null;
} | null;

/**
 * Спільний стан присутності для обох socket.io-namespace ('/' та '/chat').
 * Сокет-ідентифікатори співпадають по всій інстанції сервера, тому одна
 * мапа коректно об'єднує підключення з різних namespace.
 */
@Injectable()
export class PresenceService {
  private readonly presence = new Map<number, PresenceNode>();

  public register(userId: number, socketId: string): RegisterResult {
    const node = this.presence.get(userId) ?? {
      sockets: new Set<string>(),
      lastSeen: null,
    };

    node.sockets.add(socketId);
    this.presence.set(userId, node);

    return { becameOnline: node.sockets.size === 1 };
  }

  public unregister(userId: number, socketId: string): UnregisterResult {
    const node = this.presence.get(userId);

    if (!node) {
      return null;
    }

    node.sockets.delete(socketId);

    if (node.sockets.size > 0) {
      return { becameOffline: false, lastSeen: node.lastSeen };
    }

    node.lastSeen = new Date();

    return { becameOffline: true, lastSeen: node.lastSeen };
  }

  public isOnline(userId: number): boolean {
    const node = this.presence.get(userId);

    return node !== undefined && node.sockets.size > 0;
  }

  public getSocketIds(userId: number): string[] {
    const node = this.presence.get(userId);

    return node ? [...node.sockets] : [];
  }

  public getPresence(userId: number): { online: boolean; lastSeen: string | null } {
    const node = this.presence.get(userId);

    return {
      online: node !== undefined && node.sockets.size > 0,
      lastSeen: node?.lastSeen ? node.lastSeen.toISOString() : null,
    };
  }
}

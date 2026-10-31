import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

/**
 * Сервіс обгортки LiveKit: генерація join-токенів та керування кімнатами.
 * identity/room — унікальні технічні ідентифікатори без PII.
 */
@Injectable()
export class LiveKitService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  /** URL для клієнтських SDK (ws://) — потрапляє у відповідь REST. */
  private readonly publicUrl: string;
  /** URL для серверного RoomService API (http://) — всередині docker-мережі. */
  private readonly serverUrl: string;
  private roomClient?: RoomServiceClient;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('LIVEKIT_API_KEY', 'devkey');
    this.apiSecret = config.get<string>(
      'LIVEKIT_API_SECRET',
      'livekitlocaldevsecret001234567890abcdef',
    );
    // Зовнішній (клієнтський) LiveKit URL: у docker — зовсім порт хоста
    this.publicUrl = config.get<string>('LIVEKIT_PUBLIC_URL', 'ws://localhost:7880');
    // Внутрішній (серверний) LiveKit API URL: в docker-мережі сервіс livekit
    this.serverUrl = config.get<string>('LIVEKIT_SERVER_URL', 'http://localhost:7880');
  }

  public async createJoinToken(room: string, userId: number): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: `u${userId}`,
      ttl: '10m',
      metadata: JSON.stringify({ userId }),
    });

    token.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return token.toJwt();
  }

  public roomFor(userId: number): {
    identity: string;
  } {
    return { identity: `u${userId}` };
  }

  public getPublicUrl(): string {
    return this.publicUrl;
  }

  public async deleteRoom(room: string): Promise<void> {
    const client = this.getRoomClient();

    try {
      await client.deleteRoom(room);
    } catch {
      // Кімната вже видалена LiveKit-сервером (порожня через empty_timeout) — не критично
    }
  }

  private getRoomClient(): RoomServiceClient {
    this.roomClient ??= new RoomServiceClient(
      this.serverUrl,
      this.apiKey,
      this.apiSecret,
    );

    return this.roomClient;
  }
}

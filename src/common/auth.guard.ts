import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthClientGrpc } from '../module/auth/auth.grpc.js';

/**
 * Guard що перевіряє JWT через виклик Auth Service (Me RPC).
 * Якщо токен валідний — прикріплює user до request.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authClient: AuthClientGrpc) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: unknown }>();
    const authorization = request.headers['authorization'];

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен відсутній');
    }

    const token = authorization.slice(7);

    try {
      const user = await this.authClient.me({ accessToken: token });
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Токен недійсний або прострочений');
    }
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import {
  AuthServiceClient,
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  LogoutRequest,
  MeRequest,
  AuthResponse,
  TokensResponse,
  UserResponse,
} from '@tumy/mobile-chat-grpc/gen/auth.js';

@Injectable()
export class AuthClientGrpc implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  register(data: RegisterRequest): Promise<AuthResponse> {
    return firstValueFrom(this.authService.register(data));
  }

  login(data: LoginRequest): Promise<AuthResponse> {
    return firstValueFrom(this.authService.login(data));
  }

  refresh(data: RefreshRequest): Promise<TokensResponse> {
    return firstValueFrom(this.authService.refresh(data));
  }

  logout(data: LogoutRequest): Promise<object> {
    return firstValueFrom(this.authService.logout(data));
  }

  me(data: MeRequest): Promise<UserResponse> {
    return firstValueFrom(this.authService.me(data));
  }

  verifyCode(data: { email: string; code: number }): Promise<AuthResponse> {
    return firstValueFrom(this.extended.verifyCode(data));
  }

  updateNick(data: { accessToken: string; nick?: string }): Promise<UserResponse> {
    return firstValueFrom(this.extended.updateNick(data));
  }

  private get extended(): {
    verifyCode(data: unknown): Observable<AuthResponse>;
    updateNick(data: unknown): Observable<UserResponse>;
  } {
    return this.authService as unknown as {
      verifyCode(data: unknown): Observable<AuthResponse>;
      updateNick(data: unknown): Observable<UserResponse>;
    };
  }
}

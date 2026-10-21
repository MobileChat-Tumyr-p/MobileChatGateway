import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AuthServiceClient,
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  LogoutRequest,
  MeRequest,
  SaveCodeRequest,
  VerifyCodeRequest,
  UpdateNickRequest,
  SearchPeopleRequest,
  AuthResponse,
  TokensResponse,
  UserResponse,
  UserPreviewList,
  Empty,
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

  saveCode(data: SaveCodeRequest): Promise<Empty> {
    return firstValueFrom(this.authService.saveCode(data));
  }

  verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
    return firstValueFrom(this.authService.verifyCode(data));
  }

  updateNick(data: UpdateNickRequest): Promise<UserResponse> {
    return firstValueFrom(this.authService.updateNick(data));
  }

  searchPeople(data: SearchPeopleRequest): Promise<UserPreviewList> {
    return firstValueFrom(this.authService.searchPeople(data));
  }
}

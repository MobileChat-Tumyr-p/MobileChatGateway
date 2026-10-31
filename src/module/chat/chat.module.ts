import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatClientGRCP } from './chat.grcp.js';
import { ChatGateway } from './chat.gateway.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AuthClientModule } from '../auth/auth.module.js';
import { PresenceModule } from '../presence/presence.module.js';

@Module({
  imports: [
    AuthClientModule,
    PresenceModule,
    ClientsModule.registerAsync([
      {
        name: 'CHAT_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'chat.v1',
            protoPath: [
              'node_modules/@tumy/mobile-chat-grpc/proto/chat.proto',
              'node_modules/@tumy/mobile-chat-grpc/proto/messages.proto',
            ],
            url: configService.getOrThrow<string>('URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CREATE_CHAT_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'create.v1',
            protoPath:
              'node_modules/@tumy/mobile-chat-grpc/proto/createChat.proto',
            url: configService.getOrThrow<string>('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatClientGRCP, ChatGateway],
})
export class ChatModule {}

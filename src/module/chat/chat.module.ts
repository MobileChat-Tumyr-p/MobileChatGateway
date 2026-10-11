import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatClientGRCP } from './chat.grcp.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CHAT_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'chat.v1',
            protoPath: 'node_modules/@tumy/mobile-chat-grpc/proto/chat.proto',
            url: configService.getOrThrow<string>('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatClientGRCP],
})
export class ChatModule {}

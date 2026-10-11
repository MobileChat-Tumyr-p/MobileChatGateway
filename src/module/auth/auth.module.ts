import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AuthClientGrpc } from './auth.grpc.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth.v1',
            protoPath: 'node_modules/@tumy/mobile-chat-grpc/proto/auth.proto',
            url: config.getOrThrow<string>('AUTH_SERVICE_URL'),
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthClientGrpc],
  exports: [AuthClientGrpc],
})
export class AuthClientModule {}

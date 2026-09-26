import { Module } from '@nestjs/common';
import { SendCodeController } from './send-code.controller.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SendCodeClientsGrpc} from './send-code.grcp.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'SEND_CODE_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'success.v1',
            protoPath:
              'node_modules/@tumy/mobile-chat-grpc/proto/successgmail.proto',
            url: configService.getOrThrow<string>('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [SendCodeController],
  providers: [SendCodeClientsGrpc],
})
export class SendCodeModule {}

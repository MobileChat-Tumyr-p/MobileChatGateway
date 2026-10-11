import { Module } from '@nestjs/common';
import { SendCodeController } from './send-code.controller.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SendCodeClientRmq } from './send-code.rmq.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MAIL_SERVICE_RMQ',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://guest:guest@localhost:5672',
              ),
            ],
            queue: 'mail_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [SendCodeController],
  providers: [SendCodeClientRmq],
  exports: [SendCodeClientRmq],
})
export class SendCodeModule {}

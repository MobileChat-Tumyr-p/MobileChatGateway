import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SendCodeModule } from './module/send-code/send-code.module.js';
import { SearchPeopleModule } from './module/search-people/search-people.module.js';
import { ChatModule } from './module/chat/chat.module.js';
import { AuthClientModule } from './module/auth/auth.module.js';
import { CallsModule } from './module/calls/calls.module.js';
import { PresenceModule } from './module/presence/presence.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Auth — тепер окремий мікросервіс, Gateway лише проксі через gRPC
    AuthClientModule,
    // Надсилання кодів на пошту — окремий мікросервіс (MobileChatBackend)
    SendCodeModule,
    // Пошук людей
    SearchPeopleModule,
    // Чати
    ChatModule,
    // Дзвінки: REST + WS сигналінг + LiveKit
    CallsModule,
    // Присутність (online/last seen) для обох WS-namespace
    PresenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
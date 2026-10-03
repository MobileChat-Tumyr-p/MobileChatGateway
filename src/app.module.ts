import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RegModule } from './reg/reg.module.js';
import { SingInModule } from './sing-in/sing-in.module.js';
import { SendCodeModule } from './module/send-code/send-code.module.js';
import { VerifyCodeModule } from './verify-code/verify-code.module.js';
import { SearchPeopleModule } from './module/search-people/search-people.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    RegModule,
    SingInModule,
    SendCodeModule,
    VerifyCodeModule,
    SearchPeopleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
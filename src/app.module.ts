import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RegModule } from './reg/reg.module.js';
import { SingInModule } from './sing-in/sing-in.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RegModule,
    SingInModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
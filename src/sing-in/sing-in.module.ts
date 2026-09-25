import { Module } from '@nestjs/common';
import { SingInService } from './sing-in.service.js';
import { SingInController } from './sing-in.controller.js';

@Module({
  controllers: [SingInController],
  providers: [SingInService],
})
export class SingInModule {}

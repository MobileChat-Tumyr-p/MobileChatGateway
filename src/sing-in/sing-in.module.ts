import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { SingInService } from './sing-in.service.js';
import { SingInController } from './sing-in.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [SingInController],
  providers: [SingInService],
})
export class SingInModule {}

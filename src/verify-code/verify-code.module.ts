import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { VerifyCodeService } from './verify-code.service.js';
import { VerifyCodeController } from './verify-code.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [VerifyCodeController],
  providers: [VerifyCodeService],
})
export class VerifyCodeModule {}

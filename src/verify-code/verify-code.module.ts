import { Module } from '@nestjs/common';
import { VerifyCodeService } from './verify-code.service.js';
import { VerifyCodeController } from './verify-code.controller.js';

@Module({
  controllers: [VerifyCodeController],
  providers: [VerifyCodeService],
})
export class VerifyCodeModule {}

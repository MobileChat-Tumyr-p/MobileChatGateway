import { Module } from '@nestjs/common';

import { AuthClientModule } from '../auth/auth.module.js';
import { CallsController } from './calls.controller.js';
import { CallsGateway } from './calls.gateway.js';
import { CallsService } from './calls.service.js';
import { LiveKitService } from './livekit.service.js';

@Module({
  imports: [AuthClientModule],
  controllers: [CallsController],
  providers: [LiveKitService, CallsGateway, CallsService],
  exports: [LiveKitService],
})
export class CallsModule {}

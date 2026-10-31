import { Module } from '@nestjs/common';

import { AuthClientModule } from '../auth/auth.module.js';
import { PresenceController } from './presence.controller.js';
import { PresenceService } from './presence.service.js';

@Module({
  imports: [AuthClientModule],
  controllers: [PresenceController],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}

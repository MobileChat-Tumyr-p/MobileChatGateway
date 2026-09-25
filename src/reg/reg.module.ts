import { Module } from '@nestjs/common';
import { RegService } from './reg.service.js';
import { RegController } from './reg.controller.js';

@Module({
  controllers: [RegController],
  providers: [RegService],
})
export class RegModule {}

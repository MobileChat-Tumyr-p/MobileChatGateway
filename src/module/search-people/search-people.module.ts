import { Module } from '@nestjs/common';
import { SearchPeopleService } from './search-people.service.js';
import { SearchPeopleController } from './search-people.controller.js';
import { AuthClientModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthClientModule],
  controllers: [SearchPeopleController],
  providers: [SearchPeopleService],
})
export class SearchPeopleModule {}

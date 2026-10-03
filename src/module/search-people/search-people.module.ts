import { Module } from '@nestjs/common';
import { SearchPeopleService } from './search-people.service.js';
import { SearchPeopleController } from './search-people.controller.js';

@Module({
  controllers: [SearchPeopleController],
  providers: [SearchPeopleService],
})
export class SearchPeopleModule {}

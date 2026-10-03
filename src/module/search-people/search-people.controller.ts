import { Controller } from '@nestjs/common';
import { SearchPeopleService } from './search-people.service.js';

@Controller()
export class SearchPeopleController {
  constructor(private readonly searchPeopleService: SearchPeopleService) {}
}

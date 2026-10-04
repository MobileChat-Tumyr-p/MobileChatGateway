import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { SearchPeopleDTO } from './dto/index.js';
import { SearchPeopleService } from './search-people.service.js';

@ApiTags('search-people')
@Controller('search-people')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchPeopleController {
  constructor(private readonly searchPeopleService: SearchPeopleService) {}

  @Get()
  search(@Query() dto: SearchPeopleDTO) {
    return this.searchPeopleService.search(dto.nick);
  }
}
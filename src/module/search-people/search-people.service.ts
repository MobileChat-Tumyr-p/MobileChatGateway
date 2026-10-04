import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SearchPeopleService {
  public constructor(private readonly prisma: PrismaService) {}

  public async search(nick: string) {
    return this.prisma.user.findMany({
      where: {
        confirmed: true,
        nick: {
          contains: nick.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        nick: true,
      },
      orderBy: {
        nick: 'asc',
      },
      take: 20,
    });
  }
}
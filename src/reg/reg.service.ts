import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegDto } from './dto/reg.dto.js';

@Injectable()
export class RegService {
  constructor(private readonly prisma: PrismaService) {}

  async register({ name, nick, email, password }: RegDto) {
    const [emailTaken, nickTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { nick } }),
    ]);

    if (emailTaken) {
      throw new ConflictException('Ця пошта вже зареєстрована');
    }

    if (nickTaken) {
      throw new ConflictException('Цей нік вже зайнятий');
    }

    try {
      const user = await this.prisma.user.create({
        data: { name, nick, email, password },
      });

      const { password: _password, ...result } = user;
      return result;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Пошта або нік вже зайняті');
      }
      throw err;
    }
  }
}

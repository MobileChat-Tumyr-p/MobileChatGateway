import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegDto } from './dto/reg.dto.js';

@Injectable()
export class RegService {
  constructor(private readonly prisma: PrismaService) {}

  async register({ name, email, password }: RegDto) {
    try {
      const user = await this.prisma.user.create({
        data: { name, email, password },
      });

      const { password: _password, ...result } = user;
      return result;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Ця пошта вже зареєстрована');
      }
      throw err;
    }
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { SingInDto } from './dto/sing-in.dto.js';

@Injectable()
export class SingInService {
  constructor(private prisma: PrismaService) {}

  async signIn({ name, password }: SingInDto) {
    const user = await this.prisma.user.findFirst({ where: { name } });

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Невірне ім\'я або пароль');
    }

    const { password: _password, ...result } = user;
    return result;
  }
}
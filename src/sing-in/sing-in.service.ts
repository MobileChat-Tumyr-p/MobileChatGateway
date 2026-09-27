import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SingInDto } from './dto/sing-in.dto.js';

@Injectable()
export class SingInService {
  constructor(
    private prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async signIn({ name, password }: SingInDto) {
    const user = await this.prisma.user.findFirst({ where: { name } });

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Невірне ім\'я або пароль');
    }

    if (!user.confirmed) {
      throw new UnauthorizedException('Пошту не підтверджено');
    }

    const accessToken = await this.auth.issueToken(user);

    const { password: _password, ...result } = user;
    return { ...result, accessToken };
  }
}
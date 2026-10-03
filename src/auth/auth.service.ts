import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service.js';

export type JwtPayload = {
  sub: number;
  name: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  public issueToken(user: { id: number; name: string; email: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return this.jwt.signAsync(payload);
  }

  public async updateNick(userId: number, nick: string) {
    const [current, taken] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { nick } }),
    ]);

    if (!current) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (taken && taken.id !== userId) {
      throw new ConflictException('Цей нік вже зайнятий');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { nick },
    });

    const { password: _password, ...result } = user;
    return result;
  }
}

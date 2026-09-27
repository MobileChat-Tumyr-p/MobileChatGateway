import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VerifyCodeDTO } from './dto/verify-code.dto.js';

@Injectable()
export class VerifyCodeService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  public async verify({ email, code }: VerifyCodeDTO) {
    const record = await this.prisma.userCode.findUnique({
      where: { userEmail: email },
    });

    if (!record) {
      throw new NotFoundException('Код не знайдено, запроси новий');
    }

    if (record.succsesCode !== code) {
      throw new BadRequestException('Невірний код');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    await this.prisma.user.update({
      where: { email },
      data: { confirmed: true },
    });
    await this.prisma.userCode.delete({ where: { userEmail: email } });

    const accessToken = await this.auth.issueToken(user);

    return { success: true, email, accessToken };
  }
}
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { VerifyCodeDTO } from './dto/verify-code.dto.js';

@Injectable()
export class VerifyCodeService {
  public constructor(private readonly prisma: PrismaService) {}

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

    return { success: true, email };
  }
}
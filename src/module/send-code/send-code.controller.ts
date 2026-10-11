import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SendCodeClientsGrpc } from './send-code.grcp.js';
import { SendCodeDTO } from './dto/SendCode.dto.js';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service.js';

@Controller()
export class SendCodeController {
  public constructor(
    private readonly client: SendCodeClientsGrpc,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.OK)
  public async sendCode(@Body() data: SendCodeDTO) {
    const { code } = await firstValueFrom(this.client.sendSuccess(data));

    await this.prisma.userCode.upsert({
      where: { userEmail: data.email },
      create: {
        userEmail: data.email,
        succsesCode: code,
      },
      update: {
        succsesCode: code,
      },
    });

    return { code };
  }
}
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
    const { code } = await firstValueFrom(this.client.SendSuccess(data));

    await this.prisma.userCode.create({
      data: {
        userEmail: data.email,
        succsesCode: code,
      },
    });

    return { code };
  }
}
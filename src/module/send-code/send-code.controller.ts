import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SendCodeClientRmq } from './send-code.rmq.js';
import { SendCodeDTO } from './dto/SendCode.dto.js';
import { AuthClientGrpc } from '../auth/auth.grpc.js';

@Controller()
export class SendCodeController {
  public constructor(
    private readonly client: SendCodeClientRmq,
    private readonly authClient: AuthClientGrpc,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.OK)
  public async sendCode(@Body() data: SendCodeDTO) {
    const { code } = await this.client.sendCode(data);

    await this.authClient.saveCode({ email: data.email, code });

    return { code };
  }
}
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface SendCodeRequest {
  email: string;
}

export interface SendCodeResponse {
  code: number;
}

@Injectable()
export class SendCodeClientRmq {
  public constructor(
    @Inject('MAIL_SERVICE_RMQ') private readonly client: ClientProxy,
  ) {}

  public async sendCode(data: SendCodeRequest): Promise<SendCodeResponse> {
    return firstValueFrom(
      this.client.send<SendCodeResponse, SendCodeRequest>('send_code', data),
    );
  }
}

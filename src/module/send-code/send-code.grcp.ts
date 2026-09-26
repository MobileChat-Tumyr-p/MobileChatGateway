import { Inject, Injectable } from '@nestjs/common';

import {
  SendSuccessRequest,
  SuccessServiceClient,
} from '@tumy/mobile-chat-grpc/gen/successgmail.js';

import type { ClientGrpc } from "@nestjs/microservices"

@Injectable()
export class SendCodeClientsGrpc {
  private sendCodeService: SuccessServiceClient;

  public constructor(
    @Inject('SEND_CODE_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  public onModuleInit() {
    this.sendCodeService =
      this.client.getService<SuccessServiceClient>('SuccessService');
  }

  public SendSuccess(request:SendSuccessRequest){
    return this.sendCodeService.sendSuccess(request);
  }
} 

import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthClientGrpc } from './auth.grpc.js';
import { VerifyCodeDto } from './dto/verify-code.dto.js';
import { UpdateNickDto } from './dto/update-nick.dto.js';

@ApiTags('auth')
@Controller()
export class AuthAccountController {
  constructor(private readonly authClient: AuthClientGrpc) {}

  // POST /verify-code
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authClient.verifyCode({ email: dto.email, code: dto.code });
  }

  // PATCH /me/nick
  @Patch('me/nick')
  @ApiBearerAuth()
  async updateNick(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: UpdateNickDto,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен відсутній');
    }
    const accessToken = authorization.slice(7);
    return this.authClient.updateNick({ accessToken, nick: dto.nick });
  }
}

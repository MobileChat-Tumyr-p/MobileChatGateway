import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type JwtPayload = {
  sub: number;
  name: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  public issueToken(user: { id: number; name: string; email: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return this.jwt.signAsync(payload);
  }
}

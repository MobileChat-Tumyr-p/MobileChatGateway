import { Injectable } from '@nestjs/common';

import { AuthClientGrpc } from '../auth/auth.grpc.js';

@Injectable()
export class SearchPeopleService {
  public constructor(private readonly authClient: AuthClientGrpc) {}

  public async search(nick: string) {
    const result = await this.authClient.searchPeople({ nick: nick.trim() });

    return result.users;
  }
}
